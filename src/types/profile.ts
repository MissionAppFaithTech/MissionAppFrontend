export type FollowedMissionary = {
  id: string;
  username: string;
  displayName: string;
  location: string;
  supportersCount: number | string;
  avatarUrl?: string;
};

export type SavedPost = {
  id: string;
  authorName: string;
  authorUsername: string;
  authorAvatarUrl?: string;
  createdAt: string;
  type: 'post' | 'prayer' | 'campaign';
  content: string;
  imageUrl?: string;
  likesCount?: number;
  prayersCount?: number;
  hasPrayed?: boolean;
};

export type ProfileAboutData = {
  introduction: string;
  missionHistory?: string;
  originLocation: string;
  currentLocation: string;
  missionaryAgency?: string;
  faithCommunity: string;
  prayerRequests?: string;
  lifeVerse: string;
};

export type ProfileData = {
  username: string;
  displayName: string;
  roleDescription: string;
  role?: 'missionary' | 'supporter';
  followersCount?: number;
  location?: string;
  projectsCount?: number;
  postsCount?: number;
  campaignsCount?: number;
  supportersCount?: number | string;
  followingCount?: number;
  supportedCampaignsCount?: number;
  about: ProfileAboutData;
};
