import { act, render, type RenderOptions, type RenderResult } from '@testing-library/react';
import type { ReactElement, ReactNode } from 'react';
import { SessionProvider } from '@/components/auth/SessionProvider';
import { ANONYMOUS_SESSION, type SessionSnapshot } from '@/lib/auth/session';
import type { BackendRole } from '@/types/backend';

/** A logged-in session snapshot for tests. */
export function authenticatedSession(role: BackendRole | null, userId = 'user-1'): SessionSnapshot {
  return { status: 'authenticated', userId, role };
}

/**
 * Renders `ui` under the server session context (ADR-0005), as the root layout
 * does. Consumers suspend on the first render; awaiting this lets React retry
 * them inside `act`, so the session is already applied when it resolves.
 */
export async function renderWithSession(
  ui: ReactElement,
  session: SessionSnapshot = ANONYMOUS_SESSION,
  options?: RenderOptions
): Promise<RenderResult> {
  const sessionPromise = Promise.resolve(session);
  const Wrapper = ({ children }: { children: ReactNode }) => (
    <SessionProvider session={sessionPromise}>{children}</SessionProvider>
  );
  let result: RenderResult | undefined;
  await act(async () => {
    result = render(ui, { wrapper: Wrapper, ...options });
  });
  return result as RenderResult;
}
