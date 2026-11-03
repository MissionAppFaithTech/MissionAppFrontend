'use client';

import type { ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import PillButton from '@/components/common/PillButton';
import ProfileLayoutShell from '@/components/layout/ProfileLayoutShell';
import { OwnerProfileProvider } from '@/components/profile/OwnerProfileProvider';
import { emptyProfile } from '@/services/profile.service';
import type { ProfileData } from '@/types/profile';

export interface MissionaryProfileLayoutProps {
  /** Loaded on the server by the profile layout (ADR-0005); absent when it failed. */
  profile?: ProfileData;
  /** Why the profile could not be loaded. */
  error?: string;
  children: ReactNode;
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

export function ProfileLoading() {
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

/** Streams in while the server loads the profile. */
export function MissionaryProfileLoading() {
  return (
    <ProfileLayoutShell profile={emptyProfile} role="missionary">
      <ProfileLoading />
    </ProfileLayoutShell>
  );
}

export default function MissionaryProfileLayout({
  profile,
  error,
  children,
}: MissionaryProfileLayoutProps) {
  const router = useRouter();

  if (!profile) {
    return (
      <ProfileLayoutShell profile={emptyProfile} role="missionary">
        <Alert
          severity="error"
          role="alert"
          action={
            <PillButton tone="primarySoftOutline" size="small" onClick={() => router.refresh()}>
              Tentar novamente
            </PillButton>
          }
        >
          {error ?? 'Não foi possível carregar o seu perfil.'}
        </Alert>
      </ProfileLayoutShell>
    );
  }

  return (
    <OwnerProfileProvider profile={profile}>
      <ProfileLayoutShell profile={profile} role="missionary">
        {children}
      </ProfileLayoutShell>
    </OwnerProfileProvider>
  );
}
