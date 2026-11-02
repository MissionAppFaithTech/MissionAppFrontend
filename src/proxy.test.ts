import { describe, it, expect } from 'vitest';
import { NextRequest } from 'next/server';
import { config, proxy } from './proxy';
import { AUTH_COOKIE } from '@/lib/auth/cookies';

function request(path: string, cookie?: string) {
  return new NextRequest(new URL(path, 'http://localhost:3000'), {
    headers: cookie ? { cookie } : undefined,
  });
}

/** Unsigned JWT with the given role: the proxy only reads it to pick the screen. */
function accessCookie(role: string) {
  const payload = Buffer.from(JSON.stringify({ sub: 'u1', role })).toString('base64url');
  return `${AUTH_COOKIE.accessToken}=h.${payload}.s`;
}

const location = (path: string, cookie?: string) =>
  proxy(request(path, cookie)).headers.get('location');
const redirectPath = (path: string, cookie?: string) => {
  const target = location(path, cookie);
  return target ? new URL(target).pathname : null;
};

describe('proxy', () => {
  it('redirects logged-out visitors from private areas to login with next', () => {
    const res = proxy(request('/profile/sobre/edit?tab=1'));
    expect(res.status).toBe(307);
    const target = new URL(res.headers.get('location') ?? '');
    expect(target.pathname).toBe('/login');
    expect(target.searchParams.get('next')).toBe('/profile/sobre/edit?tab=1');
    expect(redirectPath('/admin')).toBe('/login');
    expect(redirectPath('/profile/supporter')).toBe('/login');
  });

  it('lets each role into its own area', () => {
    expect(location('/profile/sobre', accessCookie('MISSIONARY'))).toBeNull();
    expect(location('/profile/supporter/missionarios', accessCookie('SUPPORTER'))).toBeNull();
    expect(location('/admin', accessCookie('ADMIN'))).toBeNull();
  });

  it('sends a role outside its area to its own home', () => {
    expect(redirectPath('/profile/financeiro', accessCookie('SUPPORTER'))).toBe(
      '/profile/supporter'
    );
    expect(redirectPath('/profile/supporter', accessCookie('MISSIONARY'))).toBe('/profile');
    expect(redirectPath('/admin', accessCookie('MISSIONARY'))).toBe('/profile');
    expect(redirectPath('/profile', accessCookie('ADMIN'))).toBe('/admin');
  });

  it('defers to the client guard when the session exists but the role is unreadable', () => {
    expect(location('/profile/edit-profile', `${AUTH_COOKIE.refreshToken}=r`)).toBeNull();
    expect(location('/admin', `${AUTH_COOKIE.accessToken}=not-a-jwt`)).toBeNull();
    expect(location('/profile', accessCookie('HACKER'))).toBeNull();
  });

  it('keeps the public missionary visitor view open', () => {
    expect(location('/profile/missionario/samuel')).toBeNull();
    expect(location('/profile/missionario/samuel', accessCookie('SUPPORTER'))).toBeNull();
  });

  it('runs on the profile and admin areas', () => {
    expect(config.matcher).toEqual(['/profile', '/profile/:path*', '/admin', '/admin/:path*']);
  });
});
