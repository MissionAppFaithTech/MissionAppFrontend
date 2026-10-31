import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type {
  AccessCredentialsValues,
  SupporterRegisterData,
  SupportersStep1Values,
} from '@/forms/register/types';
import { SELECT_OTHER } from '@/forms/register/options';
import { registerAccount, toApiGender, toE164Phone } from '@/services/account.service';
import { createFaithCommunity } from '@/services/catalog.service';

export interface SupporterRegisterState {
  step: number;
  formData: Partial<SupporterRegisterData>;
  hasHydrated: boolean;
  setStep: (step: number) => void;
  updateFormData: (data: Partial<SupporterRegisterData>) => void;
  completeStep1: (values: SupportersStep1Values) => void;
  completeStep2: (values: AccessCredentialsValues) => Promise<void>;
  goBack: () => void;
  reset: () => void;
  setHasHydrated: (status: boolean) => void;
}

const initialState = {
  step: 1,
  formData: {} as Partial<SupporterRegisterData>,
  hasHydrated: false,
};

export const useSupporterRegisterStore = create<SupporterRegisterState>()(
  persist(
    (set, get) => ({
      ...initialState,

      setStep: (step: number) => set({ step }),

      updateFormData: (data: Partial<SupporterRegisterData>) => {
        set((state) => ({ formData: { ...state.formData, ...data } }));
      },

      completeStep1: (values: SupportersStep1Values) => {
        set((state) => ({
          formData: { ...state.formData, ...values },
          step: 2,
        }));
      },

      completeStep2: async (values: AccessCredentialsValues) => {
        const currentData = get().formData;
        const merged: Partial<SupporterRegisterData> = { ...currentData, ...values };
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

        if (merged.faithCommunity === SELECT_OTHER && merged.communityDetails?.name) {
          await createFaithCommunity(merged.communityDetails);
        }

        // Never retain plain text passwords in store state or storage
        const sanitizedAfterSuccess = { ...merged };
        delete (sanitizedAfterSuccess as Record<string, unknown>).password;
        delete (sanitizedAfterSuccess as Record<string, unknown>).confirmPassword;

        set({
          formData: sanitizedAfterSuccess,
          step: 3,
        });
      },

      goBack: () => {
        set((state) => ({ step: Math.max(1, state.step - 1) }));
      },

      reset: () => {
        set({ step: 1, formData: {} });
        useSupporterRegisterStore.persist.clearStorage();
      },

      setHasHydrated: (status: boolean) => {
        set({ hasHydrated: status });
      },
    }),
    {
      name: 'missionapp_supporter_register_v1',
      // Drafts hold personal data: keep them for this tab only.
      storage: createJSONStorage(() => {
        if (typeof window !== 'undefined') {
          return window.sessionStorage;
        }
        return {
          getItem: () => null,
          setItem: () => {},
          removeItem: () => {},
        };
      }),
      partialize: (state) => {
        // If registration completed (step 3), do not persist completion screen in storage
        // so returning to the registration page starts the normal wizard flow.
        if (state.step >= 3) {
          return {
            step: 1,
            formData: {},
          };
        }

        // Strip sensitive credentials from storage to avoid credential leakage via XSS
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
