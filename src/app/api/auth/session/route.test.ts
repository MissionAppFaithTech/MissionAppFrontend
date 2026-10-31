import { beforeEach, describe, expect, it, vi } from 'vitest';
import { GET } from './route';
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
const inSeconds = (seconds: number) => Math.floor(Date.now() / 1000) + seconds;
const SESSION_EXPIRED = 'Sua sessão expirou. Entre novamente para continuar.';

function setSession(accessToken?: string, refreshToken?: string) {
  cookieJar.clear();
  if (accessToken) cookieJar.set(AUTH_COOKIE.accessToken, accessToken);
  if (refreshToken) cookieJar.set(AUTH_COOKIE.refreshToken, refreshToken);
}

beforeEach(() => {
  clearRefreshCache();
  vi.mocked(backendFetch).mockReset();
  cookieJar.clear();
});

describe('GET /api/auth/session', () => {
  it.each(['ADMIN', 'MISSIONARY', 'SUPPORTER'])(
    'returns the user id and %s role from the access token',
    async (role) => {
      setSession(jwt({ sub: 'usr-42', role, exp: inSeconds(900) }), 'rt-1');

      const res = await GET();

      expect(res.status).toBe(200);
      await expect(res.json()).resolves.toEqual({
        data: { authenticated: true, userId: 'usr-42', role },
      });
      expect(backendFetch).not.toHaveBeenCalled();
      expect(res.headers.getSetCookie()).toEqual([]);
    }
  );

  it('never exposes the token itself', async () => {
    const token = jwt({ sub: 'usr-42', role: 'SUPPORTER', exp: inSeconds(900) });
    setSession(token, 'rt-secret');

    const res = await GET();
    const text = await res.text();

    expect(text).not.toContain(token);
    expect(text).not.toContain('rt-secret');
  });

  it('returns a null role for an unknown role claim', async () => {
    setSession(jwt({ sub: 'usr-42', role: 'SUPERUSER', exp: inSeconds(900) }));

    const res = await GET();

    await expect(res.json()).resolves.toEqual({
      data: { authenticated: true, userId: 'usr-42', role: null },
    });
  });

  it('returns null id and role for an undecodable token', async () => {
    setSession('opaque-token');

    const res = await GET();

    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toEqual({
      data: { authenticated: true, userId: null, role: null },
    });
  });

  it('answers 401 and clears cookies without a session', async () => {
    const res = await GET();

    expect(res.status).toBe(401);
    await expect(res.json()).resolves.toEqual({ message: SESSION_EXPIRED });
    const setCookie = res.headers.getSetCookie();
    expect(setCookie).toEqual(
      expect.arrayContaining([
        expect.stringMatching(/^ma_access_token=;.*Max-Age=0/),
        expect.stringMatching(/^ma_refresh_token=;.*Max-Age=0/),
      ])
    );
  });

  it('refreshes an expiring token and reads the claims from the new one', async () => {
    setSession(jwt({ sub: 'usr-42', role: 'SUPPORTER', exp: inSeconds(1) }), 'rt-1');
    const newAccess = jwt({ sub: 'usr-42', role: 'MISSIONARY', exp: inSeconds(900) });
    vi.mocked(backendFetch).mockResolvedValue({
      data: { accessToken: newAccess, refreshToken: 'rt-2' },
    });

    const res = await GET();

    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toEqual({
      data: { authenticated: true, userId: 'usr-42', role: 'MISSIONARY' },
    });
    expect(backendFetch).toHaveBeenCalledWith('/auth/refresh', {
      method: 'POST',
      body: { refreshToken: 'rt-1' },
    });
    const setCookie = res.headers.getSetCookie();
    expect(setCookie).toEqual(
      expect.arrayContaining([
        expect.stringMatching(new RegExp(`^ma_access_token=${newAccess};.*Max-Age=1200`)),
        expect.stringMatching(/^ma_refresh_token=rt-2;.*Max-Age=604800/),
      ])
    );
  });

  it('answers 401 and clears cookies when only a revoked refresh token is left', async () => {
    setSession(undefined, 'rt-revoked');
    vi.mocked(backendFetch).mockRejectedValue(
      new BackendApiError('Erro na API (401)', 401, 'Unauthorized access')
    );

    const res = await GET();

    expect(res.status).toBe(401);
    expect(res.headers.getSetCookie().join('\n')).toMatch(/ma_refresh_token=;.*Max-Age=0/);
  });
});
