import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { config, proxy, resetUnreachableLog } from './proxy';
import { BackendApiError } from '@/lib/api/backend';
import { refreshTokens } from '@/lib/api/bff';
import { AUTH_COOKIE } from '@/lib/auth/cookies';

import { DEVICE_COOKIE } from '@/lib/auth/device';

const DEVICE_ID = '0b8e5d4c-3a2f-4e1d-8c7b-6a5f4e3d2c1b';
vi.mock('@/lib/api/bff', () => ({ refreshTokens: vi.fn() }));

const mockedRefresh = vi.mocked(refreshTokens);

function request(path: string, cookie?: string, extraHeaders: Record<string, string> = {}) {
  return new NextRequest(new URL(path, 'http://localhost:3000'), {
    headers: { ...(cookie ? { cookie } : {}), ...extraHeaders },
  });
}

function token(claims: Record<string, unknown>) {
  const payload = Buffer.from(JSON.stringify(claims)).toString('base64url');
  return `h.${payload}.s`;
}

/** Unsigned JWT with the given role: the proxy only reads it to pick the screen. */
function accessCookie(role: string, exp?: number) {
  return `${AUTH_COOKIE.accessToken}=${token({ sub: 'u1', role, ...(exp ? { exp } : {}) })}`;
}

const nowSeconds = () => Math.floor(Date.now() / 1000);
const expired = () => nowSeconds() - 60;
const valid = () => nowSeconds() + 600;

async function location(path: string, cookie?: string) {
  return (await proxy(request(path, cookie))).headers.get('location');
}
async function redirectPath(path: string, cookie?: string) {
  const target = await location(path, cookie);
  return target ? new URL(target).pathname : null;
}

/** Cookie header the proxy forwards to the render (`x-middleware-request-cookie`). */
function forwardedCookie(response: Response) {
  return response.headers.get('x-middleware-request-cookie') ?? '';
}

beforeEach(() => {
  mockedRefresh.mockReset();
});

afterEach(() => {
  vi.unstubAllEnvs();
});

describe('proxy RBAC', () => {
  it('redirects logged-out visitors from private areas to login with next', async () => {
    const res = await proxy(request('/profile/sobre/edit?tab=1'));
    expect(res.status).toBe(307);
    const target = new URL(res.headers.get('location') ?? '');
    expect(target.pathname).toBe('/login');
    expect(target.searchParams.get('next')).toBe('/profile/sobre/edit?tab=1');
    expect(await redirectPath('/admin')).toBe('/login');
    expect(await redirectPath('/profile/supporter')).toBe('/login');
  });

  it('lets each role into its own area', async () => {
    expect(await location('/profile/sobre', accessCookie('MISSIONARY'))).toBeNull();
    expect(await location('/profile/supporter/missionarios', accessCookie('SUPPORTER'))).toBeNull();
    expect(await location('/admin', accessCookie('ADMIN'))).toBeNull();
  });

  it('sends a role outside its area to its own home', async () => {
    expect(await redirectPath('/profile/financeiro', accessCookie('SUPPORTER'))).toBe(
      '/profile/supporter'
    );
    expect(await redirectPath('/profile/supporter', accessCookie('MISSIONARY'))).toBe('/profile');
    expect(await redirectPath('/admin', accessCookie('MISSIONARY'))).toBe('/profile');
    expect(await redirectPath('/profile', accessCookie('ADMIN'))).toBe('/admin');
  });

  it('defers to the client guard when the session exists but the role is unreadable', async () => {
    expect(await location('/admin', `${AUTH_COOKIE.accessToken}=not-a-jwt`)).toBeNull();
    expect(await location('/profile', accessCookie('HACKER'))).toBeNull();
  });

  it('keeps public pages and BFF routes open', async () => {
    expect(await location('/profile/missionario/samuel')).toBeNull();
    expect(await location('/profile/missionario/samuel', accessCookie('SUPPORTER'))).toBeNull();
    expect(await location('/')).toBeNull();
    expect(await location('/api/account/profile')).toBeNull();
  });
});

describe('proxy session refresh', () => {
  const NEW_TOKENS = {
    accessToken: token({ sub: 'u1', role: 'MISSIONARY', exp: valid() }),
    refreshToken: 'rt-new',
  };

  it('does nothing while the access token is still valid', async () => {
    const res = await proxy(
      request(
        '/profile/sobre',
        `${accessCookie('MISSIONARY', valid())}; ${AUTH_COOKIE.refreshToken}=rt`
      )
    );
    expect(mockedRefresh).not.toHaveBeenCalled();
    expect(res.headers.get('set-cookie')).toBeNull();
  });

  it('does nothing without a refresh token', async () => {
    await proxy(request('/', accessCookie('MISSIONARY', expired())));
    expect(mockedRefresh).not.toHaveBeenCalled();
  });

  it('renews an expired session, sets the cookies and forwards them to the render', async () => {
    mockedRefresh.mockResolvedValue(NEW_TOKENS);
    const res = await proxy(
      request(
        '/profile/sobre',
        `${accessCookie('MISSIONARY', expired())}; ${AUTH_COOKIE.refreshToken}=rt-old`
      )
    );

    expect(mockedRefresh).toHaveBeenCalledWith('rt-old', { 'x-device-kind': 'unknown' });
    expect(res.headers.get('location')).toBeNull();
    const setCookie = res.headers.get('set-cookie') ?? '';
    expect(setCookie).toContain(`${AUTH_COOKIE.accessToken}=${NEW_TOKENS.accessToken}`);
    expect(setCookie).toContain(`${AUTH_COOKIE.refreshToken}=rt-new`);
    expect(setCookie.toLowerCase()).toContain('httponly');
    const forwarded = forwardedCookie(res);
    expect(forwarded).toContain(`${AUTH_COOKIE.accessToken}=${NEW_TOKENS.accessToken}`);
    expect(forwarded).toContain(`${AUTH_COOKIE.refreshToken}=rt-new`);
    expect(forwarded).not.toContain('rt-old');
  });

  it('renews a session that only has the refresh cookie and then applies RBAC', async () => {
    mockedRefresh.mockResolvedValue({
      ...NEW_TOKENS,
      accessToken: token({ sub: 'u1', role: 'SUPPORTER', exp: valid() }),
    });
    const res = await proxy(request('/profile/financeiro', `${AUTH_COOKIE.refreshToken}=rt-old`));
    expect(new URL(res.headers.get('location') ?? '').pathname).toBe('/profile/supporter');
    expect(res.headers.get('set-cookie')).toContain(`${AUTH_COOKIE.refreshToken}=rt-new`);
  });

  it('renews on BFF routes too, so route handlers never refresh in parallel', async () => {
    mockedRefresh.mockResolvedValue(NEW_TOKENS);
    const res = await proxy(request('/api/account/profile', `${AUTH_COOKIE.refreshToken}=rt-old`));
    expect(mockedRefresh).toHaveBeenCalledTimes(1);
    expect(forwardedCookie(res)).toContain(`${AUTH_COOKIE.refreshToken}=rt-new`);
  });

  it('ends the session when the backend refuses the refresh token', async () => {
    mockedRefresh.mockRejectedValue(new BackendApiError('Refresh token inválido', 401));
    const res = await proxy(
      request(
        '/profile/sobre',
        `${accessCookie('MISSIONARY', expired())}; ${AUTH_COOKIE.refreshToken}=rt-stolen`
      )
    );

    expect(new URL(res.headers.get('location') ?? '').pathname).toBe('/login');
    const setCookie = res.headers.get('set-cookie') ?? '';
    expect(setCookie).toContain(`${AUTH_COOKIE.accessToken}=;`);
    expect(setCookie).toContain(`${AUTH_COOKIE.refreshToken}=;`);
  });

  it('lets a public page load as a visitor after the session ends', async () => {
    mockedRefresh.mockRejectedValue(new BackendApiError('Refresh token inválido', 401));
    const res = await proxy(request('/', `${AUTH_COOKIE.refreshToken}=rt-stolen`));
    expect(res.headers.get('location')).toBeNull();
    expect(forwardedCookie(res)).not.toContain(AUTH_COOKIE.refreshToken);
  });

  it('keeps the cookies when the backend is unreachable and warns once, in one line', async () => {
    resetUnreachableLog();
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const error = vi.spyOn(console, 'error').mockImplementation(() => {});
    mockedRefresh.mockRejectedValue(
      new TypeError('fetch failed', { cause: { code: 'ECONNREFUSED' } })
    );
    const expiredSession = () =>
      request(
        '/profile/sobre',
        `${accessCookie('MISSIONARY', expired())}; ${AUTH_COOKIE.refreshToken}=rt-old`
      );

    const res = await proxy(expiredSession());
    await proxy(expiredSession());

    expect(res.headers.get('set-cookie')).toBeNull();
    expect(res.headers.get('location')).toBeNull();
    expect(warn).toHaveBeenCalledTimes(1);
    expect(warn.mock.calls[0][0]).toMatch(
      /\[proxy\] API http:\/\/\S+ não respondeu .*\(ECONNREFUSED\)/
    );
    expect(error).not.toHaveBeenCalled();
    warn.mockRestore();
    error.mockRestore();
  });

  it('warns again after a minute and names the HTTP status of a 5xx', async () => {
    resetUnreachableLog();
    vi.useFakeTimers({ toFake: ['Date'] });
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    mockedRefresh.mockRejectedValue(new BackendApiError('Erro na API (503)', 503, {}));
    const expiredSession = () =>
      request(
        '/profile/sobre',
        `${accessCookie('MISSIONARY', expired())}; ${AUTH_COOKIE.refreshToken}=rt-old`
      );

    await proxy(expiredSession());
    vi.advanceTimersByTime(59_000);
    await proxy(expiredSession());
    vi.advanceTimersByTime(2_000);
    await proxy(expiredSession());

    expect(warn).toHaveBeenCalledTimes(2);
    expect(warn.mock.calls[0][0]).toContain('(HTTP 503)');
    warn.mockRestore();
    vi.useRealTimers();
  });

  it('forwards the end-user IP with the BFF secret (ADR-0032)', async () => {
    vi.stubEnv('BFF_SHARED_SECRET', 'secret');
    mockedRefresh.mockResolvedValue(NEW_TOKENS);
    await proxy(
      request('/', `${AUTH_COOKIE.refreshToken}=rt-old`, {
        'x-forwarded-for': '203.0.113.7, 10.0.0.1',
      })
    );
    expect(mockedRefresh).toHaveBeenCalledWith('rt-old', {
      'x-missionapp-bff-secret': 'secret',
      'x-missionapp-client-ip': '203.0.113.7',
      'x-device-kind': 'unknown',
    });
  });

  it('describes the device on refresh so the API keeps it on the new token (ADR-0007)', async () => {
    mockedRefresh.mockResolvedValue(NEW_TOKENS);
    await proxy(
      request('/', `${AUTH_COOKIE.refreshToken}=rt-old; ${DEVICE_COOKIE}=${DEVICE_ID}`, {
        'user-agent':
          'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1',
      })
    );
    expect(mockedRefresh).toHaveBeenCalledWith('rt-old', {
      'x-device-id': DEVICE_ID,
      'x-device-kind': 'mobile',
      'x-device-name': 'Mobile Safari no iOS',
    });
  });
});

describe('proxy matcher', () => {
  const pattern = new RegExp(`^${config.matcher[0]}$`);

  it('runs on pages, Server Actions and BFF routes', () => {
    for (const path of ['/', '/profile/sobre', '/api/auth/session', '/user/samuel']) {
      expect(pattern.test(path)).toBe(true);
    }
  });

  it('skips static files and images', () => {
    for (const path of ['/_next/static/chunk.js', '/_next/image', '/favicon.ico', '/logo.png']) {
      expect(pattern.test(path)).toBe(false);
    }
  });
});
