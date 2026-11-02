'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { SESSION_EXPIRED_EVENT } from '@/lib/api/client';
import { useSessionStore } from '@/stores/sessionStore';

/** Pages that need a session (mirrors `src/proxy.ts`). */
export function isProtectedPath(pathname: string) {
  return (
    (pathname === '/profile' || pathname.startsWith('/profile/')) &&
    !pathname.startsWith('/profile/missionario/')
  );
}

/**
 * Listens for 401s reported by `bffRequest`: wipes user data from memory and
 * Web Storage and, on a protected page, sends the user to login.
 */
export function SessionWatcher() {
  const router = useRouter();
  const pathname = usePathname();
  const expire = useSessionStore((s) => s.expire);

  useEffect(() => {
    const onExpired = () => {
      expire();
      if (isProtectedPath(window.location.pathname)) {
        const next = `${window.location.pathname}${window.location.search}`;
        router.replace(`/login?reason=expired&next=${encodeURIComponent(next)}`);
      }
    };
    window.addEventListener(SESSION_EXPIRED_EVENT, onExpired);
    return () => window.removeEventListener(SESSION_EXPIRED_EVENT, onExpired);
  }, [expire, router, pathname]);

  return null;
}
