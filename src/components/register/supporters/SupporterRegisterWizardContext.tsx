'use client';

import { createContext, useCallback, useContext, useState, type ReactNode } from 'react';
import type {
  AccessCredentialsValues,
  SupporterRegisterData,
  SupportersStep1Values,
} from '@/forms/register/types';
import { SELECT_OTHER } from '@/forms/register/options';
import { registerAccount, toApiGender, toE164Phone } from '@/services/account.service';
import { createFaithCommunity } from '@/services/catalog.service';

type SupporterRegisterWizardContextValue = {
  step: number;
  formData: Partial<SupporterRegisterData>;
  completeStep1: (values: SupportersStep1Values) => void;
  completeStep2: (values: AccessCredentialsValues) => Promise<void>;
  goBack: () => void;
};

const SupporterRegisterWizardContext = createContext<SupporterRegisterWizardContextValue | null>(
  null
);

export function SupporterRegisterWizardProvider({ children }: { children: ReactNode }) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<Partial<SupporterRegisterData>>({});

  const completeStep1 = useCallback((values: SupportersStep1Values) => {
    setFormData((prev) => ({ ...prev, ...values }));
    setStep(2);
  }, []);

  const completeStep2 = useCallback(
    async (values: AccessCredentialsValues) => {
      const merged: Partial<SupporterRegisterData> = { ...formData, ...values };
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

      setFormData(merged);
      setStep(3);
    },
    [formData]
  );

  const goBack = useCallback(() => {
    setStep((current) => Math.max(1, current - 1));
  }, []);

  return (
    <SupporterRegisterWizardContext.Provider
      value={{
        step,
        formData,
        completeStep1,
        completeStep2,
        goBack,
      }}
    >
      {children}
    </SupporterRegisterWizardContext.Provider>
  );
}

export function useSupporterRegisterWizard() {
  const context = useContext(SupporterRegisterWizardContext);

  if (!context) {
    throw new Error(
      'useSupporterRegisterWizard must be used within SupporterRegisterWizardProvider'
    );
  }

  return context;
}
