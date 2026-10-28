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
import { createFaithCommunity, createMissionaryAgency } from '@/services/catalog.service';

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

        if (merged.missionaryAgency === SELECT_OTHER && merged.agencyDetails?.name) {
          await createMissionaryAgency(merged.agencyDetails);
        }
        if (merged.faithCommunity === SELECT_OTHER && merged.communityDetails?.name) {
          await createFaithCommunity(merged.communityDetails);
        }

        set({
          formData: merged,
          step: 4,
        });
      },

      goBack: () => {
        set((state) => ({ step: Math.max(1, state.step - 1) }));
      },

      reset: () => {
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
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
