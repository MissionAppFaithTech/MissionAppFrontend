import { changePasswordAction, updateAccountProfileAction } from '@/app/actions/account';
import {
  updateAboutAction,
  updateIdentityAction,
  updatePublicContactsAction,
  updateWorkAddressAction,
} from '@/app/actions/missionary';
import { callAction } from '@/lib/api/callAction';
import type {
  AccountProfilePayload,
  BackendMissionary,
  BackendUser,
  BackendWorkAddress,
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
    location: currentLocation,
    about: {
      introduction: missionary?.aboutMe ?? '',
      missionHistory: missionary?.missionStorySummary ?? '',
      originLocation: missionary?.originLocation ?? '',
      currentLocation,
      missionaryAgency: missionaryAgency?.name ?? '',
      faithCommunity: faithCommunity?.name ?? '',
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

/** Header fields (RF 10.5). `biography: null` clears the mini-bio. */
export type UpdateHeaderPayload = {
  fullName?: string;
  username?: string;
  biography?: string | null;
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
};

export async function updateAbout(
  payload: UpdateAboutPayload
): Promise<Partial<BackendMissionary>> {
  const { missionary } = await callAction(() => updateAboutAction(payload));
  return missionary;
}

export async function upsertWorkAddress(payload: WorkAddressData): Promise<WorkAddressData> {
  const { workAddress } = await callAction(() => updateWorkAddressAction(payload));
  return toWorkAddressData(workAddress) as WorkAddressData;
}

export type UpdateMissionaryIdentityPayload = {
  identityType: 'CPF' | 'PASSPORT';
  identityDocument: string;
};

export async function updateMissionaryIdentity(
  payload: UpdateMissionaryIdentityPayload
): Promise<void> {
  await callAction(() => updateIdentityAction(payload));
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
