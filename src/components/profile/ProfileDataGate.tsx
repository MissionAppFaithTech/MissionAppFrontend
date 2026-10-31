'use client';

import type { ReactNode } from 'react';
import Alert from '@mui/material/Alert';
import Skeleton from '@mui/material/Skeleton';
import PillButton from '@/components/common/PillButton';
import { useProfileStore } from '@/stores/profileStore';

type ProfileDataGateProps = {
  /** Accessible name of the loading placeholder. */
  loadingLabel: string;
  skeletonHeight: number;
  children: ReactNode;
};

/**
 * Edit forms render only with fresh data: the sessionStorage cache has no contact
 * fields and may be stale, so editing it could overwrite real values.
 */
export default function ProfileDataGate({
  loadingLabel,
  skeletonHeight,
  children,
}: ProfileDataGateProps) {
  const status = useProfileStore((state) => state.status);
  const error = useProfileStore((state) => state.error);
  const fetchProfile = useProfileStore((state) => state.fetchProfile);

  if (status === 'ready') return children;

  if (status === 'error') {
    return (
      <Alert
        severity="error"
        role="alert"
        action={
          <PillButton tone="primarySoftOutline" size="small" onClick={() => fetchProfile()}>
            Tentar novamente
          </PillButton>
        }
      >
        {error ?? 'Não foi possível carregar seus dados.'} Para editar, precisamos dos dados
        atualizados.
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
