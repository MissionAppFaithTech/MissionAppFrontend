import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { ApiError } from '@/lib/api/client';
import {
  emptyProfile,
  formatWorkAddress,
  getMyProfile,
  mapAccountProfile,
  updateAbout,
  updateHeader,
  updatePublicContacts,
  upsertWorkAddress,
  type UpdateAboutPayload,
  type UpdateHeaderPayload,
  type UpdatePublicContactsPayload,
} from '@/services/profile.service';
import type { BackendMissionary, BackendUser } from '@/types/backend';
import type { ProfileData, WorkAddressData } from '@/types/profile';

export const PROFILE_STORAGE_KEY = 'missionapp_profile_v2';
/** Pre-v2 key that kept e-mail, phone and financial data in localStorage. */
const LEGACY_STORAGE_KEY = 'missionapp_missionary_profile_v1';

export type ProfileStatus = 'idle' | 'loading' | 'ready' | 'error';

export interface ProfileState {
  profile: ProfileData;
  status: ProfileStatus;
  error: string | null;
  hasHydrated: boolean;

  /** Loads the logged-in user's profile. Never throws; read `status`/`error`. */
  fetchProfile: () => Promise<ProfileData | null>;
  /** Saves header fields and public contacts in sequence. Throws {@link ApiError}. */
  saveHeader: (input: {
    header?: UpdateHeaderPayload;
    contacts?: UpdatePublicContactsPayload;
  }) => Promise<void>;
  /** Saves "Sobre" fields and the work address in sequence. Throws {@link ApiError}. */
  saveAbout: (input: {
    about?: UpdateAboutPayload;
    workAddress?: WorkAddressData;
  }) => Promise<void>;
  setHasHydrated: (value: boolean) => void;
  reset: () => void;
}

const initialState = {
  profile: emptyProfile,
  status: 'idle' as ProfileStatus,
  error: null as string | null,
};

function applyUser(profile: ProfileData, user: Partial<BackendUser>): ProfileData {
  return {
    ...profile,
    displayName: user.fullName ?? profile.displayName,
    username: user.username ?? profile.username,
    roleDescription:
      user.biography === undefined ? profile.roleDescription : (user.biography ?? ''),
  };
}

function pick<T>(value: T | null | undefined, fallback: T): T {
  if (value === undefined) return fallback;
  return (value ?? '') as T;
}

function applyMissionary(
  profile: ProfileData,
  missionary: Partial<BackendMissionary>
): ProfileData {
  const about = profile.about;
  const contact = profile.contact ?? { publicEmail: '', publicPhone: '' };
  return {
    ...profile,
    about: {
      ...about,
      introduction: pick(missionary.aboutMe, about.introduction),
      missionHistory: pick(missionary.missionStorySummary, about.missionHistory ?? ''),
      originLocation: pick(missionary.originLocation, about.originLocation),
      prayerRequests: pick(missionary.prayerRequest, about.prayerRequests ?? ''),
      lifeVerse: pick(missionary.lifeVerse, about.lifeVerse),
    },
    contact: {
      ...contact,
      publicEmail: pick(missionary.publicEmail, contact.publicEmail),
      publicPhone: pick(missionary.publicPhone, contact.publicPhone),
    },
  };
}

function applyWorkAddress(profile: ProfileData, address: WorkAddressData): ProfileData {
  const currentLocation = formatWorkAddress(address);
  return {
    ...profile,
    location: currentLocation,
    about: { ...profile.about, workAddress: address, currentLocation },
  };
}

/** Only public profile fields reach sessionStorage: no e-mail, phone, documents or finances. */
function toPersistedProfile(profile: ProfileData): ProfileData {
  const { contact: _contact, financial: _financial, ...publicFields } = profile;
  return publicFields;
}

const sessionStorageSafe = createJSONStorage(() =>
  typeof window === 'undefined'
    ? { getItem: () => null, setItem: () => {}, removeItem: () => {} }
    : window.sessionStorage
);

export const useProfileStore = create<ProfileState>()(
  persist(
    (set, get) => ({
      ...initialState,
      hasHydrated: false,

      fetchProfile: async () => {
        set({ status: 'loading', error: null });
        try {
          const profile = mapAccountProfile(await getMyProfile());
          set({ profile, status: 'ready', error: null });
          return profile;
        } catch (error) {
          if (error instanceof ApiError && error.status === 401) {
            get().reset();
            return null;
          }
          const message =
            error instanceof Error ? error.message : 'Não foi possível carregar o seu perfil';
          set({ status: 'error', error: message });
          return null;
        }
      },

      saveHeader: async ({ header, contacts }) => {
        if (header && Object.keys(header).length > 0) {
          const user = await updateHeader(header);
          set({ profile: applyUser(get().profile, { ...header, ...user }) });
        }
        if (contacts && Object.keys(contacts).length > 0) {
          const missionary = await updatePublicContacts(contacts);
          set({ profile: applyMissionary(get().profile, { ...contacts, ...missionary }) });
        }
      },

      saveAbout: async ({ about, workAddress }) => {
        if (about && Object.keys(about).length > 0) {
          const missionary = await updateAbout(about);
          set({ profile: applyMissionary(get().profile, { ...about, ...missionary }) });
        }
        if (workAddress) {
          const saved = await upsertWorkAddress(workAddress);
          set({ profile: applyWorkAddress(get().profile, saved) });
        }
      },

      setHasHydrated: (value) => set({ hasHydrated: value }),

      reset: () => {
        set({ ...initialState });
        useProfileStore.persist.clearStorage();
      },
    }),
    {
      name: PROFILE_STORAGE_KEY,
      version: 2,
      storage: sessionStorageSafe,
      // Rehydrated from an effect (see `rehydrateProfileStore`) to avoid SSR mismatches.
      skipHydration: true,
      partialize: (state) => ({ profile: toPersistedProfile(state.profile) }),
      migrate: () => ({ profile: emptyProfile }),
      merge: (persisted, current) => {
        const stored = (persisted as { profile?: ProfileData } | undefined)?.profile;
        return stored ? { ...current, profile: { ...emptyProfile, ...stored } } : current;
      },
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);

/** Client-only: restores the cached public profile and drops the legacy PII cache. */
export async function rehydrateProfileStore() {
  try {
    window.localStorage.removeItem(LEGACY_STORAGE_KEY);
  } catch {
    // Storage can be blocked (private mode, sandboxed iframe).
  }
  await useProfileStore.persist.rehydrate();
}
