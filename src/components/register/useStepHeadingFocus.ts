'use client';

import { useEffect, useRef } from 'react';
import { REGISTER_STEP_HEADING_ID } from '@/forms/register/shared/RegisterStepForm';

/**
 * Moves focus to the new step's heading when the wizard changes step, so screen
 * readers announce "Etapa 2 de 3: …" instead of losing focus with the removed
 * form. Not on the first render (the page keeps its normal focus order), and not
 * when the new step already focused something (its error summary).
 */
export function useStepHeadingFocus(step: number) {
  const previousStep = useRef(step);

  useEffect(() => {
    if (previousStep.current === step) return;
    previousStep.current = step;

    const active = document.activeElement;
    if (active && active !== document.body) return;

    const target =
      document.getElementById(REGISTER_STEP_HEADING_ID) ?? document.getElementById('main-content');
    target?.focus();
  }, [step]);
}
