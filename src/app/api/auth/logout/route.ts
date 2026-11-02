import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { backendFetch } from '@/lib/api/backend';
import { AUTH_COOKIE, clearAuthCookies } from '@/lib/auth/cookies';
import { isAccessTokenExpiring } from '@/lib/auth/jwt';

/**
 * Revokes the session family on the backend and always clears the auth cookies,
 * even when the backend is unreachable, so the browser is logged out locally.
 */
export async function POST() {
  const store = await cookies();
  const accessToken = store.get(AUTH_COOKIE.accessToken)?.value;
  const refreshToken = store.get(AUTH_COOKIE.refreshToken)?.value;

  if (refreshToken) {
    try {
      await backendFetch('/auth/logout', {
        method: 'DELETE',
        body: { refreshToken },
        // The refresh token alone revokes the session; an expired bearer would only fail.
        accessToken:
          accessToken && !isAccessTokenExpiring(accessToken, 0) ? accessToken : undefined,
      });
    } catch (error) {
      console.error('[api/auth/logout]', error);
    }
  }

  const response = NextResponse.json({ message: 'Você saiu da sua conta.' });
  clearAuthCookies(response);
  return response;
}
