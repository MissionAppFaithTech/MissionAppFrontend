import { getQueryClient } from '@/lib/query/client';
import { useChurchChecklistStore } from '@/stores/churchChecklistStore';
import { useFeedbackStore } from '@/stores/feedbackStore';
import { useMissionaryRegisterStore } from '@/stores/missionaryRegisterStore';
import { useSupporterRegisterStore } from '@/stores/supporterRegisterStore';

/**
 * Profile caches written by older versions: the v1 key kept e-mail, phone and
 * financial data in localStorage, and v2 kept the public profile in sessionStorage.
 * The profile is now read on the server (ADR-0005), so neither is used.
 */
const LEGACY_PROFILE_CACHE = [
  { storage: 'localStorage', key: 'missionapp_missionary_profile_v1' },
  { storage: 'sessionStorage', key: 'missionapp_profile_v2' },
] as const;

/** Client-only: removes the old profile caches from Web Storage. */
export function purgeLegacyProfileCache() {
  for (const { storage, key } of LEGACY_PROFILE_CACHE) {
    try {
      window[storage].removeItem(key);
    } catch {
      // Storage can be blocked (private mode, sandboxed iframe).
    }
  }
}

/** Prefix of the `RichTextEditor` autosave keys (unsent posts). */
export const DRAFT_KEY_PREFIX = 'draft_';

/** Client-only: removes the editors' autosaved drafts, which hold the account's unsent text. */
export function purgeDrafts() {
  for (const storage of ['localStorage', 'sessionStorage'] as const) {
    try {
      const store = window[storage];
      const keys = Array.from({ length: store.length }, (_, index) => store.key(index));
      for (const key of keys) {
        if (key?.startsWith(DRAFT_KEY_PREFIX)) store.removeItem(key);
      }
    } catch {
      // Storage can be blocked (private mode, sandboxed iframe).
    }
  }
}

/**
 * Drops every piece of user data kept in memory or Web Storage (ADR-0003): the
 * stores, the query cache of the client islands (ADR-0002) and the editors'
 * drafts. Component state is reset by `AccountScope` and the keyed owner
 * layout. The session itself is read on the server from the cookies
 * (ADR-0005); this only clears client state on login, logout and an expired
 * session.
 */
export function clearUserStores() {
  useMissionaryRegisterStore.getState().reset();
  useSupporterRegisterStore.getState().reset();
  useChurchChecklistStore.getState().reset();
  // A toast about the previous account (e.g. "E-mail alterado para ...").
  useFeedbackStore.setState({ current: null });
  getQueryClient().clear();
  purgeLegacyProfileCache();
  purgeDrafts();
}
