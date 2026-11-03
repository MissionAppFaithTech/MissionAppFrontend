'use client';

import { createContext, useContext, type ReactNode } from 'react';
import { emptyProfile } from '@/services/profile.service';
import type { ProfileData } from '@/types/profile';

const OwnerProfileContext = createContext<ProfileData>(emptyProfile);

/**
 * The logged-in missionary's profile, loaded on the server by the profile layout
 * (ADR-0005). Saving refreshes the route, which sends a new value here.
 */
export function OwnerProfileProvider({
  profile,
  children,
}: {
  profile: ProfileData;
  children: ReactNode;
}) {
  return <OwnerProfileContext value={profile}>{children}</OwnerProfileContext>;
}

export function useOwnerProfile(): ProfileData {
  return useContext(OwnerProfileContext);
}
