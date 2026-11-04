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

export type WorkAddressData = {
  zip: string;
  district: string;
  city: string;
  state: string;
  country: string;
};

export type ProfileAboutData = {
  introduction: string;
  missionHistory?: string;
  originLocation: string;
  currentLocation: string;
  missionaryAgency?: string;
  /** Catalog id behind `missionaryAgency` (owner profile only). */
  missionaryAgencyId?: string;
  faithCommunity: string;
  /** Catalog id behind `faithCommunity` (owner profile only). */
  faithCommunityId?: string;
  prayerRequests?: string;
  lifeVerse: string;
  /** Structured work address behind `currentLocation` (missionary only). */
  workAddress?: WorkAddressData | null;
};

export type ImpactProjectData = {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  bannerUrl?: string;
  galleryImages?: string[];
  images?: string[];
  videoUrl?: string;
  youtubeUrl?: string;
  campaignTitle?: string;
  campaignBadge?: boolean;
};

export type ProfileContactData = {
  publicEmail: string;
  publicPhone: string;
  /** Private login e-mail/phone: only offered as a shortcut, never published automatically. */
  accountEmail?: string;
  accountPhone?: string;
  showPublicEmail?: boolean;
  showPublicPhone?: boolean;
  allowWhatsappContact?: boolean;
  whatsappNumber?: string;
};

export type ProfileData = {
  /** Backend user id of the profile owner. */
  userId?: string;
  missionaryId?: string;
  username: string;
  displayName: string;
  roleDescription: string;
  role?: 'missionary' | 'supporter';
  /** Public profile photo, when one has been stored. */
  avatarUrl?: string;
  followersCount?: number;
  location?: string;
  projectsCount?: number;
  postsCount?: number;
  campaignsCount?: number;
  supportersCount?: number | string;
  followingCount?: number;
  supportedCampaignsCount?: number;
  /** True only when the counters on screen are placeholder data. */
  statsAreExample?: boolean;
  about: ProfileAboutData;
  contact?: ProfileContactData;
  impactProject?: ImpactProjectData;
  financial?: FinancialConfigData;
};

export type PixKeyType = 'cpf' | 'cnpj' | 'email' | 'phone' | 'random';
export type BankAccountType = 'corrente' | 'poupanca' | 'pagamento';

export type PixConfigData = {
  enabled: boolean;
  key: string;
  keyType: PixKeyType;
};

export type BankTransferConfigData = {
  enabled: boolean;
  bankName: string;
  bankNumber: string;
  agency: string;
  account: string;
  accountType: BankAccountType;
  holderName: string;
  holderDocument: string;
};

export type FinancialConfigData = {
  supporterMessage: string;
  pix: PixConfigData;
  bankTransfer: BankTransferConfigData;
};
