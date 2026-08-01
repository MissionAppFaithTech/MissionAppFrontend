'use client';

import { createContext, useCallback, useContext, useState, type ReactNode } from 'react';
import type {
  AccessCredentialsValues,
  SupporterRegisterData,
  SupportersStep1Values,
} from '@/forms/register/types';

type SupporterRegisterWizardContextValue = {
  step: number;
  formData: Partial<SupporterRegisterData>;
  completeStep1: (values: SupportersStep1Values) => void;
  completeStep2: (values: AccessCredentialsValues) => void;
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

  const completeStep2 = useCallback((values: AccessCredentialsValues) => {
    setFormData((prev) => ({ ...prev, ...values }));
    // TODO: enviar formData + values para POST /api/v1/accounts
    setStep(3);
  }, []);

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
