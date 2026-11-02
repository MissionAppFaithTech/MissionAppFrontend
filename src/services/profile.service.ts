import { bffRequest } from '@/lib/api/client';
import type {
  AccountProfilePayload,
  BackendMissionary,
  BackendUser,
  BackendWorkAddress,
} from '@/types/backend';
import type { ProfileData, WorkAddressData } from '@/types/profile';

/**
 * Followers/projects/posts counters have no backend yet. They stay visible as
 * example data, flagged with `statsAreExample` so the UI labels them.
 */
export const EXAMPLE_PROFILE_STATS = {
  followersCount: 5,
  projectsCount: 25,
  postsCount: 3,
  campaignsCount: 4,
  supportersCount: '1.2k',
  followingCount: 12,
} as const;

export const emptyProfile: ProfileData = {
  userId: '',
  missionaryId: '',
  username: '',
  displayName: '',
  roleDescription: '',
  role: 'missionary',
  location: '',
  ...EXAMPLE_PROFILE_STATS,
  statsAreExample: true,
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

export async function getMyProfile(): Promise<AccountProfilePayload> {
  const { data } = await bffRequest<{ data: AccountProfilePayload }>('/api/account/profile', {
    fallbackMessage: 'Não foi possível carregar o seu perfil',
  });
  return data;
}

/** Header fields (RF 10.5). `biography: null` clears the mini-bio. */
export type UpdateHeaderPayload = {
  fullName?: string;
  username?: string;
  biography?: string | null;
};

export async function updateHeader(payload: UpdateHeaderPayload): Promise<Partial<BackendUser>> {
  const { data } = await bffRequest<{ data: { user: Partial<BackendUser> } }>(
    '/api/account/profile',
    { method: 'PATCH', body: payload, fallbackMessage: 'Não foi possível salvar o perfil' }
  );
  return data.user;
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
  const { data } = await bffRequest<{ data: { missionary: Partial<BackendMissionary> } }>(
    '/api/missionaries/profile',
    {
      method: 'PATCH',
      body: payload,
      fallbackMessage: 'Não foi possível salvar os contatos públicos',
    }
  );
  return data.missionary;
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
  const { data } = await bffRequest<{ data: { missionary: Partial<BackendMissionary> } }>(
    '/api/missionaries/about',
    { method: 'PATCH', body: payload, fallbackMessage: 'Não foi possível salvar o Sobre' }
  );
  return data.missionary;
}

export async function upsertWorkAddress(payload: WorkAddressData): Promise<WorkAddressData> {
  const { data } = await bffRequest<{ data: { workAddress: BackendWorkAddress } }>(
    '/api/missionaries/work-address',
    {
      method: 'PATCH',
      body: payload,
      fallbackMessage: 'Não foi possível salvar o local de atuação',
    }
  );
  return toWorkAddressData(data.workAddress) as WorkAddressData;
}

export type UpdateMissionaryIdentityPayload = {
  identityType: 'CPF' | 'PASSPORT';
  identityDocument: string;
};

export async function updateMissionaryIdentity(
  payload: UpdateMissionaryIdentityPayload
): Promise<void> {
  await bffRequest('/api/missionaries/identity', {
    method: 'PATCH',
    body: payload,
    fallbackMessage: 'Não foi possível salvar o documento de identidade',
  });
}

export type ChangeAccountPasswordPayload = {
  currentPassword: string;
  newPassword: string;
  newPasswordConfirmation: string;
};

/** The backend ends every session afterwards; the caller must send the user to login. */
export async function changeAccountPassword(payload: ChangeAccountPasswordPayload): Promise<void> {
  await bffRequest('/api/account/password', {
    method: 'PATCH',
    body: payload,
    fallbackMessage: 'Não foi possível alterar a senha',
  });
}
