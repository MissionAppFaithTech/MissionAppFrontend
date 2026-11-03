import { Suspense, type ReactNode } from 'react';
import { redirect } from 'next/navigation';
import MissionaryProfileLayout, {
  MissionaryProfileLoading,
} from '@/components/profile/MissionaryProfileLayout';
import { loadMyProfile } from '@/lib/server/profile';

/**
 * The owner's profile is read on the server for every page of the area
 * (ADR-0005). Saving calls `router.refresh()`, which renders this again with the
 * new data. The proxy already keeps visitors and other roles out.
 */
export default function ProfileLayout({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={<MissionaryProfileLoading />}>
      <OwnerProfile>{children}</OwnerProfile>
    </Suspense>
  );
}

async function OwnerProfile({ children }: { children: ReactNode }) {
  const result = await loadMyProfile();
  if (result.kind === 'expired') redirect('/login?reason=expired&next=/profile');

  return (
    <MissionaryProfileLayout
      profile={result.kind === 'ok' ? result.profile : undefined}
      error={result.kind === 'error' ? result.message : undefined}
    >
      {children}
    </MissionaryProfileLayout>
  );
}
