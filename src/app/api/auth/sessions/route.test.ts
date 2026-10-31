import { beforeEach, describe, expect, it, vi } from 'vitest';
import { DELETE, GET } from './route';
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

const sessions = [
  {
    id: 'session-1',
    deviceType: 'web',
    deviceName: 'Chrome on Linux',
    ipAddress: '127.0.0.1',
    lastUsedAt: '2026-10-30T10:00:00.000Z',
    createdAt: '2026-10-29T10:00:00.000Z',
    current: true,
  },
  {
    id: 'session-2',
    deviceType: 'mobile',
    deviceName: null,
    ipAddress: null,
    lastUsedAt: null,
    createdAt: '2026-10-28T10:00:00.000Z',
    current: false,
  },
];

beforeEach(() => {
  clearRefreshCache();
  vi.mocked(backendFetch).mockReset();
  mockCookieStore.get.mockClear();
  setSession(ACCESS, 'rt-1');
});

describe('GET /api/auth/sessions', () => {
  it('returns the active sessions from the backend', async () => {
    mockBackend({ 'GET /auth/sessions': () => ({ data: sessions }) });

    const res = await GET();

    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toEqual({ data: sessions });
    expect(backendFetch).toHaveBeenCalledWith('/auth/sessions', { accessToken: ACCESS });
    expect(res.headers.getSetCookie()).toEqual([]);
  });

  it('answers 401 and clears cookies without a session', async () => {
    setSession();

    const res = await GET();

    expect(res.status).toBe(401);
    await expect(res.json()).resolves.toEqual({ message: SESSION_EXPIRED });
    expectCookiesCleared(res);
    expect(backendFetch).not.toHaveBeenCalled();
  });

  it('refreshes after the plain-text backend 401, retries and rewrites cookies', async () => {
    mockBackend({
      'POST /auth/refresh': refreshOk,
      'GET /auth/sessions': onlyNewToken({ data: sessions }),
    });

    const res = await GET();

    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toEqual({ data: sessions });
    expectCookiesRewritten(res);
  });

  it('answers 401 with the pt-BR message and clears cookies when the refresh fails', async () => {
    mockBackend({
      'POST /auth/refresh': () => {
        throw unauthorized();
      },
      'GET /auth/sessions': () => {
        throw unauthorized();
      },
    });

    const res = await GET();

    expect(res.status).toBe(401);
    await expect(res.json()).resolves.toEqual({ message: SESSION_EXPIRED });
    expectCookiesCleared(res);
  });

  it('maps other backend errors with the GET fallback message', async () => {
    mockBackend({
      'GET /auth/sessions': () => {
        throw new BackendApiError('Erro na API (500)', 500, 'Internal Server Error');
      },
    });

    const res = await GET();

    expect(res.status).toBe(500);
    await expect(res.json()).resolves.toEqual({
      message: 'Não foi possível carregar as sessões',
    });
    expect(res.headers.getSetCookie()).toEqual([]);
  });
});

describe('DELETE /api/auth/sessions', () => {
  it('ends every session on the backend and clears the auth cookies', async () => {
    mockBackend({ 'DELETE /auth/sessions': () => '' });

    const res = await DELETE();

    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toEqual({ message: 'Todas as sessões foram encerradas.' });
    expect(backendFetch).toHaveBeenCalledWith('/auth/sessions', {
      method: 'DELETE',
      accessToken: ACCESS,
    });
    expectCookiesCleared(res);
  });

  it('keeps the cookies when the backend fails', async () => {
    mockBackend({
      'DELETE /auth/sessions': () => {
        throw new BackendApiError('Too many requests', 429, undefined);
      },
    });

    const res = await DELETE();

    expect(res.status).toBe(429);
    await expect(res.json()).resolves.toEqual({
      message: 'Muitas tentativas em pouco tempo. Aguarde um minuto e tente novamente.',
    });
    expect(res.headers.getSetCookie()).toEqual([]);
  });

  it('answers 502 with the DELETE fallback when the backend is unreachable', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    mockBackend({
      'DELETE /auth/sessions': () => {
        throw new TypeError('fetch failed');
      },
    });

    const res = await DELETE();

    expect(res.status).toBe(502);
    await expect(res.json()).resolves.toEqual({
      message: 'Não foi possível encerrar as sessões',
    });
    consoleError.mockRestore();
  });

  it('answers 401 and clears cookies without a session', async () => {
    setSession();

    const res = await DELETE();

    expect(res.status).toBe(401);
    expectCookiesCleared(res);
    expect(backendFetch).not.toHaveBeenCalled();
  });

  it('answers 401 and clears cookies when the refresh after a 401 fails', async () => {
    mockBackend({
      'POST /auth/refresh': () => {
        throw unauthorized();
      },
      'DELETE /auth/sessions': () => {
        throw unauthorized();
      },
    });

    const res = await DELETE();

    expect(res.status).toBe(401);
    expectCookiesCleared(res);
  });
});
