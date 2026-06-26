"use client";

import { createContext, useCallback, useContext, useState, type ReactNode } from "react";
import type {
  MissionariesStep1Values,
  MissionariesStep2Values,
  MissionariesStep3Values,
  MissionaryRegisterData,
} from "@/forms/register/types";

type MissionaryRegisterWizardContextValue = {
  step: number;
  formData: Partial<MissionaryRegisterData>;
  completeStep1: (values: MissionariesStep1Values) => void;
  completeStep2: (values: MissionariesStep2Values) => void;
  completeStep3: (values: MissionariesStep3Values) => void;
  goBack: () => void;
};

const MissionaryRegisterWizardContext =
  createContext<MissionaryRegisterWizardContextValue | null>(null);

export function MissionaryRegisterWizardProvider({ children }: { children: ReactNode }) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<Partial<MissionaryRegisterData>>({});

  const completeStep1 = useCallback((values: MissionariesStep1Values) => {
    setFormData((prev) => ({ ...prev, ...values }));
    setStep(2);
  }, []);

  const completeStep2 = useCallback((values: MissionariesStep2Values) => {
    setFormData((prev) => ({ ...prev, ...values }));
    setStep(3);
  }, []);

  const completeStep3 = useCallback((values: MissionariesStep3Values) => {
    setFormData((prev) => ({ ...prev, ...values }));
    // TODO: enviar formData + values para a API
    setStep(4);
  }, []);

  const goBack = useCallback(() => {
    setStep((current) => Math.max(1, current - 1));
  }, []);

  return (
    <MissionaryRegisterWizardContext.Provider
      value={{
        step,
        formData,
        completeStep1,
        completeStep2,
        completeStep3,
        goBack,
      }}
    >
      {children}
    </MissionaryRegisterWizardContext.Provider>
  );
}

export function useMissionaryRegisterWizard() {
  const context = useContext(MissionaryRegisterWizardContext);

  if (!context) {
    throw new Error(
      "useMissionaryRegisterWizard must be used within MissionaryRegisterWizardProvider"
    );
  }

  return context;
}
