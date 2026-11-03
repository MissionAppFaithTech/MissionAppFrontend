import { beforeEach, describe, expect, it, vi } from 'vitest';
import { PATCH } from './route';
import { BackendApiError, backendFetch } from '@/lib/api/backend';
import { AUTH_COOKIE } from '@/lib/auth/cookies';
import { clearRefreshCache } from '@/lib/api/bff';

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

const b64url = (value: object) => Buffer.from(JSON.stringify(value)).toString('base64url');
const jwt = (claims: Record<string, unknown>) =>
  `${b64url({ alg: 'HS256', typ: 'JWT' })}.${b64url(claims)}.sig`;
const ACCESS = jwt({ sub: 'usr-1', role: 'MISSIONARY', exp: Math.floor(Date.now() / 1000) + 900 });
const NEW_TOKENS = { accessToken: 'new-access', refreshToken: 'new-refresh' };

function setSession(accessToken?: string, refreshToken?: string) {
  cookieJar.clear();
  if (accessToken) cookieJar.set(AUTH_COOKIE.accessToken, accessToken);
  if (refreshToken) cookieJar.set(AUTH_COOKIE.refreshToken, refreshToken);
}

type FetchOptions = { method?: string; body?: unknown; accessToken?: string };
type RouteHandler = (options: FetchOptions) => unknown;

/** Routes mocked backend calls by `"<METHOD> <path>"`; unknown routes fail the test. */
function mockBackend(routes: Record<string, RouteHandler>) {
  vi.mocked(backendFetch).mockImplementation(async (path: string, options: FetchOptions = {}) => {
    const handler = routes[`${options.method ?? 'GET'} ${path}`];
    if (!handler) throw new Error(`Unexpected backend call: ${options.method ?? 'GET'} ${path}`);
    return handler(options);
  });
}

const unauthorized = () => new BackendApiError('Erro na API (401)', 401, 'Unauthorized access');
const refreshOk = () => ({ data: NEW_TOKENS });
/** Rejects the original token with the backend's plain-text 401, accepts the refreshed one. */
const onlyNewToken =
  (result: unknown): RouteHandler =>
  ({ accessToken }) => {
    if (accessToken !== NEW_TOKENS.accessToken) throw unauthorized();
    return result;
  };

function expectCookiesCleared(response: Response) {
  const setCookie = response.headers.getSetCookie();
  expect(setCookie).toEqual(
    expect.arrayContaining([
      expect.stringMatching(/^ma_access_token=;.*Max-Age=0/),
      expect.stringMatching(/^ma_refresh_token=;.*Max-Age=0/),
    ])
  );
}

function expectCookiesRewritten(response: Response) {
  const setCookie = response.headers.getSetCookie();
  expect(setCookie).toEqual(
    expect.arrayContaining([
      expect.stringMatching(/^ma_access_token=new-access;.*Max-Age=1200/),
      expect.stringMatching(/^ma_refresh_token=new-refresh;.*Max-Age=604800/),
    ])
  );
}

const user = {
  id: 'usr-1',
  fullName: 'Pr. Carlos Oliveira',
  username: 'pr_carlos',
  email: 'carlos@example.com',
  phoneNumber: '+5511999999999',
  biography: 'Plantador de igrejas no sertão',
  profilePictureId: null,
  role: 'MISSIONARY',
};

beforeEach(() => {
  clearRefreshCache();
  vi.mocked(backendFetch).mockReset();
  mockCookieStore.get.mockClear();
  setSession(ACCESS, 'rt-1');
});

describe('PATCH /api/account/profile', () => {
  const patch = (body: unknown) =>
    PATCH(
      new Request('http://localhost:3000/api/account/profile', {
        method: 'PATCH',
        body: typeof body === 'string' ? body : JSON.stringify(body),
      })
    );

  const updated = { data: { user: { ...user, fullName: 'Carlos Silva' } } };

  it('rejects a username with a valid prefix followed by invalid characters', async () => {
    const res = await patch({ username: 'carlos_ok!' });

    expect(res.status).toBe(422);
    expect(backendFetch).not.toHaveBeenCalled();
  });

  it('answers 502 with the pt-BR fallback when saving and the backend is unreachable', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.mocked(backendFetch).mockRejectedValue(new TypeError('fetch failed'));

    const res = await patch({ fullName: 'Carlos Silva' });

    expect(res.status).toBe(502);
    await expect(res.json()).resolves.toEqual({ message: 'Não foi possível salvar o perfil' });
    expect(consoleError).toHaveBeenCalledWith('[api/account/profile PATCH]', expect.any(TypeError));
    consoleError.mockRestore();
  });

  it('answers 400 for invalid JSON before touching the session', async () => {
    const res = await patch('{oops');

    expect(res.status).toBe(400);
    await expect(res.json()).resolves.toEqual({ message: 'JSON inválido' });
    expect(backendFetch).not.toHaveBeenCalled();
    expect(mockCookieStore.get).not.toHaveBeenCalled();
  });

  it('answers 422 with fieldErrors for invalid fields', async () => {
    const res = await patch({ username: 'Carlos Silva', biography: 'x'.repeat(201) });

    expect(res.status).toBe(422);
    const body = await res.json();
    expect(body.message).toBe('Dados de perfil inválidos');
    expect(Object.keys(body.fieldErrors).sort()).toEqual(['biography', 'username']);
    expect(backendFetch).not.toHaveBeenCalled();
  });

  it('answers 422 for an empty fullName', async () => {
    const res = await patch({ fullName: '   ' });

    expect(res.status).toBe(422);
    expect((await res.json()).fieldErrors).toHaveProperty('fullName');
  });

  it('sends the trimmed fields to the backend and returns the updated user', async () => {
    mockBackend({ 'PATCH /account/profile': () => updated });

    const res = await patch({
      fullName: '  Carlos Silva ',
      username: 'carlos_silva',
      biography: ' Nova bio ',
    });

    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toEqual({ data: updated.data });
    expect(backendFetch).toHaveBeenCalledWith('/account/profile', {
      method: 'PATCH',
      accessToken: ACCESS,
      body: { fullName: 'Carlos Silva', username: 'carlos_silva', biography: 'Nova bio' },
    });
  });

  it('passes biography: null through to clear the mini-bio', async () => {
    mockBackend({ 'PATCH /account/profile': () => updated });

    const res = await patch({ biography: null });

    expect(res.status).toBe(200);
    expect(vi.mocked(backendFetch).mock.calls[0][1]).toMatchObject({ body: { biography: null } });
  });

  it('forwards only the provided fields and strips unknown ones', async () => {
    mockBackend({ 'PATCH /account/profile': () => updated });

    await patch({ fullName: 'Carlos Silva', role: 'ADMIN', email: 'x@y.com' });

    expect(vi.mocked(backendFetch).mock.calls[0][1]?.body).toEqual({ fullName: 'Carlos Silva' });
  });

  it('maps the backend "username taken" message to fieldErrors.username', async () => {
    mockBackend({
      'PATCH /account/profile': () => {
        throw new BackendApiError('Nome de usuário já está em uso', 422, {
          message: 'Nome de usuário já está em uso',
        });
      },
    });

    const res = await patch({ username: 'taken_name' });

    expect(res.status).toBe(422);
    await expect(res.json()).resolves.toEqual({
      message: 'Nome de usuário já está em uso',
      fieldErrors: { username: 'Nome de usuário já está em uso' },
    });
  });

  it('maps Vine 422 errors to localized fieldErrors', async () => {
    mockBackend({
      'PATCH /account/profile': () => {
        throw new BackendApiError('Validation failure', 422, {
          errors: [
            { field: 'fullName', message: 'too long', rule: 'maxLength', meta: { max: 255 } },
          ],
        });
      },
    });

    const res = await patch({ fullName: 'Carlos' });

    expect(res.status).toBe(422);
    await expect(res.json()).resolves.toEqual({
      message: 'Use no máximo 255 caracteres.',
      fieldErrors: { fullName: 'Use no máximo 255 caracteres.' },
    });
  });

  it('answers 401 for a valid body without a session', async () => {
    setSession();

    const res = await patch({ fullName: 'Carlos' });

    expect(res.status).toBe(401);
    expectCookiesCleared(res);
    expect(backendFetch).not.toHaveBeenCalled();
  });

  it('refreshes after a backend 401, retries and rewrites cookies', async () => {
    mockBackend({
      'POST /auth/refresh': refreshOk,
      'PATCH /account/profile': onlyNewToken(updated),
    });

    const res = await patch({ fullName: 'Carlos Silva' });

    expect(res.status).toBe(200);
    expect(vi.mocked(backendFetch).mock.calls.map(([path]) => path)).toEqual([
      '/account/profile',
      '/auth/refresh',
      '/account/profile',
    ]);
    expectCookiesRewritten(res);
  });

  it('answers 401 and clears cookies when the refresh fails', async () => {
    mockBackend({
      'POST /auth/refresh': () => {
        throw unauthorized();
      },
      'PATCH /account/profile': () => {
        throw unauthorized();
      },
    });

    const res = await patch({ fullName: 'Carlos Silva' });

    expect(res.status).toBe(401);
    expectCookiesCleared(res);
  });
});
