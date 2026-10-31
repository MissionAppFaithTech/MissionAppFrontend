import { NextResponse, type NextRequest } from 'next/server';
import { AUTH_COOKIE } from '@/lib/auth/cookies';

/** Public visitor view of a missionary profile (RF 10.2). */
const PUBLIC_PROFILE_PREFIX = '/profile/missionario/';

/**
 * Optimistic auth check: owner profile pages need a session cookie. The BFF and
 * the backend still authorize every request; this only avoids rendering an empty
 * owner page for logged-out visitors.
 */
export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  if (pathname.startsWith(PUBLIC_PROFILE_PREFIX)) return NextResponse.next();

  const hasSession =
    request.cookies.has(AUTH_COOKIE.accessToken) || request.cookies.has(AUTH_COOKIE.refreshToken);
  if (hasSession) return NextResponse.next();

  const loginUrl = new URL('/login', request.url);
  loginUrl.searchParams.set('next', `${pathname}${search}`);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ['/profile', '/profile/:path*'],
};
