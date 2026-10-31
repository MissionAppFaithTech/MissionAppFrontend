import type { BackendRole } from '@/types/backend';

/**
 * Role-based access for the frontend routes. The backend still authorizes every
 * API call; this keeps people out of screens their role cannot use.
 *
 * - visitors: public pages only (landing, login, sign-up, public profiles, campaigns);
 * - MISSIONARY: the missionary area (`/profile/**`);
 * - SUPPORTER: the supporter area (`/profile/supporter/**`);
 * - ADMIN: the admin area (`/admin/**`); no admin panel exists yet.
 */
export type AccessArea = 'public' | 'missionary' | 'supporter' | 'admin';

export type AccessDecision = { allow: true } | { allow: false; redirectTo: string };

const AREA_ROLE: Record<Exclude<AccessArea, 'public'>, BackendRole> = {
  missionary: 'MISSIONARY',
  supporter: 'SUPPORTER',
  admin: 'ADMIN',
};

const HOME_BY_ROLE: Record<BackendRole, string> = {
  MISSIONARY: '/profile',
  SUPPORTER: '/profile/supporter',
  ADMIN: '/admin',
};

const isUnder = (pathname: string, prefix: string) =>
  pathname === prefix || pathname.startsWith(`${prefix}/`);

/** Home of a logged-in role; the landing page for visitors or an unknown role. */
export function homePathForRole(role: BackendRole | null | undefined): string {
  return role ? HOME_BY_ROLE[role] : '/';
}

/** Which area a path belongs to. Public missionary profiles stay open to everyone. */
export function accessAreaFor(pathname: string): AccessArea {
  if (isUnder(pathname, '/admin')) return 'admin';
  if (isUnder(pathname, '/profile/missionario')) return 'public';
  if (isUnder(pathname, '/profile/supporter')) return 'supporter';
  if (isUnder(pathname, '/profile')) return 'missionary';
  return 'public';
}

export function canAccess(role: BackendRole | null | undefined, area: AccessArea): boolean {
  return area === 'public' || role === AREA_ROLE[area];
}

/**
 * Decides whether a role may open a path. Visitors are sent to login (keeping
 * the path in `next`); a logged-in role outside its area goes to its own home.
 */
export function accessDecision(
  role: BackendRole | null | undefined,
  pathname: string,
  search = ''
): AccessDecision {
  const area = accessAreaFor(pathname);
  if (canAccess(role, area)) return { allow: true };
  if (!role) {
    return { allow: false, redirectTo: `/login?next=${encodeURIComponent(pathname + search)}` };
  }
  return { allow: false, redirectTo: homePathForRole(role) };
}
