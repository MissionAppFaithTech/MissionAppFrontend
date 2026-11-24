'use client';

import type { ReactNode } from 'react';
import Alert from '@mui/material/Alert';
import Skeleton from '@mui/material/Skeleton';
import PillButton from '@/components/common/PillButton';
import { useMyImpactProject } from '@/components/profile/useMyImpactProject';
import type { ImpactProjectData } from '@/types/profile';

type ImpactProjectStateGateProps = {
  loadingLabel: string;
  skeletonHeight: number;
  /** `reload` fetches the project again (after creating, editing or deleting it). */
  children: (project: ImpactProjectData | null, reload: () => void) => ReactNode;
};

/** Shows a skeleton / retryable error until the missionary's project is known. */
export default function ImpactProjectStateGate({
  loadingLabel,
  skeletonHeight,
  children,
}: ImpactProjectStateGateProps) {
  const state = useMyImpactProject();

  if (state.status === 'ready') return children(state.project, state.reload);

  if (state.status === 'error') {
    return (
      <Alert
        severity="error"
        role="alert"
        action={
          <PillButton tone="primarySoftOutline" size="small" onClick={state.retry}>
            Tentar novamente
          </PillButton>
        }
      >
        {state.message}
      </Alert>
    );
  }

  return (
    <Skeleton
      variant="rounded"
      height={skeletonHeight}
      role="status"
      aria-busy="true"
      aria-label={loadingLabel}
    />
  );
}
