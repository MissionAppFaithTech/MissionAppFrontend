import type { AuthUser } from '@/lib/api/auth-response';

const URL_BASE = 'http://missionapp.local';

/** Backslashes and control characters are normalised away by URL parsers ("/\t/evil.com" → "//evil.com"). */
const UNSAFE_PATH_CHARS = /[\\\u0000-\u001f\u007f]/;

/** Accepts only same-origin relative paths, so `?next=` cannot become an open redirect. */
export function safeNextPath(next: string | null | undefined): string | null {
  if (!next || !next.startsWith('/') || next.startsWith('//')) return null;
  if (UNSAFE_PATH_CHARS.test(next)) return null;
  try {
    if (new URL(next, URL_BASE).origin !== URL_BASE) return null;
  } catch {
    return null;
  }
  return next;
}

/** Landing page after login, by role. */
export function homePathForRole(role: AuthUser['role']): string {
  return role === 'SUPPORTER' ? '/profile/supporter' : '/profile';
}

/** `next` wins only when it belongs to the same area as the user's role. */
export function postLoginPath(role: AuthUser['role'], next: string | null | undefined): string {
  const home = homePathForRole(role);
  const target = safeNextPath(next);
  if (!target) return home;
  const supporterArea = target.startsWith('/profile/supporter');
  const missionaryArea = target.startsWith('/profile') && !supporterArea;
  if (role === 'SUPPORTER' && missionaryArea && !target.startsWith('/profile/missionario/')) {
    return home;
  }
  if (role !== 'SUPPORTER' && supporterArea) return home;
  return target;
}
