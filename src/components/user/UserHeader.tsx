'use client';

import ProfileSummaryCard from '@/components/profile/ProfileSummaryCard';
import type { ProfileData } from '@/types/profile';

type UserHeaderProps = {
  username: string;
  displayName: string;
  bio?: string;
  roleDescription?: string;
  location?: string;
  projectsCount?: number;
  postsCount?: number;
  campaignsCount?: number;
  supportersCount?: number | string;
};

export default function UserHeader({
  username,
  displayName,
  bio,
  roleDescription = 'Missionário (a)(s)',
  location = 'África do Sul',
  projectsCount = 0,
  postsCount = 0,
  campaignsCount = 0,
  supportersCount = 0,
}: UserHeaderProps) {
  const profileData: ProfileData = {
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
