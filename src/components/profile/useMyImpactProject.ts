'use client';

import { useCallback, useEffect, useState } from 'react';
import { useOwnerProfile } from '@/components/profile/OwnerProfileProvider';
import { getMissionaryImpactProject } from '@/services/impactProject.service';
import type { ImpactProjectData } from '@/types/profile';

export type MyImpactProjectState =
  | { status: 'loading' }
  | { status: 'error'; message: string; retry: () => void }
  | { status: 'ready'; project: ImpactProjectData | null };

/**
 * Loads the logged-in missionary's impact project (at most one). The profile,
 * which carries the missionary id, is already loaded by the profile layout.
 */
export function useMyImpactProject(): MyImpactProjectState {
  const { missionaryId } = useOwnerProfile();
  const [attempt, setAttempt] = useState(0);
  const [result, setResult] = useState<
    { key: string; project: ImpactProjectData | null } | { key: string; error: string } | null
  >(null);

  const key = `${missionaryId}:${attempt}`;

  useEffect(() => {
    if (!missionaryId) return;
    let cancelled = false;
    getMissionaryImpactProject(missionaryId)
      .then((project) => !cancelled && setResult({ key, project }))
      .catch(
        (error: unknown) =>
          !cancelled &&
          setResult({
            key,
            error:
              error instanceof Error
                ? error.message
                : 'Não foi possível carregar o seu projeto de impacto',
          })
      );
    return () => {
      cancelled = true;
    };
  }, [missionaryId, key]);

  const retry = useCallback(() => {
    setResult(null);
    setAttempt((value) => value + 1);
  }, []);

  if (!missionaryId) return { status: 'ready', project: null };
  if (!result || result.key !== key) return { status: 'loading' };
  if ('error' in result) return { status: 'error', message: result.error, retry };
  return { status: 'ready', project: result.project };
}
