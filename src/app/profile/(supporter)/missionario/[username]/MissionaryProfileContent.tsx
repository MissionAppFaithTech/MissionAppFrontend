import { cacheLife } from 'next/cache';
import SupporterMissionaryProfileView from '@/components/profile/SupporterMissionaryProfileView';
import { mockProfile, mockFollowedMissionaries, mockSavedPosts } from '@/mocks/profile';
import type { ProfileData } from '@/types/profile';

type MissionaryProfileBodyProps = {
  params: Promise<{ username: string }>;
};

/** Missionary profile seen by a supporter; shared data, cached (ADR-0004). */
export async function MissionaryProfileContent({ username }: { username: string }) {
  'use cache';
  cacheLife('public');

  const isMockSamuel =
    username.toLowerCase() === mockProfile.username.toLowerCase() ||
    username.toLowerCase() === 'samuel-mendonca' ||
    username.toLowerCase() === 'samuel';

  const followed = mockFollowedMissionaries.find(
    (m) => m.username.toLowerCase() === username.toLowerCase()
  );

  const profile: ProfileData = isMockSamuel
    ? mockProfile
    : followed
      ? {
          ...mockProfile,
          username: followed.username,
          displayName: followed.displayName,
          location: followed.location,
          supportersCount: followed.supportersCount,
          about: {
            ...mockProfile.about,
            introduction: `Perfil missionário de ${followed.displayName} no Mission App. Atuando com dedicação no campo em ${followed.location}.`,
            currentLocation: followed.location,
          },
        }
      : {
          ...mockProfile,
          username,
          displayName: username.replace(/-/g, ' '),
          about: {
            ...mockProfile.about,
            introduction: `Perfil missionário de ${username.replace(/-/g, ' ')} no Mission App.`,
          },
        };

  return <SupporterMissionaryProfileView profile={profile} posts={mockSavedPosts} />;
}

/** Reads the route params inside the page `<Suspense>` boundary (ADR-0005). */
export async function MissionaryProfileBody({ params }: MissionaryProfileBodyProps) {
  const { username } = await params;
  return <MissionaryProfileContent username={username} />;
}
