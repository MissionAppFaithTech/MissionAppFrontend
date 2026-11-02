import { NextResponse, type NextRequest } from 'next/server';
import { AUTH_COOKIE } from '@/lib/auth/cookies';
import { decodeAccessToken } from '@/lib/auth/jwt';
import { accessAreaFor, accessDecision } from '@/lib/auth/rbac';
import type { BackendRole } from '@/types/backend';

const ROLES = new Set<BackendRole>(['ADMIN', 'MISSIONARY', 'SUPPORTER']);

function roleFromAccessToken(token: string | undefined): BackendRole | null {
  const role = token ? decodeAccessToken(token)?.role : undefined;
  return role && ROLES.has(role as BackendRole) ? (role as BackendRole) : null;
}

/**
 * Optimistic RBAC (see `lib/auth/rbac.ts`): logged-out visitors go to login and
 * a role outside its area goes to its own home. The role comes from the access
 * token without verifying it — only to pick the screen; the BFF and the backend
 * still authorize every request. When a session exists but the role cannot be
 * read (only the refresh cookie is left, or an unreadable token), the page loads
 * and its client guard decides after asking the BFF.
 */
export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  if (accessAreaFor(pathname) === 'public') return NextResponse.next();

  const accessToken = request.cookies.get(AUTH_COOKIE.accessToken)?.value;
  const role = roleFromAccessToken(accessToken);
  const hasSession = Boolean(accessToken) || request.cookies.has(AUTH_COOKIE.refreshToken);
  if (!role && hasSession) return NextResponse.next();

  const decision = accessDecision(role, pathname, search);
  if (decision.allow) return NextResponse.next();
  return NextResponse.redirect(new URL(decision.redirectTo, request.url));
}

export const config = {
  matcher: ['/profile', '/profile/:path*', '/admin', '/admin/:path*'],
};
