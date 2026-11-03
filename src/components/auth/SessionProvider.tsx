'use client';

import { createContext, use, useContext, type ReactNode } from 'react';
import { ANONYMOUS_SESSION, type SessionSnapshot } from '@/lib/auth/session';

const SessionContext = createContext<Promise<SessionSnapshot> | null>(null);

/**
 * Shares the server-read session as a promise (ADR-0005). The root layout never
 * awaits it, so pages stay prerendered; each consumer unwraps it with `use()`
 * inside its own `<Suspense>` boundary.
 */
export function SessionProvider({
  session,
  children,
}: {
  session: Promise<SessionSnapshot>;
  children: ReactNode;
}) {
  return <SessionContext value={session}>{children}</SessionContext>;
}

/** The current session. Suspends until the server sends it; wrap callers in `<Suspense>`. */
export function useSession(): SessionSnapshot {
  const session = useContext(SessionContext);
  return session ? use(session) : ANONYMOUS_SESSION;
}
