'use client';

import { type ReactNode } from 'react';
import { useMissionaryRegisterStore } from '@/stores/missionaryRegisterStore';

/**
 * Provider wrapper for backward compatibility.
 * State is managed by Zustand via useMissionaryRegisterStore with persistence.
 */
export function MissionaryRegisterWizardProvider({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

export function useMissionaryRegisterWizard() {
  const step = useMissionaryRegisterStore((s) => s.step);
  const formData = useMissionaryRegisterStore((s) => s.formData);
  const completeStep1 = useMissionaryRegisterStore((s) => s.completeStep1);
  const completeStep2 = useMissionaryRegisterStore((s) => s.completeStep2);
  const completeStep3 = useMissionaryRegisterStore((s) => s.completeStep3);
  const goBack = useMissionaryRegisterStore((s) => s.goBack);
  const reset = useMissionaryRegisterStore((s) => s.reset);

  return {
    step,
    formData,
    completeStep1,
    completeStep2,
    completeStep3,
    goBack,
    reset,
  };
}
