import type { AuthUser } from '@/lib/api/auth-response';
import { accessDecision, homePathForRole } from '@/lib/auth/rbac';

export { homePathForRole };

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

/** `next` wins only when the role may open it (see {@link accessDecision}). */
export function postLoginPath(role: AuthUser['role'], next: string | null | undefined): string {
  const target = safeNextPath(next);
  if (!target) return homePathForRole(role);
  const { pathname } = new URL(target, URL_BASE);
  return accessDecision(role, pathname).allow ? target : homePathForRole(role);
}
