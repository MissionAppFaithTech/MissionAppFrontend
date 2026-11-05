'use client';

import { Fragment, type ReactNode } from 'react';
import { useSession } from '@/components/auth/SessionProvider';

/**
 * Remounts its subtree when the logged-in account changes. Next.js keeps a
 * route's client state across navigations, and login/logout are soft
 * navigations, so without this the next account would see the previous one's
 * local state (photo preview, unsaved form text, follow toggles...).
 *
 * Suspends until the session arrives: render it inside `<Suspense>`.
 */
export default function AccountScope({ children }: { children: ReactNode }) {
  const session = useSession();
  const accountKey =
    session.status === 'authenticated' ? (session.userId ?? 'unknown') : 'anonymous';
  return <Fragment key={accountKey}>{children}</Fragment>;
}
