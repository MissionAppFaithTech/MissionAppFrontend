import type { BackendRole } from '@/types/backend';

/** Who is logged in, as rendered by the server (ADR-0005). */
export type SessionSnapshot = {
  status: 'authenticated' | 'anonymous';
  userId: string | null;
  role: BackendRole | null;
};

export const ANONYMOUS_SESSION: SessionSnapshot = {
  status: 'anonymous',
  userId: null,
  role: null,
};
