import { NextResponse } from 'next/server';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { z } from 'zod';
import { BackendApiError, backendFetch } from '@/lib/api/backend';
import {
  bffErrorResponse,
  readJsonBody,
  refreshTokens,
  withSession,
  clearRefreshCache,
  ROTATION_REUSE_WINDOW_MS,
} from '@/lib/api/bff';
import { AUTH_COOKIE } from '@/lib/auth/cookies';

const cookieJar = new Map<string, string>();
const mockCookieStore = {
  get: vi.fn((name: string) => {
    const value = cookieJar.get(name);
    return value === undefined ? undefined : { name, value };
  }),
};

vi.mock('next/headers', () => ({
  cookies: vi.fn(async () => mockCookieStore),
}));

vi.mock('@/lib/api/backend', () => ({
  backendFetch: vi.fn(),
  BackendApiError: class BackendApiError extends Error {
    constructor(
      message: string,
      public status: number,
      public body?: unknown
    ) {
      super(message);
      this.name = 'BackendApiError';
    }
  },
}));

const TAG = 'test/tag';
const FALLBACK = 'Falha genérica';
const SESSION_EXPIRED = 'Sua sessão expirou. Entre novamente para continuar.';

const b64url = (value: object) => Buffer.from(JSON.stringify(value)).toString('base64url');
const jwt = (claims: Record<string, unknown>) =>
  `${b64url({ alg: 'HS256', typ: 'JWT' })}.${b64url(claims)}.signature`;
const nowSeconds = () => Math.floor(Date.now() / 1000);
const freshToken = (sub = 'usr-1') => jwt({ sub, role: 'MISSIONARY', exp: nowSeconds() + 900 });
const expiringToken = (sub = 'usr-1') => jwt({ sub, role: 'MISSIONARY', exp: nowSeconds() + 2 });

const NEW_TOKENS = { accessToken: 'new-access', refreshToken: 'new-refresh' };

function setSession(accessToken?: string, refreshToken?: string) {
  cookieJar.clear();
  if (accessToken) cookieJar.set(AUTH_COOKIE.accessToken, accessToken);
  if (refreshToken) cookieJar.set(AUTH_COOKIE.refreshToken, refreshToken);
}

const unauthorized = () => new BackendApiError('Erro na API (401)', 401, 'Unauthorized access');

type FetchOptions = { method?: string; body?: unknown; accessToken?: string };

/** Routes `/auth/refresh` to `refresh`; any other path is unexpected here. */
function mockRefresh(refresh: (options: FetchOptions) => unknown) {
  vi.mocked(backendFetch).mockImplementation(async (path: string, options?: FetchOptions) => {
    if (path === '/auth/refresh') return refresh(options ?? {});
    throw new Error(`Unexpected backend call: ${path}`);
  });
}

const refreshCalls = () =>
  vi.mocked(backendFetch).mock.calls.filter(([path]) => path === '/auth/refresh');

function expectCookiesCleared(response: Response) {
  const setCookie = response.headers.getSetCookie();
  expect(setCookie).toHaveLength(2);
  expect(setCookie).toEqual(
    expect.arrayContaining([
      expect.stringMatching(/^ma_access_token=;.*Max-Age=0/),
      expect.stringMatching(/^ma_refresh_token=;.*Max-Age=0/),
    ])
  );
}

function expectCookiesRewritten(response: Response, tokens = NEW_TOKENS) {
  const setCookie = response.headers.getSetCookie();
  expect(setCookie).toHaveLength(2);
  expect(setCookie).toEqual(
    expect.arrayContaining([
      expect.stringMatching(new RegExp(`^ma_access_token=${tokens.accessToken};.*Max-Age=1200`)),
      expect.stringMatching(
        new RegExp(`^ma_refresh_token=${tokens.refreshToken};.*Max-Age=604800`)
      ),
    ])
  );
  expect(setCookie.join('\n')).toMatch(/HttpOnly/);
}

const okHandler = () => vi.fn(async (token: string) => NextResponse.json({ data: { token } }));

beforeEach(() => {
  clearRefreshCache();
  vi.mocked(backendFetch).mockReset();
  mockCookieStore.get.mockClear();
  cookieJar.clear();
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('refreshTokens', () => {
  it('posts the refresh token to /auth/refresh and returns the new pair', async () => {
    mockRefresh(() => ({ data: NEW_TOKENS }));

    await expect(refreshTokens('rt-single')).resolves.toEqual(NEW_TOKENS);
    expect(backendFetch).toHaveBeenCalledWith('/auth/refresh', {
      method: 'POST',
      body: { refreshToken: 'rt-single' },
    });
  });

  it('shares one backend call between concurrent refreshes of the same token', async () => {
    let resolve!: (value: unknown) => void;
    vi.mocked(backendFetch).mockReturnValue(new Promise((r) => (resolve = r)));

    const first = refreshTokens('rt-shared');
    const second = refreshTokens('rt-shared');
    expect(second).toBe(first);

    resolve({ data: NEW_TOKENS });
    await expect(Promise.all([first, second])).resolves.toEqual([NEW_TOKENS, NEW_TOKENS]);
    expect(backendFetch).toHaveBeenCalledTimes(1);
  });

  it('does not share calls between different refresh tokens', async () => {
    mockRefresh(({ body }) => ({
      data: {
        accessToken: `access-for-${(body as { refreshToken: string }).refreshToken}`,
        refreshToken: 'x',
      },
    }));

    const [a, b] = await Promise.all([refreshTokens('rt-a'), refreshTokens('rt-b')]);
    expect(a.accessToken).toBe('access-for-rt-a');
    expect(b.accessToken).toBe('access-for-rt-b');
    expect(backendFetch).toHaveBeenCalledTimes(2);
  });

  it('hands a just-rotated token to a late request instead of replaying it', async () => {
    mockRefresh(() => ({ data: NEW_TOKENS }));
    await refreshTokens('rt-again');
    await expect(refreshTokens('rt-again')).resolves.toEqual(NEW_TOKENS);
    expect(backendFetch).toHaveBeenCalledTimes(1);
  });

  it('calls the backend again once the reuse window is over', async () => {
    const now = vi.spyOn(Date, 'now');
    mockRefresh(() => ({ data: NEW_TOKENS }));
    now.mockReturnValue(1_000);
    await refreshTokens('rt-window');
    now.mockReturnValue(1_000 + ROTATION_REUSE_WINDOW_MS + 1);
    await refreshTokens('rt-window');
    expect(backendFetch).toHaveBeenCalledTimes(2);
    now.mockRestore();
  });

  it('forgets a failed refresh as well', async () => {
    vi.mocked(backendFetch)
      .mockRejectedValueOnce(unauthorized())
      .mockResolvedValueOnce({ data: NEW_TOKENS });

    await expect(refreshTokens('rt-fail')).rejects.toBeInstanceOf(BackendApiError);
    await expect(refreshTokens('rt-fail')).resolves.toEqual(NEW_TOKENS);
    expect(backendFetch).toHaveBeenCalledTimes(2);
  });
});

describe('readJsonBody', () => {
  it('reports zod validation messages in Portuguese', async () => {
    const { z } = await import('zod');
    const result = await readJsonBody(
      new Request('http://x', { method: 'POST', body: JSON.stringify({ name: 'a' }) }),
      z.object({ name: z.string().min(3) }),
      'Dados inválidos'
    );
    expect(result.ok).toBe(false);
    if (!result.ok) {
      const body = await result.response.json();
      expect(body.fieldErrors.name).toMatch(/pequeno|caracteres/i);
    }
  });
});

describe('bffErrorResponse', () => {
  it('keeps the backend status and normalizes Vine field errors', async () => {
    const error = new BackendApiError('Validation failure', 422, {
      errors: [{ field: 'username', message: 'too long', rule: 'maxLength', meta: { max: 32 } }],
    });

    const response = bffErrorResponse(error, FALLBACK, TAG);

    expect(response.status).toBe(422);
    await expect(response.json()).resolves.toEqual({
      message: 'Use no máximo 32 caracteres.',
      fieldErrors: { username: 'Use no máximo 32 caracteres.' },
    });
  });

  it('maps the plain-text 401 body to the pt-BR session message', async () => {
    const response = bffErrorResponse(unauthorized(), FALLBACK, TAG);

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({ message: SESSION_EXPIRED });
  });

  it('answers 502 with the fallback for non-backend errors and logs the tag', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    const boom = new TypeError('fetch failed');

    const response = bffErrorResponse(boom, FALLBACK, TAG);

    expect(response.status).toBe(502);
    await expect(response.json()).resolves.toEqual({ message: FALLBACK });
    expect(consoleError).toHaveBeenCalledWith(`[${TAG}]`, boom);
  });
});

describe('readJsonBody', () => {
  const schema = z.object({
    name: z.string().trim().min(1, 'Nome obrigatório').max(5, 'Nome longo'),
    age: z.number().int().optional(),
    address: z.object({ city: z.string().min(1, 'Cidade obrigatória') }).optional(),
  });

  const request = (body: string) =>
    new Request('http://localhost/api/test', { method: 'POST', body });

  it('returns the parsed (trimmed) data on success', async () => {
    const result = await readJsonBody(
      request(JSON.stringify({ name: '  Ana ' })),
      schema,
      'Inválido'
    );
    expect(result).toEqual({ ok: true, data: { name: 'Ana' } });
  });

  it('answers 400 when the body is not valid JSON', async () => {
    const result = await readJsonBody(request('{not json'), schema, 'Inválido');

    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.response.status).toBe(400);
    await expect(result.response.json()).resolves.toEqual({ message: 'JSON inválido' });
  });

  it('answers 422 with the first message per top-level field', async () => {
    const result = await readJsonBody(
      request(JSON.stringify({ name: '', age: 1.5, address: { city: '' } })),
      schema,
      'Dados inválidos'
    );

    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.response.status).toBe(422);
    const body = await result.response.json();
    expect(body.message).toBe('Dados inválidos');
    expect(body.fieldErrors.name).toBe('Nome obrigatório');
    expect(body.fieldErrors.address).toBe('Cidade obrigatória');
    expect(typeof body.fieldErrors.age).toBe('string');
    expect(Object.keys(body.fieldErrors).sort()).toEqual(['address', 'age', 'name']);
  });

  it('answers 422 with empty fieldErrors when the root itself is invalid', async () => {
    const result = await readJsonBody(request('null'), schema, 'Dados inválidos');

    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.response.status).toBe(422);
    await expect(result.response.json()).resolves.toEqual({
      message: 'Dados inválidos',
      fieldErrors: {},
    });
  });
});

describe('withSession', () => {
  it('answers 401 and clears cookies when there is no session at all', async () => {
    const handler = okHandler();

    const response = await withSession(TAG, FALLBACK, handler);

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({ message: SESSION_EXPIRED });
    expectCookiesCleared(response);
    expect(handler).not.toHaveBeenCalled();
    expect(backendFetch).not.toHaveBeenCalled();
  });

  it('runs the handler with a valid access token without refreshing or touching cookies', async () => {
    const token = freshToken();
    setSession(token, 'rt-valid');
    const handler = okHandler();

    const response = await withSession(TAG, FALLBACK, handler);

    expect(response.status).toBe(200);
    expect(handler).toHaveBeenCalledExactlyOnceWith(token);
    expect(backendFetch).not.toHaveBeenCalled();
    expect(response.headers.getSetCookie()).toEqual([]);
  });

  it('does not refresh proactively when the token carries no exp claim', async () => {
    const token = jwt({ sub: 'usr-1' });
    setSession(token, 'rt-noexp');
    const handler = okHandler();

    const response = await withSession(TAG, FALLBACK, handler);

    expect(response.status).toBe(200);
    expect(handler).toHaveBeenCalledWith(token);
    expect(backendFetch).not.toHaveBeenCalled();
  });

  it('refreshes when the access cookie is missing and rewrites both cookies', async () => {
    setSession(undefined, 'rt-missing-access');
    mockRefresh(() => ({ data: NEW_TOKENS }));
    const handler = okHandler();

    const response = await withSession(TAG, FALLBACK, handler);

    expect(response.status).toBe(200);
    expect(backendFetch).toHaveBeenCalledWith('/auth/refresh', {
      method: 'POST',
      body: { refreshToken: 'rt-missing-access' },
    });
    expect(handler).toHaveBeenCalledExactlyOnceWith('new-access');
    expectCookiesRewritten(response);
  });

  it('answers 401 and clears cookies when the access cookie is missing and refresh fails', async () => {
    setSession(undefined, 'rt-revoked');
    mockRefresh(() => {
      throw unauthorized();
    });
    const handler = okHandler();

    const response = await withSession(TAG, FALLBACK, handler);

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({ message: SESSION_EXPIRED });
    expectCookiesCleared(response);
    expect(handler).not.toHaveBeenCalled();
  });

  it('refreshes proactively when the access token is about to expire', async () => {
    setSession(expiringToken(), 'rt-expiring');
    mockRefresh(() => ({ data: NEW_TOKENS }));
    const handler = okHandler();

    const response = await withSession(TAG, FALLBACK, handler);

    expect(response.status).toBe(200);
    expect(refreshCalls()).toHaveLength(1);
    expect(handler).toHaveBeenCalledExactlyOnceWith('new-access');
    expectCookiesRewritten(response);
  });

  it('falls back to the current token when a proactive refresh fails', async () => {
    const token = expiringToken();
    setSession(token, 'rt-proactive-fail');
    mockRefresh(() => {
      throw unauthorized();
    });
    const handler = okHandler();

    const response = await withSession(TAG, FALLBACK, handler);

    expect(response.status).toBe(200);
    expect(handler).toHaveBeenCalledExactlyOnceWith(token);
    expect(response.headers.getSetCookie()).toEqual([]);
  });

  it('retries once with refreshed tokens when the backend answers 401', async () => {
    const token = freshToken();
    setSession(token, 'rt-retry');
    mockRefresh(() => ({ data: NEW_TOKENS }));
    const handler = vi.fn(async (accessToken: string) => {
      if (accessToken === token) throw unauthorized();
      return NextResponse.json({ data: { ok: true } });
    });

    const response = await withSession(TAG, FALLBACK, handler);

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ data: { ok: true } });
    expect(handler).toHaveBeenCalledTimes(2);
    expect(handler).toHaveBeenNthCalledWith(1, token);
    expect(handler).toHaveBeenNthCalledWith(2, 'new-access');
    expect(refreshCalls()).toHaveLength(1);
    expectCookiesRewritten(response);
  });

  it('answers 401 and clears cookies when the refresh after a 401 fails', async () => {
    setSession(freshToken(), 'rt-dead');
    mockRefresh(() => {
      throw unauthorized();
    });
    const handler = vi.fn(async () => {
      throw unauthorized();
    });

    const response = await withSession(TAG, FALLBACK, handler);

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({ message: SESSION_EXPIRED });
    expectCookiesCleared(response);
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('answers 401 without refreshing when a 401 arrives and there is no refresh token', async () => {
    setSession(freshToken());
    const handler = vi.fn(async () => {
      throw unauthorized();
    });

    const response = await withSession(TAG, FALLBACK, handler);

    expect(response.status).toBe(401);
    expectCookiesCleared(response);
    expect(backendFetch).not.toHaveBeenCalled();
  });

  it('retries only once: a second 401 ends the session', async () => {
    setSession(freshToken(), 'rt-twice');
    mockRefresh(() => ({ data: NEW_TOKENS }));
    const handler = vi.fn(async () => {
      throw unauthorized();
    });

    const response = await withSession(TAG, FALLBACK, handler);

    expect(response.status).toBe(401);
    expect(handler).toHaveBeenCalledTimes(2);
    expect(refreshCalls()).toHaveLength(1);
    expectCookiesCleared(response);
    expect(response.headers.getSetCookie().join('\n')).not.toContain('new-access');
  });

  it('does not refresh twice when the proactively refreshed token is rejected', async () => {
    setSession(expiringToken(), 'rt-proactive-401');
    mockRefresh(() => ({ data: NEW_TOKENS }));
    const handler = vi.fn(async () => {
      throw unauthorized();
    });

    const response = await withSession(TAG, FALLBACK, handler);

    expect(response.status).toBe(401);
    expect(refreshCalls()).toHaveLength(1);
    expect(handler).toHaveBeenCalledExactlyOnceWith('new-access');
    expectCookiesCleared(response);
  });

  it('maps non-401 backend errors through toBffError and keeps cookies untouched', async () => {
    setSession(freshToken(), 'rt-422');
    const handler = vi.fn(async () => {
      throw new BackendApiError('Nome de usuário já está em uso', 422, {
        message: 'Nome de usuário já está em uso',
      });
    });

    const response = await withSession(TAG, FALLBACK, handler);

    expect(response.status).toBe(422);
    await expect(response.json()).resolves.toEqual({
      message: 'Nome de usuário já está em uso',
      fieldErrors: { username: 'Nome de usuário já está em uso' },
    });
    expect(response.headers.getSetCookie()).toEqual([]);
  });

  it('still persists rotated tokens when the handler fails with a non-401 error', async () => {
    setSession(expiringToken(), 'rt-rotated');
    mockRefresh(() => ({ data: NEW_TOKENS }));
    const handler = vi.fn(async () => {
      throw new BackendApiError('Forbidden', 403, { message: 'Forbidden' });
    });

    const response = await withSession(TAG, FALLBACK, handler);

    expect(response.status).toBe(403);
    expectCookiesRewritten(response);
  });

  it('answers 502 with the fallback message for unexpected handler errors', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    setSession(freshToken(), 'rt-502');
    const boom = new Error('network down');
    const handler = vi.fn(async () => {
      throw boom;
    });

    const response = await withSession(TAG, FALLBACK, handler);

    expect(response.status).toBe(502);
    await expect(response.json()).resolves.toEqual({ message: FALLBACK });
    expect(consoleError).toHaveBeenCalledWith(`[${TAG}]`, boom);
  });

  it('logs unexpected refresh failures and answers 401', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    setSession(undefined, 'rt-network');
    const boom = new TypeError('fetch failed');
    mockRefresh(() => {
      throw boom;
    });

    const response = await withSession(TAG, FALLBACK, okHandler());

    expect(response.status).toBe(401);
    expectCookiesCleared(response);
    expect(consoleError).toHaveBeenCalledWith(`[${TAG}] refresh`, boom);
  });

  it('does not log expected (backend) refresh failures', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    setSession(undefined, 'rt-expected');
    mockRefresh(() => {
      throw unauthorized();
    });

    await withSession(TAG, FALLBACK, okHandler());

    expect(consoleError).not.toHaveBeenCalled();
  });

  it('dedupes the refresh across concurrent requests sharing the same refresh token', async () => {
    setSession(expiringToken(), 'rt-concurrent');
    let resolve!: (value: unknown) => void;
    vi.mocked(backendFetch).mockReturnValue(new Promise((r) => (resolve = r)));
    const handlerA = okHandler();
    const handlerB = okHandler();

    const pending = Promise.all([
      withSession(TAG, FALLBACK, handlerA),
      withSession(TAG, FALLBACK, handlerB),
    ]);
    await vi.waitFor(() => expect(backendFetch).toHaveBeenCalled());
    resolve({ data: NEW_TOKENS });
    const [a, b] = await pending;

    expect(backendFetch).toHaveBeenCalledTimes(1);
    expect(handlerA).toHaveBeenCalledWith('new-access');
    expect(handlerB).toHaveBeenCalledWith('new-access');
    expectCookiesRewritten(a);
    expectCookiesRewritten(b);
  });
});
