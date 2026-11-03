'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useSession } from '@/components/auth/SessionProvider';
import { accessDecision } from '@/lib/auth/rbac';

export type RoleGuardStatus = 'checking' | 'allowed';

/**
 * Client half of the RBAC (see `lib/auth/rbac.ts`). The proxy already sends
 * visitors and other roles away on the server; this covers client-side
 * navigations with the session read by the server (ADR-0005). Uses the session
 * context, so callers must sit inside a `<Suspense>` boundary.
 */
export function useRoleGuard(): RoleGuardStatus {
  const router = useRouter();
  const pathname = usePathname() ?? '/';
  const session = useSession();
  const role = session.status === 'authenticated' ? session.role : null;
  const allowed = accessDecision(role, pathname, '').allow;

  useEffect(() => {
    if (allowed) return;
    const decision = accessDecision(role, pathname, window.location.search);
    if (!decision.allow) router.replace(decision.redirectTo);
  }, [allowed, role, pathname, router]);

  return allowed ? 'allowed' : 'checking';
}
