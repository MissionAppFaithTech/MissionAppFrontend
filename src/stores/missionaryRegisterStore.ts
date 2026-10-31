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
import { login } from '@/services/auth.service';
import { createFaithCommunity, createMissionaryAgency } from '@/services/catalog.service';
import { toIdentityPayload } from '@/lib/masks';
import { completeMissionaryAbout, createMissionaryProfile } from '@/services/missionary.service';
import { updateMissionaryIdentity } from '@/services/profile.service';

/** Remote steps already done for this sign-up (in memory only, never persisted). */
type RegisterSubmission = {
  accountCreated?: boolean;
  agencyId?: string;
  communityId?: string;
  missionaryCreated?: boolean;
  identitySaved?: boolean;
  aboutSaved?: boolean;
};

export interface MissionaryRegisterState {
  step: number;
  formData: Partial<MissionaryRegisterData>;
  submission: RegisterSubmission;
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

const STORAGE_KEY = 'missionapp_missionary_register_v1';

const initialState = {
  step: 1,
  formData: {} as Partial<MissionaryRegisterData>,
  submission: {} as RegisterSubmission,
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
        const email = merged.email?.trim().toLowerCase();

        if (!merged.fullName || !merged.phone || !merged.gender || !email) {
          throw new Error('Complete os dados pessoais antes de finalizar o cadastro');
        }
        if (!merged.missionaryAgency) {
          throw new Error('Selecione a agência missionária antes de finalizar o cadastro');
        }

        // Each step runs once even if the user retries after a later failure.
        const progress = get().submission;
        const mark = (patch: Partial<RegisterSubmission>) =>
          set((state) => ({ submission: { ...state.submission, ...patch } }));

        if (!progress.accountCreated) {
          await registerAccount({
            fullName: merged.fullName,
            username: values.username,
            phoneNumber: toE164Phone(merged.phone),
            gender: toApiGender(merged.gender),
            email,
            password: values.password,
            passwordConfirmation: values.confirmPassword,
          });
          mark({ accountCreated: true });
        }

        let agencyId = get().submission.agencyId ?? merged.missionaryAgency;
        if (agencyId === SELECT_OTHER) {
          if (!merged.agencyDetails?.name) {
            throw new Error('Informe os dados da nova agência missionária');
          }
          agencyId = (await createMissionaryAgency(merged.agencyDetails)).id;
          mark({ agencyId });
        }

        let communityId = get().submission.communityId ?? merged.faithCommunity;
        if (communityId === SELECT_OTHER) {
          communityId = merged.communityDetails?.name
            ? (await createFaithCommunity(merged.communityDetails)).id
            : undefined;
          mark({ communityId });
        }

        if (!get().submission.missionaryCreated) {
          await createMissionaryProfile(agencyId);
          mark({ missionaryCreated: true });
        }

        // Creating the missionary profile revokes every session: log in again
        // with the credentials still in memory, then send what only a missionary can save.
        await login({ login: email, password: values.password });

        if (!get().submission.identitySaved && merged.document?.trim()) {
          await updateMissionaryIdentity(toIdentityPayload(merged.document));
          mark({ identitySaved: true });
        }

        const aboutMe = merged.missionDescription?.trim();
        if (!get().submission.aboutSaved && (communityId || aboutMe)) {
          await completeMissionaryAbout({
            ...(communityId ? { faithCommunityId: communityId } : {}),
            ...(aboutMe ? { aboutMe } : {}),
          });
          mark({ aboutSaved: true });
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
        set({ step: 1, formData: {}, submission: {} });
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
