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
  /** Public photo URL; `null` without a photo or while the upload is processed. */
  profilePictureUrl?: string | null;
  /** `YYYY-MM-DD`; `null` for accounts created before it was collected. */
  birthDate?: string | null;
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
  publicPhoneIsWhatsapp?: boolean;
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

/**
 * Missionary part of `GET /account/profile`, also answered by
 * `PATCH /missionaries/about` and `POST /accounts/missionaries`.
 */
export type MissionaryProfilePayload = {
  missionary: BackendMissionary;
  workAddress: BackendWorkAddress | null;
  missionaryAgency: NamedRef | null;
  faithCommunity: NamedRef | null;
};

/** `POST /media-assets/uploads`: the asset and where the browser sends the file. */
/** Lifecycle of an uploaded file in the backend (`media_assets.status`). */
export type MediaAssetStatus = 'PENDING_UPLOAD' | 'PROCESSING' | 'READY' | 'FAILED';

/** `GET /media-assets/:id` — `url` is `null` until the asset is `READY`. */
export type MediaAssetState = {
  id: string;
  status: MediaAssetStatus;
  url: string | null;
};

export type MediaUploadTicket = {
  mediaAsset: { id: string; status?: string; url?: string | null };
  upload: {
    url: string;
    method: 'PUT';
    /** Signed headers: the `PUT` must send them exactly. */
    headers: Record<string, string>;
    expiresAt?: string;
  };
};

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

/**
 * `GET /api/v1/public/missionaries/:username` (backend ADR-0036): only the fields
 * product approved for anonymous visitors. No document, account e-mail/phone,
 * status, finances, zip or district.
 */
export type PublicMissionaryProfile = {
  username: string;
  fullName: string;
  biography: string | null;
  /** `null` without a photo or while the upload is processed. */
  profilePictureUrl?: string | null;
  role: BackendRole;
  missionaryAgency: NamedRef | null;
  faithCommunity: NamedRef | null;
  about: {
    aboutMe: string | null;
    missionStorySummary: string | null;
    originLocation: string | null;
    prayerRequest: string | null;
    lifeVerse: string | null;
  };
  workLocation: { city: string; state: string; country: string } | null;
  followersCount: number;
  followingCount: number;
  contact: {
    publicEmail: string | null;
    publicPhone: string | null;
    publicPhoneIsWhatsapp: boolean;
  };
};
