import { beforeEach, describe, expect, it, vi } from 'vitest';
import { PATCH as changePassword } from '@/app/api/account/password/route';
import { POST as createMissionary } from '@/app/api/missionaries/profile/route';
import { DELETE as endAllSessions } from '@/app/api/auth/sessions/route';
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

beforeEach(() => {
  clearRefreshCache();
  vi.mocked(backendFetch).mockReset();
  setSession(ACCESS, 'rt-1');
});

describe('BUG: refreshed tokens overwrite cookies cleared by the handler', () => {
  it('PATCH /api/account/password clears cookies even when withSession refreshed the token', async () => {
    mockBackend({
      'POST /auth/refresh': refreshOk,
      'PATCH /account/password': onlyNewToken({ message: 'ok' }),
    });
    const res = await changePassword(
      new Request('http://localhost/api/account/password', {
        method: 'PATCH',
        body: JSON.stringify({
          currentPassword: 'OldPassword123!',
          newPassword: 'NewPassword123!',
          newPasswordConfirmation: 'NewPassword123!',
        }),
      })
    );
    expect(res.status).toBe(200);
    expectCookiesCleared(res);
  });

  it('POST /api/missionaries/profile clears cookies even when withSession refreshed the token', async () => {
    mockBackend({
      'POST /auth/refresh': refreshOk,
      'POST /missionaries/profile': onlyNewToken({ data: { missionary: { id: 'm' } } }),
    });
    const res = await createMissionary(
      new Request('http://localhost/api/missionaries/profile', {
        method: 'POST',
        body: JSON.stringify({ missionaryAgencyId: '018f1111-2222-7333-8444-555555555555' }),
      })
    );
    expect(res.status).toBe(200);
    expectCookiesCleared(res);
  });

  it('DELETE /api/auth/sessions clears cookies even when withSession refreshed the token', async () => {
    mockBackend({
      'POST /auth/refresh': refreshOk,
      'DELETE /auth/sessions': onlyNewToken(''),
    });
    const res = await endAllSessions();
    expect(res.status).toBe(200);
    expectCookiesCleared(res);
  });
});
