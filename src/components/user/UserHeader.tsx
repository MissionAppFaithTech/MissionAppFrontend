'use client';

import ProfileSummaryCard from '@/components/profile/ProfileSummaryCard';
import type { ProfileData } from '@/types/profile';

type UserHeaderProps = {
  username?: string;
  displayName?: string;
  bio?: string;
  roleDescription?: string;
  location?: string;
  projectsCount?: number;
  postsCount?: number;
  campaignsCount?: number;
  supportersCount?: number | string;
  profile?: ProfileData;
};

export default function UserHeader({
  username = '_SamiMendonca',
  displayName = 'Samuel Mendonça',
  bio,
  roleDescription = 'Missionário (a)(s)',
  location = 'Cidade do Cabo, África do Sul',
  projectsCount = 25,
  postsCount = 3,
  campaignsCount = 4,
  supportersCount = '1.2k',
  profile,
}: UserHeaderProps) {
  const profileData: ProfileData = profile || {
    username,
    displayName,
    roleDescription,
    location,
    followersCount: 0,
    projectsCount,
    postsCount,
    campaignsCount,
    supportersCount,
    about: {
      introduction: bio || '',
      missionHistory: '',
      originLocation: '',
      currentLocation: location,
      missionaryAgency: '',
      faithCommunity: '',
      prayerRequests: '',
      lifeVerse: '',
    },
  };

  return <ProfileSummaryCard profile={profileData} isOwnProfile={false} />;
}
