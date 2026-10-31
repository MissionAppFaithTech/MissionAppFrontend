'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { accessDecision } from '@/lib/auth/rbac';
import { useSessionStore } from '@/stores/sessionStore';

export type RoleGuardStatus = 'checking' | 'allowed';

/**
 * Client half of the RBAC: asks the BFF who is logged in and leaves the page
 * (login for visitors, own home for another role) when the role cannot open it.
 * Covers what the proxy cannot see, e.g. a session with only the refresh cookie.
 * If the session check itself fails (network), the page stays: the backend still
 * authorizes every request it makes.
 */
export function useRoleGuard(): RoleGuardStatus {
  const router = useRouter();
  const pathname = usePathname();
  const loadSession = useSessionStore((state) => state.loadSession);
  const [status, setStatus] = useState<RoleGuardStatus>('checking');

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const session = await loadSession();
      if (cancelled) return;
      if (session === 'unknown') {
        setStatus('allowed');
        return;
      }
      const role = session === 'authenticated' ? useSessionStore.getState().role : null;
      const decision = accessDecision(role, pathname ?? '/', window.location.search);
      if (decision.allow) setStatus('allowed');
      else router.replace(decision.redirectTo);
    })();

    return () => {
      cancelled = true;
    };
  }, [loadSession, pathname, router]);

  return status;
}
