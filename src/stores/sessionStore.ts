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

export const useSessionStore = create<SessionState>()((set) => ({
  status: 'unknown',
  userId: null,
  role: null,

  loadSession: async () => {
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
      set({ status: 'unknown' });
      return 'unknown';
    }
  },

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
