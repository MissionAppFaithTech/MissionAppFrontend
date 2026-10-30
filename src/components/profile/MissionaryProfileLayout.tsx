'use client';

import { useEffect, type ReactNode } from 'react';
import ProfileLayoutShell from '@/components/layout/ProfileLayoutShell';
import { useProfileStore } from '@/stores/profileStore';

export interface MissionaryProfileLayoutProps {
  children: ReactNode;
}

export default function MissionaryProfileLayout({ children }: MissionaryProfileLayoutProps) {
  const profile = useProfileStore((state) => state.profile);
  const fetchProfile = useProfileStore((state) => state.fetchProfile);

  useEffect(() => {
    fetchProfile().catch(() => {
      // In offline/test environments, keep the cached/fallback profile
    });
  }, [fetchProfile]);

  return (
    <ProfileLayoutShell profile={profile} role="missionary">
      {children}
    </ProfileLayoutShell>
  );
}
