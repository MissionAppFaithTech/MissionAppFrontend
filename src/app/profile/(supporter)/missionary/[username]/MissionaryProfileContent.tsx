import { notFound } from 'next/navigation';
import SupporterMissionaryProfileView from '@/components/profile/SupporterMissionaryProfileView';
import { getPublicProfile } from '@/lib/server/publicProfile';
import { mockProfile, mockSavedPosts } from '@/mocks/profile';

type MissionaryProfileBodyProps = {
  params: Promise<{ username: string }>;
};

/**
 * Missionary profile seen by a supporter, from the backend's public profile
 * (ADR-0004, cached per username). Tabs without an API yet keep example data,
 * labelled as such in the view.
 */
export async function MissionaryProfileContent({ username }: { username: string }) {
  const profile = await getPublicProfile(username);
  if (!profile) notFound();

  return (
    <SupporterMissionaryProfileView
      profile={{ ...profile, impactProject: mockProfile.impactProject }}
      posts={mockSavedPosts}
    />
  );
}

/** Reads the route params inside the page `<Suspense>` boundary (ADR-0005). */
export async function MissionaryProfileBody({ params }: MissionaryProfileBodyProps) {
  const { username } = await params;
  return <MissionaryProfileContent username={username} />;
}
