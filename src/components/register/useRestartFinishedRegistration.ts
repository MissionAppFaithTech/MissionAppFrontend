'use client';

import { useEffect, useState } from 'react';

/**
 * The step to show for a wizard whose last step is the "cadastro realizado"
 * screen. Finishing keeps that screen up; opening the wizard again after
 * finishing (the store still holds the last step in memory) starts over at
 * step 1.
 *
 * NOTE: never reset the wizard in an unmount cleanup: React (StrictMode in dev,
 * and any real remount) unmounts and mounts effects again, which wiped the
 * screen right after a successful sign-up.
 */
export function useRestartFinishedRegistration(
  step: number,
  finalStep: number,
  reset: () => void
): number {
  // Opened on the final step: show step 1 until the reset reaches the store.
  const [restarting, setRestarting] = useState(() => step === finalStep);
  if (restarting && step !== finalStep) setRestarting(false);

  useEffect(() => {
    if (restarting) reset();
  }, [restarting, reset]);

  return restarting ? 1 : step;
}
