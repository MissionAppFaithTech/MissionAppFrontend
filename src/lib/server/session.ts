import { cache } from 'react';
import { cookies } from 'next/headers';
import { AUTH_COOKIE } from '@/lib/auth/cookies';
import { decodeAccessToken } from '@/lib/auth/jwt';
import { ANONYMOUS_SESSION, type SessionSnapshot } from '@/lib/auth/session';
import type { BackendRole } from '@/types/backend';

const ROLES = new Set<BackendRole>(['ADMIN', 'MISSIONARY', 'SUPPORTER']);

/**
 * Reads the session from the access cookie, already renewed by the proxy
 * (ADR-0006). Only to pick the screen: the claims are not verified here and the
 * backend authorizes every request.
 *
 * Not `use cache: private`: that entry would live in the browser router cache
 * and keep showing the previous session right after login or logout. `cache`
 * dedupes the read within one request.
 */
export const getCurrentUser = cache(async (): Promise<SessionSnapshot> => {
  const token = (await cookies()).get(AUTH_COOKIE.accessToken)?.value;
  const claims = token ? decodeAccessToken(token) : null;
  if (!claims?.sub) return ANONYMOUS_SESSION;

  const role =
    claims.role && ROLES.has(claims.role as BackendRole) ? (claims.role as BackendRole) : null;
  return { status: 'authenticated', userId: claims.sub, role };
});
