import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import {
  emptyProfile,
  fetchAccountProfile,
  mapBackendToProfileData,
  updateAccountProfile,
  updateMissionaryAboutData,
  updateMissionaryProfileData,
  updateMissionaryWorkAddress,
  type UpdateMissionaryWorkAddressPayload,
} from '@/services/profile.service';
import type { ProfileAboutData, ProfileData } from '@/types/profile';

export interface ProfileState {
  profile: ProfileData;
  isLoading: boolean;
  error: string | null;
  hasHydrated: boolean;

  fetchProfile: () => Promise<ProfileData>;
  updateAbout: (data: Partial<ProfileAboutData>) => Promise<void>;
  updateHeaderProfile: (data: {
    displayName?: string;
    username?: string;
    bio?: string;
    currentLocation?: string;
    publicEmail?: string;
    publicPhone?: string;
  }) => Promise<void>;
  updateWorkAddress: (data: UpdateMissionaryWorkAddressPayload) => Promise<void>;
  setProfile: (profile: ProfileData) => void;
  setHasHydrated: (status: boolean) => void;
  reset: () => void;
}

const initialProfile: ProfileData = emptyProfile;

export const useProfileStore = create<ProfileState>()(
  persist(
    (set, get) => ({
      profile: initialProfile,
      isLoading: false,
      error: null,
      hasHydrated: false,

      fetchProfile: async () => {
        set({ isLoading: true, error: null });
        try {
          const backendData = await fetchAccountProfile();
          const mapped = mapBackendToProfileData(backendData, get().profile);
          set({ profile: mapped, isLoading: false, error: null });
          return mapped;
        } catch (err) {
          const message = err instanceof Error ? err.message : 'Falha ao buscar perfil';
          if (
            message.includes('401') ||
            message.includes('Não autorizado') ||
            message.includes('unauthorized') ||
            message.includes('Sessão')
          ) {
            get().reset();
          }
          set({ isLoading: false, error: message });
          return get().profile;
        }
      },

      updateAbout: async (aboutData: Partial<ProfileAboutData>) => {
        set({ isLoading: true, error: null });
        const current = get().profile;
        const updatedAbout: ProfileAboutData = {
          ...current.about,
          ...aboutData,
        };

        try {
          await updateMissionaryAboutData({
            aboutMe: updatedAbout.introduction,
            missionStorySummary: updatedAbout.missionHistory,
            originLocation: updatedAbout.originLocation,
            faithCommunityId:
              updatedAbout.faithCommunity && updatedAbout.faithCommunity.includes('-')
                ? updatedAbout.faithCommunity
                : undefined,
            prayerRequest: updatedAbout.prayerRequests,
            lifeVerse: updatedAbout.lifeVerse,
          });

          set({
            profile: {
              ...current,
              about: updatedAbout,
            },
            isLoading: false,
            error: null,
          });
        } catch (err) {
          // Optimistic local update for mock / offline fallback
          set({
            profile: {
              ...current,
              about: updatedAbout,
            },
            isLoading: false,
            error: null,
          });
          const message = err instanceof Error ? err.message : 'Falha ao salvar sobre';
          console.warn('[profileStore.updateAbout]', message);
        }
      },

      updateHeaderProfile: async (data) => {
        set({ isLoading: true, error: null });
        const current = get().profile;

        const updatedProfile: ProfileData = {
          ...current,
          displayName: data.displayName ?? current.displayName,
          username: data.username ?? current.username,
          roleDescription: data.bio ?? current.roleDescription,
          location: data.currentLocation ?? current.location,
          about: {
            ...current.about,
            currentLocation: data.currentLocation ?? current.about.currentLocation,
          },
          contact: {
            ...current.contact,
            publicEmail: data.publicEmail ?? current.contact?.publicEmail ?? '',
            publicPhone: data.publicPhone ?? current.contact?.publicPhone ?? '',
          },
        };

        try {
          if (
            data.displayName !== undefined ||
            data.username !== undefined ||
            data.bio !== undefined
          ) {
            await updateAccountProfile({
              fullName: data.displayName,
              username: data.username,
              biography: data.bio,
            });
          }

          if (data.publicEmail || data.publicPhone) {
            await updateMissionaryProfileData({
              publicEmail: data.publicEmail,
              publicPhone: data.publicPhone,
            });
          }

          if (data.currentLocation) {
            const parts = data.currentLocation.split(/[\/,]/).map((s) => s.trim());
            const city = parts[0] || '';
            const state = parts[1] || '';
            if (city) {
              await updateMissionaryWorkAddress({
                city,
                state: state || 'SP',
                country: 'Brasil',
                district: 'Centro',
                zip: '01001-000',
              }).catch(() => {});
            }
          }

          set({
            profile: updatedProfile,
            isLoading: false,
            error: null,
          });
        } catch (err) {
          // Optimistic update for mock / offline fallback
          set({
            profile: updatedProfile,
            isLoading: false,
            error: null,
          });
          const message = err instanceof Error ? err.message : 'Falha ao salvar perfil';
          console.warn('[profileStore.updateHeaderProfile]', message);
        }
      },

      updateWorkAddress: async (data: UpdateMissionaryWorkAddressPayload) => {
        set({ isLoading: true, error: null });
        const current = get().profile;
        const locationString = data.state ? `${data.city}/${data.state}` : data.city;

        try {
          await updateMissionaryWorkAddress(data);

          set({
            profile: {
              ...current,
              location: locationString,
              about: {
                ...current.about,
                currentLocation: locationString,
              },
            },
            isLoading: false,
            error: null,
          });
        } catch (err) {
          set({
            profile: {
              ...current,
              location: locationString,
              about: {
                ...current.about,
                currentLocation: locationString,
              },
            },
            isLoading: false,
            error: null,
          });
          const message = err instanceof Error ? err.message : 'Falha ao salvar endereço';
          console.warn('[profileStore.updateWorkAddress]', message);
        }
      },

      setProfile: (profile: ProfileData) => {
        set({ profile });
      },

      setHasHydrated: (status: boolean) => {
        set({ hasHydrated: status });
      },

      reset: () => {
        if (typeof window !== 'undefined') {
          try {
            window.localStorage.removeItem('missionapp_missionary_profile_v1');
          } catch {
            // Ignore storage access errors in restricted iframe/private mode
          }
        }
        set({
          profile: initialProfile,
          isLoading: false,
          error: null,
        });
      },
    }),
    {
      name: 'missionapp_missionary_profile_v1',
      storage: createJSONStorage(() => {
        if (typeof window !== 'undefined') {
          return window.localStorage;
        }
        return {
          getItem: () => null,
          setItem: () => {},
          removeItem: () => {},
        };
      }),
      partialize: (state) => ({
        profile: state.profile,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
