import type { ProfileData } from '@/types/profile';

export type BackendProfileData = {
  user?: {
    id?: string;
    fullName?: string;
    username?: string;
    email?: string;
    phoneNumber?: string;
    biography?: string;
    profilePictureId?: string;
    role?: string;
  };
  missionary?: {
    id?: string;
    status?: string;
    identityType?: string;
    identityDocument?: string;
    publicEmail?: string;
    publicPhone?: string;
    donationMessage?: string;
    aboutMe?: string;
    missionStorySummary?: string;
    originLocation?: string;
    faithCommunityId?: string;
    prayerRequest?: string;
    lifeVerse?: string;
    missionaryAgencyId?: string;
    userId?: string;
  } | null;
  workAddress?: {
    id?: string;
    zip?: string;
    district?: string;
    city?: string;
    state?: string;
    country?: string;
  } | null;
};

export type UpdateAccountProfilePayload = {
  fullName?: string;
  username?: string;
  biography?: string;
};

export type UpdateMissionaryAboutServicePayload = {
  aboutMe?: string;
  missionStorySummary?: string;
  originLocation?: string;
  faithCommunityId?: string;
  prayerRequest?: string;
  lifeVerse?: string;
};

export type UpdateMissionaryProfileServicePayload = {
  publicEmail?: string;
  publicPhone?: string;
  donationMessage?: string;
};

export const emptyProfile: ProfileData = {
  missionaryId: '',
  username: '',
  displayName: '',
  roleDescription: '',
  role: 'missionary',
  followersCount: 5,
  location: '',
  projectsCount: 25,
  postsCount: 3,
  campaignsCount: 4,
  supportersCount: '1.2k',
  followingCount: 12,
  about: {
    introduction: '',
    missionHistory: '',
    originLocation: '',
    currentLocation: '',
    missionaryAgency: '',
    faithCommunity: '',
    prayerRequests: '',
    lifeVerse: '',
  },
  contact: {
    publicEmail: '',
    publicPhone: '',
    showPublicEmail: true,
    showPublicPhone: true,
    allowWhatsappContact: true,
    whatsappNumber: '',
  },
  financial: {
    supporterMessage: '',
    pix: {
      enabled: false,
      key: '',
      keyType: 'email',
    },
    bankTransfer: {
      enabled: false,
      bankName: '',
      bankNumber: '',
      agency: '',
      account: '',
      accountType: 'corrente',
      holderName: '',
      holderDocument: '',
    },
  },
};

export function mapBackendToProfileData(
  backend: BackendProfileData,
  fallback: ProfileData = emptyProfile
): ProfileData {
  const user = backend.user;
  const missionary = backend.missionary;
  const workAddress = backend.workAddress;

  const locationString =
    workAddress?.city && workAddress?.state
      ? `${workAddress.city}/${workAddress.state}`
      : workAddress?.city || '';

  return {
    ...fallback,
    missionaryId: missionary?.id || user?.id || fallback.missionaryId || '',
    username: user?.username ?? fallback.username ?? '',
    displayName: user?.fullName ?? fallback.displayName ?? '',
    roleDescription: user?.biography ?? '',
    location: locationString,
    about: {
      introduction: missionary?.aboutMe || '',
      missionHistory: missionary?.missionStorySummary || '',
      originLocation: missionary?.originLocation || '',
      currentLocation: locationString,
      faithCommunity: missionary?.faithCommunityId || '',
      prayerRequests: missionary?.prayerRequest || '',
      lifeVerse: missionary?.lifeVerse || '',
      missionaryAgency: missionary?.missionaryAgencyId || '',
    },
    contact: {
      publicEmail: missionary?.publicEmail || user?.email || '',
      publicPhone: missionary?.publicPhone || user?.phoneNumber || '',
      showPublicEmail: true,
      showPublicPhone: true,
      allowWhatsappContact: true,
      whatsappNumber: missionary?.publicPhone || user?.phoneNumber || '',
    },
    financial: fallback.financial
      ? {
          ...fallback.financial,
          supporterMessage: missionary?.donationMessage || fallback.financial.supporterMessage,
        }
      : undefined,
    // Mocking only the STATISTICS DATA as required:
    projectsCount: fallback.projectsCount ?? 25,
    postsCount: fallback.postsCount ?? 3,
    campaignsCount: fallback.campaignsCount ?? 4,
    supportersCount: fallback.supportersCount ?? '1.2k',
    followingCount: fallback.followingCount ?? 12,
    followersCount: fallback.followersCount ?? 5,
  };
}

function getBffUrl(path: string): string {
  if (typeof window !== 'undefined' && window.location?.origin) {
    return `${window.location.origin}${path.startsWith('/') ? path : `/${path}`}`;
  }
  return path;
}

export async function fetchAccountProfile(): Promise<BackendProfileData> {
  const response = await fetch(getBffUrl('/api/account/profile'), {
    method: 'GET',
    headers: { Accept: 'application/json' },
    cache: 'no-store',
  });

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    const message =
      typeof payload?.message === 'string'
        ? payload.message
        : 'Não foi possível carregar o perfil da conta';
    throw new Error(message);
  }

  return (payload?.data ?? payload) as BackendProfileData;
}

export async function updateAccountProfile(data: UpdateAccountProfilePayload): Promise<void> {
  const response = await fetch(getBffUrl('/api/account/profile'), {
    method: 'PATCH',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
    cache: 'no-store',
  });

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    const message =
      typeof payload?.message === 'string'
        ? payload.message
        : 'Não foi possível atualizar as informações da conta';
    throw new Error(message);
  }
}

export async function updateMissionaryAboutData(
  data: UpdateMissionaryAboutServicePayload
): Promise<void> {
  const sanitized: Record<string, string> = {};
  if (data.aboutMe?.trim()) sanitized.aboutMe = data.aboutMe.trim();
  if (data.missionStorySummary?.trim())
    sanitized.missionStorySummary = data.missionStorySummary.trim();
  if (data.originLocation?.trim()) sanitized.originLocation = data.originLocation.trim();
  if (data.faithCommunityId?.trim()) sanitized.faithCommunityId = data.faithCommunityId.trim();
  if (data.prayerRequest?.trim()) sanitized.prayerRequest = data.prayerRequest.trim();
  if (data.lifeVerse?.trim()) sanitized.lifeVerse = data.lifeVerse.trim();

  const response = await fetch(getBffUrl('/api/missionaries/about'), {
    method: 'PATCH',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(sanitized),
    cache: 'no-store',
  });

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    const message =
      typeof payload?.message === 'string'
        ? payload.message
        : 'Não foi possível salvar as informações do sobre';
    throw new Error(message);
  }
}

export async function updateMissionaryProfileData(
  data: UpdateMissionaryProfileServicePayload
): Promise<void> {
  const response = await fetch(getBffUrl('/api/missionaries/profile'), {
    method: 'PATCH',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
    cache: 'no-store',
  });

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    const message =
      typeof payload?.message === 'string'
        ? payload.message
        : 'Não foi possível salvar as informações de contato do missionário';
    throw new Error(message);
  }
}

export type UpdateMissionaryWorkAddressPayload = {
  zip: string;
  district: string;
  city: string;
  state: string;
  country: string;
};

export async function updateMissionaryWorkAddress(
  payload: UpdateMissionaryWorkAddressPayload
): Promise<void> {
  const response = await fetch(getBffUrl('/api/missionaries/work-address'), {
    method: 'PATCH',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
    cache: 'no-store',
  });

  const body = await response.json().catch(() => null);

  if (!response.ok) {
    const message =
      typeof body?.message === 'string'
        ? body.message
        : 'Não foi possível atualizar o endereço de atuação';
    throw new Error(message);
  }
}

export type UpdateMissionaryIdentityPayload = {
  identityType: 'CPF' | 'PASSPORT';
  identityDocument: string;
};

export async function updateMissionaryIdentity(
  payload: UpdateMissionaryIdentityPayload
): Promise<void> {
  const response = await fetch(getBffUrl('/api/missionaries/identity'), {
    method: 'PATCH',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
    cache: 'no-store',
  });

  const body = await response.json().catch(() => null);

  if (!response.ok) {
    const message =
      typeof body?.message === 'string'
        ? body.message
        : 'Não foi possível atualizar os dados de identidade';
    throw new Error(message);
  }
}

export type ChangeAccountPasswordPayload = {
  currentPassword: string;
  newPassword: string;
  newPasswordConfirmation: string;
};

export async function changeAccountPassword(payload: ChangeAccountPasswordPayload): Promise<void> {
  const response = await fetch(getBffUrl('/api/account/password'), {
    method: 'PATCH',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
    cache: 'no-store',
  });

  const body = await response.json().catch(() => null);

  if (!response.ok) {
    const message =
      typeof body?.message === 'string' ? body.message : 'Não foi possível alterar a senha';
    throw new Error(message);
  }
}
