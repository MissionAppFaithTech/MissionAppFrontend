export type ProfileAboutData = {
  introduction: string;
  missionHistory: string;
  originLocation: string;
  currentLocation: string;
  missionaryAgency: string;
  faithCommunity: string;
  prayerRequests: string;
  lifeVerse: string;
};

export type ProfileData = {
  username: string;
  displayName: string;
  roleDescription: string;
  followersCount: number;
  location?: string;
  projectsCount?: number;
  postsCount?: number;
  campaignsCount?: number;
  supportersCount?: number | string;
  followingCount?: number;
  about: ProfileAboutData;
};
