/** Shapes serialized by the MissionApp backend (`/api/v1`), camelCase. */

export type BackendRole = 'ADMIN' | 'MISSIONARY' | 'SUPPORTER';

export type BackendUser = {
  id: string;
  fullName: string;
  username: string;
  email: string;
  phoneNumber: string;
  biography: string | null;
  profilePictureId: string | null;
  role: BackendRole;
  createdAt?: string;
  updatedAt?: string;
};

export type BackendMissionary = {
  id: string;
  status?: 'PENDING_APPROVAL' | 'APPROVED';
  identityType?: 'CPF' | 'PASSPORT' | null;
  identityDocument?: string | null;
  publicEmail?: string | null;
  publicPhone?: string | null;
  donationMessage?: string | null;
  aboutMe?: string | null;
  missionStorySummary?: string | null;
  originLocation?: string | null;
  faithCommunityId?: string | null;
  prayerRequest?: string | null;
  lifeVerse?: string | null;
  missionaryAgencyId?: string;
  userId?: string;
  createdAt?: string;
};

export type BackendWorkAddress = {
  id?: string;
  missionaryId?: string;
  zip: string;
  district: string;
  city: string;
  state: string;
  country: string;
};

export type NamedRef = { id: string; name: string };

/** `GET /api/account/profile` (BFF) — backend payload plus resolved names. */
export type AccountProfilePayload = {
  user: BackendUser;
  missionary: BackendMissionary | null;
  workAddress: BackendWorkAddress | null;
  missionaryAgency: NamedRef | null;
  faithCommunity: NamedRef | null;
};

/** `GET /api/auth/session` (BFF). */
export type SessionInfo = {
  authenticated: true;
  userId: string | null;
  role: BackendRole | null;
};
