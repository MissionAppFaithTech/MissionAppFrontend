import { create } from 'zustand';
import { ApiError, bffRequest } from '@/lib/api/client';
import { useMissionaryRegisterStore } from '@/stores/missionaryRegisterStore';
import { useProfileStore } from '@/stores/profileStore';
import { useSupporterRegisterStore } from '@/stores/supporterRegisterStore';
import type { SessionInfo } from '@/types/backend';

export type SessionStatus = 'unknown' | 'authenticated' | 'anonymous';

export interface SessionState {
  status: SessionStatus;
  userId: string | null;
  role: SessionInfo['role'];
  /** Asks the BFF who is logged in. Never throws. */
  loadSession: () => Promise<SessionStatus>;
  /** Records the user returned by a successful login, so guards and the logo know the role at once. */
  setAuthenticated: (user: { id: string; role?: SessionInfo['role'] }) => void;
  /** Ends the session on the backend, clears cookies and every user-scoped store. */
  logout: () => Promise<void>;
  /** Local cleanup after the BFF reported 401 (cookies are already gone). */
  expire: () => void;
}

/** Drops every piece of user data kept in memory or Web Storage. */
export function clearUserStores() {
  useProfileStore.getState().reset();
  useMissionaryRegisterStore.getState().reset();
  useSupporterRegisterStore.getState().reset();
}

/** Concurrent callers (layout guard, logo, menu) share one request. */
let pendingSession: Promise<SessionStatus> | null = null;

export const useSessionStore = create<SessionState>()((set) => ({
  status: 'unknown',
  userId: null,
  role: null,

  loadSession: () => {
    pendingSession ??= (async (): Promise<SessionStatus> => {
      try {
        const { data } = await bffRequest<{ data: SessionInfo }>('/api/auth/session', {
          fallbackMessage: 'Não foi possível verificar a sessão',
        });
        set({ status: 'authenticated', userId: data.userId, role: data.role });
        return 'authenticated';
      } catch (error) {
        if (error instanceof ApiError && error.status === 401) {
          set({ status: 'anonymous', userId: null, role: null });
          return 'anonymous';
        }
        // Unknown means unknown: never keep a previous user's role next to it.
        set({ status: 'unknown', userId: null, role: null });
        return 'unknown';
      } finally {
        pendingSession = null;
      }
    })();
    return pendingSession;
  },

  setAuthenticated: (user) =>
    set({ status: 'authenticated', userId: user.id, role: user.role ?? null }),

  logout: async () => {
    // If the BFF is unreachable the cookies are still set: keep the local state in
    // sync with the session and let the caller report the failure.
    await bffRequest('/api/auth/logout', {
      method: 'POST',
      fallbackMessage: 'Não foi possível sair da conta',
    });
    clearUserStores();
    set({ status: 'anonymous', userId: null, role: null });
  },

  expire: () => {
    clearUserStores();
    set({ status: 'anonymous', userId: null, role: null });
  },
}));
