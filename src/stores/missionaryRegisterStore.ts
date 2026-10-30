import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type {
  MissionariesStep1Values,
  MissionariesStep2Values,
  MissionariesStep3Values,
  MissionaryRegisterData,
} from '@/forms/register/types';
import { SELECT_OTHER } from '@/forms/register/options';
import { registerAccount, toApiGender, toE164Phone } from '@/services/account.service';
import {
  createFaithCommunity,
  createMissionaryAgency,
  listMissionaryAgencies,
} from '@/services/catalog.service';
import { createMissionaryProfile } from '@/services/missionary.service';

export interface MissionaryRegisterState {
  step: number;
  formData: Partial<MissionaryRegisterData>;
  hasHydrated: boolean;
  setStep: (step: number) => void;
  updateFormData: (data: Partial<MissionaryRegisterData>) => void;
  completeStep1: (values: MissionariesStep1Values) => void;
  completeStep2: (values: MissionariesStep2Values) => void;
  completeStep3: (values: MissionariesStep3Values) => Promise<void>;
  goBack: () => void;
  reset: () => void;
  setHasHydrated: (status: boolean) => void;
}

const initialState = {
  step: 1,
  formData: {} as Partial<MissionaryRegisterData>,
  hasHydrated: false,
};

export const useMissionaryRegisterStore = create<MissionaryRegisterState>()(
  persist(
    (set, get) => ({
      ...initialState,

      setStep: (step: number) => set({ step }),

      updateFormData: (data: Partial<MissionaryRegisterData>) => {
        set((state) => ({ formData: { ...state.formData, ...data } }));
      },

      completeStep1: (values: MissionariesStep1Values) => {
        set((state) => ({
          formData: { ...state.formData, ...values },
          step: 2,
        }));
      },

      completeStep2: (values: MissionariesStep2Values) => {
        set((state) => ({
          formData: { ...state.formData, ...values },
          step: 3,
        }));
      },

      completeStep3: async (values: MissionariesStep3Values) => {
        const currentData = get().formData;
        const merged: Partial<MissionaryRegisterData> = { ...currentData, ...values };
        const email = merged.email?.trim();

        if (!merged.fullName || !merged.phone || !merged.gender || !email) {
          throw new Error('Complete os dados pessoais antes de finalizar o cadastro');
        }

        await registerAccount({
          fullName: merged.fullName,
          username: values.username,
          phoneNumber: toE164Phone(merged.phone),
          gender: toApiGender(merged.gender),
          email,
          password: values.password,
          passwordConfirmation: values.confirmPassword,
        });

        let resolvedAgencyId = merged.missionaryAgency;

        if (merged.missionaryAgency === SELECT_OTHER && merged.agencyDetails?.name) {
          const createdAgency = await createMissionaryAgency(merged.agencyDetails);
          resolvedAgencyId = createdAgency.id;
        }
        if (merged.faithCommunity === SELECT_OTHER && merged.communityDetails?.name) {
          await createFaithCommunity(merged.communityDetails);
        }

        if (!resolvedAgencyId || resolvedAgencyId === SELECT_OTHER) {
          const agencies = await listMissionaryAgencies().catch(() => []);
          if (agencies.length > 0) {
            resolvedAgencyId = agencies[0].id;
          }
        }

        if (resolvedAgencyId && resolvedAgencyId !== SELECT_OTHER) {
          await createMissionaryProfile(resolvedAgencyId).catch(() => {});
        }

        // Never retain plain text passwords in store state or storage
        const sanitizedAfterSuccess = { ...merged };
        delete (sanitizedAfterSuccess as Record<string, unknown>).password;
        delete (sanitizedAfterSuccess as Record<string, unknown>).confirmPassword;

        set({
          formData: sanitizedAfterSuccess,
          step: 4,
        });
      },

      goBack: () => {
        set((state) => ({ step: Math.max(1, state.step - 1) }));
      },

      reset: () => {
        if (typeof window !== 'undefined') {
          window.localStorage.removeItem('missionapp_missionary_register_v1');
        }
        set({
          step: 1,
          formData: {},
        });
      },

      setHasHydrated: (status: boolean) => {
        set({ hasHydrated: status });
      },
    }),
    {
      name: 'missionapp_missionary_register_v1',
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
      partialize: (state) => {
        // If registration completed (step 4), do not persist completion screen in localStorage
        // so returning to the registration page starts the normal wizard flow.
        if (state.step >= 4) {
          return {
            step: 1,
            formData: {},
          };
        }

        // Strip sensitive credentials from localStorage to avoid credential leakage via XSS
        const sanitizedFormData = { ...state.formData };
        delete (sanitizedFormData as Record<string, unknown>).password;
        delete (sanitizedFormData as Record<string, unknown>).confirmPassword;

        return {
          step: state.step,
          formData: sanitizedFormData,
        };
      },
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
