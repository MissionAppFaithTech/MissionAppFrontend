import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { POST } from './route';
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

function setSession(accessToken?: string, refreshToken?: string) {
  cookieJar.clear();
  if (accessToken) cookieJar.set(AUTH_COOKIE.accessToken, accessToken);
  if (refreshToken) cookieJar.set(AUTH_COOKIE.refreshToken, refreshToken);
}

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

const LOGGED_OUT = { message: 'Você saiu da sua conta.' };

beforeEach(() => {
  clearRefreshCache();
  vi.mocked(backendFetch).mockReset();
  cookieJar.clear();
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('POST /api/auth/logout', () => {
  it('revokes the session family on the backend and clears the cookies', async () => {
    setSession('access-1', 'refresh-1');
    vi.mocked(backendFetch).mockResolvedValue('');

    const res = await POST();

    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toEqual(LOGGED_OUT);
    expect(backendFetch).toHaveBeenCalledExactlyOnceWith('/auth/logout', {
      method: 'DELETE',
      body: { refreshToken: 'refresh-1' },
      accessToken: 'access-1',
    });
    expectCookiesCleared(res);
  });

  it('still revokes with only the refresh token (expired access cookie)', async () => {
    setSession(undefined, 'refresh-only');
    vi.mocked(backendFetch).mockResolvedValue('');

    const res = await POST();

    expect(res.status).toBe(200);
    expect(backendFetch).toHaveBeenCalledWith('/auth/logout', {
      method: 'DELETE',
      body: { refreshToken: 'refresh-only' },
      accessToken: undefined,
    });
    expectCookiesCleared(res);
  });

  it('does not send an expired access token, only the refresh token', async () => {
    const b64 = (v: object) => Buffer.from(JSON.stringify(v)).toString('base64url');
    const expired = `${b64({ alg: 'HS256' })}.${b64({ sub: 'u', exp: 1 })}.sig`;
    setSession(expired, 'refresh-2');
    vi.mocked(backendFetch).mockResolvedValue('');

    await POST();

    expect(backendFetch).toHaveBeenCalledWith('/auth/logout', {
      method: 'DELETE',
      body: { refreshToken: 'refresh-2' },
      accessToken: undefined,
    });
  });

  it('skips the backend when there is no refresh token but still clears cookies', async () => {
    setSession('access-only');

    const res = await POST();

    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toEqual(LOGGED_OUT);
    expect(backendFetch).not.toHaveBeenCalled();
    expectCookiesCleared(res);
  });

  it('logs out locally when the backend rejects the logout', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    setSession('access-1', 'refresh-1');
    const error = new BackendApiError('Erro na API (401)', 401, 'Unauthorized access');
    vi.mocked(backendFetch).mockRejectedValue(error);

    const res = await POST();

    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toEqual(LOGGED_OUT);
    expectCookiesCleared(res);
    expect(consoleError).toHaveBeenCalledWith('[api/auth/logout]', error);
  });

  it('logs out locally when the backend is unreachable', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    setSession('access-1', 'refresh-1');
    vi.mocked(backendFetch).mockRejectedValue(new TypeError('fetch failed'));

    const res = await POST();

    expect(res.status).toBe(200);
    expectCookiesCleared(res);
  });
});
