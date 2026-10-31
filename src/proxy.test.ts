import { describe, it, expect } from 'vitest';
import { NextRequest } from 'next/server';
import { config, proxy } from './proxy';
import { AUTH_COOKIE } from '@/lib/auth/cookies';

function request(path: string, cookie?: string) {
  return new NextRequest(new URL(path, 'http://localhost:3000'), {
    headers: cookie ? { cookie } : undefined,
  });
}

describe('proxy', () => {
  it('redirects logged-out visitors from owner profile pages to login with next', () => {
    const res = proxy(request('/profile/sobre/edit?tab=1'));
    expect(res.status).toBe(307);
    const location = new URL(res.headers.get('location') ?? '');
    expect(location.pathname).toBe('/login');
    expect(location.searchParams.get('next')).toBe('/profile/sobre/edit?tab=1');
  });

  it('lets requests with an access or refresh cookie through', () => {
    expect(
      proxy(request('/profile', `${AUTH_COOKIE.accessToken}=a`)).headers.get('location')
    ).toBeNull();
    expect(
      proxy(request('/profile/edit-profile', `${AUTH_COOKIE.refreshToken}=r`)).headers.get(
        'location'
      )
    ).toBeNull();
  });

  it('keeps the public missionary visitor view open', () => {
    expect(proxy(request('/profile/missionario/samuel')).headers.get('location')).toBeNull();
  });

  it('runs only on the profile area', () => {
    expect(config.matcher).toEqual(['/profile', '/profile/:path*']);
  });
});
