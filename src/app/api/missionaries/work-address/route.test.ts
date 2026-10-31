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
const SESSION_EXPIRED = 'Sua sessão expirou. Entre novamente para continuar.';

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

const patch = (body: unknown) =>
  PATCH(
    new Request('http://localhost:3000/api/missionaries/work-address', {
      method: 'PATCH',
      body: typeof body === 'string' ? body : JSON.stringify(body),
    })
  );

const address = {
  zip: '01001-000',
  district: 'Sé',
  city: 'São Paulo',
  state: 'SP',
  country: 'Brasil',
};
const saved = { data: { workAddress: { id: 'wa-1', missionaryId: 'm-1', ...address } } };

beforeEach(() => {
  clearRefreshCache();
  vi.mocked(backendFetch).mockReset();
  mockCookieStore.get.mockClear();
  setSession(ACCESS, 'rt-1');
});

describe('PATCH /api/missionaries/work-address', () => {
  it('upserts the full trimmed address and returns it', async () => {
    mockBackend({ 'PATCH /missionaries/work-address': () => saved });

    const res = await patch({ ...address, city: '  São Paulo ', extra: 'ignored' });

    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toEqual(saved);
    expect(backendFetch).toHaveBeenCalledWith('/missionaries/work-address', {
      method: 'PATCH',
      accessToken: ACCESS,
      body: address,
    });
  });

  it('answers 422 listing every missing field (full replace)', async () => {
    const res = await patch({ zip: '' });

    expect(res.status).toBe(422);
    const body = await res.json();
    expect(body.message).toBe('Local de atuação inválido');
    expect(Object.keys(body.fieldErrors).sort()).toEqual([
      'city',
      'country',
      'district',
      'state',
      'zip',
    ]);
    expect(backendFetch).not.toHaveBeenCalled();
  });

  it('answers 422 for null fields (the address cannot be cleared field by field)', async () => {
    const res = await patch({ ...address, district: null });

    expect(res.status).toBe(422);
    expect(Object.keys((await res.json()).fieldErrors)).toEqual(['district']);
  });

  it('answers 422 when a field exceeds its maximum length', async () => {
    const res = await patch({ ...address, zip: '1'.repeat(21) });

    expect(res.status).toBe(422);
    expect(Object.keys((await res.json()).fieldErrors)).toEqual(['zip']);
  });

  it('answers 400 for invalid JSON', async () => {
    const res = await patch('invalid-json');

    expect(res.status).toBe(400);
    await expect(res.json()).resolves.toEqual({ message: 'JSON inválido' });
  });

  it('maps a backend 403 to the pt-BR permission message', async () => {
    mockBackend({
      'PATCH /missionaries/work-address': () => {
        throw new BackendApiError('Forbidden', 403, 'Forbidden');
      },
    });

    const res = await patch(address);

    expect(res.status).toBe(403);
    await expect(res.json()).resolves.toEqual({
      message: 'Você não tem permissão para realizar esta ação.',
    });
  });

  it('maps Vine 422 errors to localized fieldErrors', async () => {
    mockBackend({
      'PATCH /missionaries/work-address': () => {
        throw new BackendApiError('Validation failure', 422, {
          errors: [{ field: 'zip', message: 'The zip field is required', rule: 'required' }],
        });
      },
    });

    const res = await patch(address);

    expect(res.status).toBe(422);
    await expect(res.json()).resolves.toEqual({
      message: 'Campo obrigatório.',
      fieldErrors: { zip: 'Campo obrigatório.' },
    });
  });

  it('answers 502 with the fallback message when the backend is unreachable', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    mockBackend({
      'PATCH /missionaries/work-address': () => {
        throw new TypeError('fetch failed');
      },
    });

    const res = await patch(address);

    expect(res.status).toBe(502);
    await expect(res.json()).resolves.toEqual({
      message: 'Não foi possível salvar o local de atuação',
    });
    consoleError.mockRestore();
  });

  it('answers 401 and clears cookies without a session', async () => {
    setSession();

    const res = await patch(address);

    expect(res.status).toBe(401);
    await expect(res.json()).resolves.toEqual({ message: SESSION_EXPIRED });
    expectCookiesCleared(res);
    expect(backendFetch).not.toHaveBeenCalled();
  });

  it('refreshes after a backend 401, retries and rewrites cookies', async () => {
    mockBackend({
      'POST /auth/refresh': refreshOk,
      'PATCH /missionaries/work-address': onlyNewToken(saved),
    });

    const res = await patch(address);

    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toEqual(saved);
    expectCookiesRewritten(res);
  });

  it('answers 401 and clears cookies when the refresh fails', async () => {
    mockBackend({
      'POST /auth/refresh': () => {
        throw unauthorized();
      },
      'PATCH /missionaries/work-address': () => {
        throw unauthorized();
      },
    });

    const res = await patch(address);

    expect(res.status).toBe(401);
    expectCookiesCleared(res);
  });
});
