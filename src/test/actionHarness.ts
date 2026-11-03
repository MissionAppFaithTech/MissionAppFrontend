import { vi } from 'vitest';
import { AUTH_COOKIE } from '@/lib/auth/cookies';

/**
 * Test doubles for Server Actions (ADR-0006). Wire them in a test file with:
 *
 *   vi.mock('next/headers', async () => (await import('@/test/actionHarness')).headersMock);
 *   vi.mock('next/cache', async () => (await import('@/test/actionHarness')).cacheMock);
 *   vi.mock('@/lib/api/backend', async () => (await import('@/test/actionHarness')).backendMock);
 *
 * This module never imports the real backend client, so the mocks stay isolated.
 */

class BackendApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public body?: unknown
  ) {
    super(message);
    this.name = 'BackendApiError';
  }
}

export const backendMock = {
  backendFetch: vi.fn(),
  BackendApiError,
};

export const cacheMock = {
  updateTag: vi.fn(),
  refresh: vi.fn(),
};

type CookieWrite = { name: string; value: string; maxAge?: number };

const jar = new Map<string, string>();
/** Every `cookies().set` call, in order. */
export const cookieWrites: CookieWrite[] = [];

const cookieStore = {
  get: (name: string) => (jar.has(name) ? { name, value: jar.get(name) as string } : undefined),
  set: (name: string, value: string, options?: { maxAge?: number }) => {
    cookieWrites.push({ name, value, maxAge: options?.maxAge });
    if (options?.maxAge === 0) jar.delete(name);
    else jar.set(name, value);
  },
};

export const headersMock = {
  cookies: vi.fn(async () => cookieStore),
  headers: vi.fn(async () => new Headers()),
};

const b64url = (value: object) => Buffer.from(JSON.stringify(value)).toString('base64url');

/** Unsigned JWT; the BFF only reads `exp` to decide when to refresh. */
export function jwt(claims: Record<string, unknown>) {
  return `${b64url({ alg: 'HS256', typ: 'JWT' })}.${b64url(claims)}.sig`;
}

export const ACCESS = jwt({
  sub: 'usr-1',
  role: 'MISSIONARY',
  exp: Math.floor(Date.now() / 1000) + 900,
});
export const NEW_TOKENS = { accessToken: 'new-access', refreshToken: 'new-refresh' };

/** Resets the cookie jar to the given session and forgets earlier writes. */
export function setSession(accessToken?: string, refreshToken?: string) {
  jar.clear();
  cookieWrites.length = 0;
  if (accessToken) jar.set(AUTH_COOKIE.accessToken, accessToken);
  if (refreshToken) jar.set(AUTH_COOKIE.refreshToken, refreshToken);
}

export function cookieValue(name: string) {
  return jar.get(name);
}

/** True when the action expired both auth cookies (logout, password change...). */
export function authCookiesCleared() {
  return [AUTH_COOKIE.accessToken, AUTH_COOKIE.refreshToken].every((name) =>
    cookieWrites.some((write) => write.name === name && write.maxAge === 0)
  );
}

type FetchOptions = { method?: string; body?: unknown; accessToken?: string };
export type BackendRoute = (options: FetchOptions) => unknown;

/** Routes mocked backend calls by `"<METHOD> <path>"`; unknown routes fail the test. */
export function mockBackend(routes: Record<string, BackendRoute>) {
  backendMock.backendFetch.mockImplementation(async (path: string, options: FetchOptions = {}) => {
    const handler = routes[`${options.method ?? 'GET'} ${path}`];
    if (!handler) throw new Error(`Unexpected backend call: ${options.method ?? 'GET'} ${path}`);
    return handler(options);
  });
}

export function backendError(status: number, body?: unknown) {
  return new BackendApiError(`Erro na API (${status})`, status, body);
}

/** Rejects the original token with the backend's 401, accepts the refreshed one. */
export function onlyNewToken(result: unknown): BackendRoute {
  return ({ accessToken }) => {
    if (accessToken !== NEW_TOKENS.accessToken) throw backendError(401, 'Unauthorized access');
    return result;
  };
}

export function resetActionHarness() {
  backendMock.backendFetch.mockReset();
  cacheMock.updateTag.mockReset();
  cacheMock.refresh.mockReset();
  setSession(ACCESS, 'rt-1');
}
