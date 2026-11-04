import { changePasswordAction, updateAccountProfileAction } from '@/app/actions/account';
import { updateAboutAction, updatePublicContactsAction } from '@/app/actions/missionary';
import { callAction } from '@/lib/api/callAction';
import type {
  AccountProfilePayload,
  BackendMissionary,
  BackendUser,
  BackendWorkAddress,
  MissionaryProfilePayload,
  PublicMissionaryProfile,
} from '@/types/backend';
import type { ProfileData, WorkAddressData } from '@/types/profile';

/**
 * Project, post and follower counters have no API yet. A new account shows
 * zero until those endpoints exist — never placeholder numbers.
 */
export const EMPTY_PROFILE_STATS = {
  followersCount: 0,
  projectsCount: 0,
  postsCount: 0,
  campaignsCount: 0,
  supportersCount: 0,
  followingCount: 0,
} as const;

export const emptyProfile: ProfileData = {
  userId: '',
  missionaryId: '',
  username: '',
  displayName: '',
  roleDescription: '',
  role: 'missionary',
  location: '',
  ...EMPTY_PROFILE_STATS,
  statsAreExample: false,
  about: {
    introduction: '',
    missionHistory: '',
    originLocation: '',
    currentLocation: '',
    missionaryAgency: '',
    faithCommunity: '',
    prayerRequests: '',
    lifeVerse: '',
    workAddress: null,
  },
  contact: {
    publicEmail: '',
    publicPhone: '',
  },
};

/** "Cidade - Estado - País", skipping blanks (RF 10.7.1 "Local de atuação atual"). */
export function formatWorkAddress(address: WorkAddressData | null | undefined): string {
  if (!address) return '';
  return [address.city, address.state, address.country]
    .map((part) => part?.trim())
    .filter(Boolean)
    .join(' - ');
}

function toWorkAddressData(address: BackendWorkAddress | null): WorkAddressData | null {
  if (!address) return null;
  const { zip, district, city, state, country } = address;
  return { zip, district, city, state, country };
}

/**
 * Maps `GET /api/account/profile` to the UI model. Public contacts come only
 * from the missionary record — never from the private login e-mail/phone.
 */
export function mapAccountProfile(payload: AccountProfilePayload): ProfileData {
  const { user, missionary, workAddress, missionaryAgency, faithCommunity } = payload;
  const address = toWorkAddressData(workAddress);
  const currentLocation = formatWorkAddress(address);

  return {
    ...emptyProfile,
    userId: user.id,
    missionaryId: missionary?.id ?? '',
    username: user.username,
    displayName: user.fullName,
    roleDescription: user.biography ?? '',
    role: user.role === 'SUPPORTER' ? 'supporter' : 'missionary',
    avatarUrl: user.profilePictureUrl ?? undefined,
    location: currentLocation,
    about: {
      introduction: missionary?.aboutMe ?? '',
      missionHistory: missionary?.missionStorySummary ?? '',
      originLocation: missionary?.originLocation ?? '',
      currentLocation,
      missionaryAgency: missionaryAgency?.name ?? '',
      missionaryAgencyId: missionaryAgency?.id ?? missionary?.missionaryAgencyId ?? '',
      faithCommunity: faithCommunity?.name ?? '',
      faithCommunityId: faithCommunity?.id ?? missionary?.faithCommunityId ?? '',
      prayerRequests: missionary?.prayerRequest ?? '',
      lifeVerse: missionary?.lifeVerse ?? '',
      workAddress: address,
    },
    contact: {
      publicEmail: missionary?.publicEmail ?? '',
      publicPhone: missionary?.publicPhone ?? '',
      allowWhatsappContact: missionary?.publicPhoneIsWhatsapp === true,
      accountEmail: user.email,
      accountPhone: user.phoneNumber,
    },
  };
}

/**
 * Maps the anonymous public profile (backend ADR-0036) to the UI model. Only
 * public fields exist in it, so nothing private can leak into the page.
 */
export function mapPublicProfile(missionary: PublicMissionaryProfile): ProfileData {
  const currentLocation = formatWorkAddress(
    missionary.workLocation ? { ...missionary.workLocation, zip: '', district: '' } : null
  );
  const { about, contact } = missionary;

  return {
    ...emptyProfile,
    userId: undefined,
    missionaryId: undefined,
    username: missionary.username,
    displayName: missionary.fullName,
    roleDescription: missionary.biography ?? '',
    role: 'missionary',
    avatarUrl: missionary.profilePictureUrl ?? undefined,
    location: currentLocation,
    followersCount: missionary.followersCount,
    followingCount: missionary.followingCount,
    about: {
      introduction: about.aboutMe ?? '',
      missionHistory: about.missionStorySummary ?? '',
      originLocation: about.originLocation ?? '',
      currentLocation,
      missionaryAgency: missionary.missionaryAgency?.name ?? '',
      faithCommunity: missionary.faithCommunity?.name ?? '',
      prayerRequests: about.prayerRequest ?? '',
      lifeVerse: about.lifeVerse ?? '',
      workAddress: null,
    },
    contact: {
      publicEmail: contact.publicEmail ?? '',
      publicPhone: contact.publicPhone ?? '',
      allowWhatsappContact: contact.publicPhoneIsWhatsapp === true,
    },
  };
}

/** Header fields (RF 10.5). `biography: null` clears the mini-bio. */
export type UpdateHeaderPayload = {
  fullName?: string;
  username?: string;
  biography?: string | null;
  /** Confirmed profile picture upload; `null` removes the photo. */
  profilePictureId?: string | null;
};

export async function updateHeader(payload: UpdateHeaderPayload): Promise<Partial<BackendUser>> {
  const { user } = await callAction(() => updateAccountProfileAction(payload));
  return user;
}

/** `null` removes a public contact. */
export type UpdatePublicContactsPayload = {
  publicEmail?: string | null;
  publicPhone?: string | null;
  /** Whether visitors may contact the public phone through WhatsApp. */
  publicPhoneIsWhatsapp?: boolean;
};

export async function updatePublicContacts(
  payload: UpdatePublicContactsPayload
): Promise<Partial<BackendMissionary>> {
  const { missionary } = await callAction(() => updatePublicContactsAction(payload));
  return missionary;
}

/** "Sobre" fields (RF 10.7.2). `null` clears a field. */
export type UpdateAboutPayload = {
  aboutMe?: string | null;
  missionStorySummary?: string | null;
  originLocation?: string | null;
  prayerRequest?: string | null;
  lifeVerse?: string | null;
  /** `null` unlinks the faith community. */
  faithCommunityId?: string | null;
  /** The agency can be replaced, never removed. */
  missionaryAgencyId?: string;
  /** Replaces the whole work address. */
  workAddress?: WorkAddressData;
};

/** Saves the "Sobre", catalog links and work address in one `PATCH /missionaries/about`. */
export async function updateAbout(payload: UpdateAboutPayload): Promise<MissionaryProfilePayload> {
  return callAction(() => updateAboutAction(payload));
}

export type ChangeAccountPasswordPayload = {
  currentPassword: string;
  newPassword: string;
  newPasswordConfirmation: string;
};

/** The backend ends every session afterwards; the caller must send the user to login. */
export async function changeAccountPassword(payload: ChangeAccountPasswordPayload): Promise<void> {
  await callAction(() => changePasswordAction(payload));
}
