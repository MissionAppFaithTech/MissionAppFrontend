import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type {
  MissionariesStep1Values,
  MissionariesStep2Values,
  MissionariesStep3Values,
  MissionaryRegisterData,
} from '@/forms/register/types';
import { SELECT_OTHER } from '@/forms/register/options';
import { personalStepErrors, signupFieldErrors } from '@/forms/register/shared/fieldErrors';
import {
  registerMissionary,
  toApiBirthDate,
  toApiGender,
  toE164Phone,
} from '@/services/account.service';
import {
  toCreateFaithCommunityPayload,
  toCreateMissionaryAgencyPayload,
} from '@/services/catalog.service';
import { toIdentityPayload } from '@/lib/masks';
import type { MissionarySignupInput } from '@/app/actions/account';

/**
 * In memory only, never persisted. The sign-up is one transactional request, so
 * a failure leaves nothing behind and a retry simply sends it again; this only
 * keeps a second click from sending it while the first is in flight.
 */
type RegisterSubmission = {
  pending?: boolean;
};

export interface MissionaryRegisterState {
  step: number;
  formData: Partial<MissionaryRegisterData>;
  submission: RegisterSubmission;
  hasHydrated: boolean;
  /**
   * Errors the API returned for fields of the first step ("Dados pessoais"). The
   * wizard goes back to that step and shows them on the fields. Memory only.
   */
  stepErrors: Record<string, string>;
  setStep: (step: number) => void;
  updateFormData: (data: Partial<MissionaryRegisterData>) => void;
  completeStep1: (values: MissionariesStep1Values) => void;
  completeStep2: (values: MissionariesStep2Values) => void;
  completeStep3: (values: MissionariesStep3Values) => Promise<void>;
  goBack: () => void;
  reset: () => void;
  setHasHydrated: (status: boolean) => void;
}

const STORAGE_KEY = 'missionapp_missionary_register_v1';

const initialState = {
  step: 1,
  formData: {} as Partial<MissionaryRegisterData>,
  submission: {} as RegisterSubmission,
  hasHydrated: false,
  stepErrors: {} as Record<string, string>,
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
          stepErrors: {},
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
        const email = merged.email?.trim().toLowerCase();

        if (!merged.fullName || !merged.phone || !merged.gender || !email || !merged.birthDate) {
          throw new Error('Complete os dados pessoais antes de finalizar o cadastro');
        }
        if (!merged.missionaryAgency) {
          throw new Error('Selecione a agência missionária antes de finalizar o cadastro');
        }

        // The agency comes from the catalog or is registered with the account.
        let agency: Pick<MissionarySignupInput, 'missionaryAgencyId' | 'missionaryAgency'>;
        if (merged.missionaryAgency === SELECT_OTHER) {
          if (!merged.agencyDetails?.name?.trim()) {
            throw new Error('Informe os dados da nova agência missionária');
          }
          agency = { missionaryAgency: toCreateMissionaryAgencyPayload(merged.agencyDetails) };
        } else {
          agency = { missionaryAgencyId: merged.missionaryAgency };
        }

        // The faith community is optional; "Não encontrei" without a name sends none.
        let community: Pick<MissionarySignupInput, 'faithCommunityId' | 'faithCommunity'> = {};
        if (merged.faithCommunity === SELECT_OTHER) {
          if (merged.communityDetails?.name?.trim()) {
            community = { faithCommunity: toCreateFaithCommunityPayload(merged.communityDetails) };
          }
        } else if (merged.faithCommunity) {
          community = { faithCommunityId: merged.faithCommunity };
        }

        const document = merged.document?.trim();
        const aboutMe = merged.missionDescription?.trim();

        const payload: MissionarySignupInput = {
          fullName: merged.fullName,
          username: values.username,
          phoneNumber: toE164Phone(merged.phone),
          gender: toApiGender(merged.gender),
          email,
          password: values.password,
          passwordConfirmation: values.confirmPassword,
          birthDate: toApiBirthDate(merged.birthDate),
          ...(document ? toIdentityPayload(document) : {}),
          ...(aboutMe ? { aboutMe } : {}),
          ...agency,
          ...community,
        };

        if (get().submission.pending) return;
        set({ submission: { pending: true } });
        try {
          await registerMissionary(payload);
        } catch (error) {
          set({ submission: {} });
          // NOTE: a field of the first step (e-mail in use...) is fixed there, not here.
          const personal = personalStepErrors(signupFieldErrors(error));
          if (Object.keys(personal).length > 0) {
            set({ step: 1, stepErrors: personal });
            return;
          }
          throw error;
        }

        const sanitizedAfterSuccess = { ...merged };
        delete (sanitizedAfterSuccess as Record<string, unknown>).password;
        delete (sanitizedAfterSuccess as Record<string, unknown>).confirmPassword;

        set({
          formData: sanitizedAfterSuccess,
          step: 4,
          submission: {},
        });
      },

      goBack: () => {
        set((state) => ({ step: Math.max(1, state.step - 1) }));
      },

      reset: () => {
        set({ step: 1, formData: {}, submission: {}, stepErrors: {} });
        useMissionaryRegisterStore.persist.clearStorage();
      },

      setHasHydrated: (status: boolean) => {
        set({ hasHydrated: status });
      },
    }),
    {
      name: STORAGE_KEY,
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
        // If registration completed (step 4), do not persist completion screen in storage
        // so returning to the registration page starts the normal wizard flow.
        if (state.step >= 4) {
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
