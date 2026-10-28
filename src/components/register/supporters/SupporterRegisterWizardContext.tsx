'use client';

import { type ReactNode } from 'react';
import { useSupporterRegisterStore } from '@/stores/supporterRegisterStore';

/**
 * Provider wrapper for backward compatibility.
 * State is managed by Zustand via useSupporterRegisterStore with persistence.
 */
export function SupporterRegisterWizardProvider({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

export function useSupporterRegisterWizard() {
  const step = useSupporterRegisterStore((s) => s.step);
  const formData = useSupporterRegisterStore((s) => s.formData);
  const completeStep1 = useSupporterRegisterStore((s) => s.completeStep1);
  const completeStep2 = useSupporterRegisterStore((s) => s.completeStep2);
  const goBack = useSupporterRegisterStore((s) => s.goBack);
  const reset = useSupporterRegisterStore((s) => s.reset);

  return {
    step,
    formData,
    completeStep1,
    completeStep2,
    goBack,
    reset,
  };
}
