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
  about: ProfileAboutData;
};
