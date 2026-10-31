'use client';

import { useEffect, useRef, type ReactNode } from 'react';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import PillButton from '@/components/common/PillButton';
import ProfileLayoutShell from '@/components/layout/ProfileLayoutShell';
import { useRoleGuard } from '@/lib/auth/useRoleGuard';
import { rehydrateProfileStore, useProfileStore } from '@/stores/profileStore';

export interface MissionaryProfileLayoutProps {
  children: ReactNode;
}

function ProfileLoading() {
  return (
    <Stack spacing={2} role="status" aria-live="polite" aria-busy="true">
      <Box component="span" sx={visuallyHidden}>
        Carregando seu perfil…
      </Box>
      <Skeleton variant="rounded" height={160} />
      <Skeleton variant="rounded" height={280} />
    </Stack>
  );
}

// Pixel strings: in MUI `sx`, a bare 1 means 100%.
const visuallyHidden = {
  position: 'absolute',
  width: '1px',
  height: '1px',
  overflow: 'hidden',
  clip: 'rect(0 0 0 0)',
  whiteSpace: 'nowrap',
} as const;

export default function MissionaryProfileLayout({ children }: MissionaryProfileLayoutProps) {
  const profile = useProfileStore((state) => state.profile);
  const status = useProfileStore((state) => state.status);
  const error = useProfileStore((state) => state.error);
  const hasHydrated = useProfileStore((state) => state.hasHydrated);
  const fetchProfile = useProfileStore((state) => state.fetchProfile);
  // RBAC: visitors go to login and other roles to their own home (lib/auth/rbac.ts).
  const access = useRoleGuard();

  // The cached profile renders at once; the fresh fetch waits for it so it is never overwritten.
  const rehydrated = useRef<Promise<void> | null>(null);
  useEffect(() => {
    rehydrated.current = rehydrateProfileStore();
  }, []);

  useEffect(() => {
    if (access !== 'allowed') return;
    void (rehydrated.current ?? Promise.resolve()).then(() => fetchProfile());
  }, [access, fetchProfile]);

  // A cached profile (sessionStorage) renders immediately while fresh data loads.
  const hasProfile = Boolean(profile.username);
  let content = children;
  if (!hasHydrated || (!hasProfile && status !== 'error')) {
    content = <ProfileLoading />;
  } else if (status === 'error' && !hasProfile) {
    content = (
      <Alert
        severity="error"
        role="alert"
        action={
          <PillButton tone="primarySoftOutline" size="small" onClick={() => fetchProfile()}>
            Tentar novamente
          </PillButton>
        }
      >
        {error ?? 'Não foi possível carregar o seu perfil.'}
      </Alert>
    );
  } else if (status === 'error') {
    content = (
      <Stack spacing={2}>
        <Alert severity="warning" role="status">
          Não foi possível atualizar seu perfil agora. Você está vendo os últimos dados salvos.
        </Alert>
        {children}
      </Stack>
    );
  }

  return (
    <ProfileLayoutShell profile={profile} role="missionary">
      {content}
    </ProfileLayoutShell>
  );
}
