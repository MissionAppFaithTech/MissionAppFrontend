import { localizeApiErrorMessage } from '@/lib/api/errors';

export type UpdateMissionaryAboutPayload = {
  aboutMe?: string;
  missionStorySummary?: string;
  originLocation?: string;
  faithCommunityId?: string;
  prayerRequest?: string;
  lifeVerse?: string;
};

export type MissionaryAboutResult = {
  id: string;
};

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function optionalText(value?: string) {
  const trimmed = value?.trim() ?? '';
  return trimmed ? trimmed : undefined;
}

export function isMissionaryUuid(value: string) {
  return UUID_PATTERN.test(value.trim());
}

export function toUpdateMissionaryAboutPayload(input: {
  introduction?: string;
  missionHistory?: string;
  originLocation?: string;
  faithCommunity?: string;
  prayerRequests?: string;
  lifeVerse?: string;
}): UpdateMissionaryAboutPayload {
  const faithCommunityId = optionalText(input.faithCommunity);

  return {
    aboutMe: optionalText(input.introduction),
    missionStorySummary: optionalText(input.missionHistory),
    originLocation: optionalText(input.originLocation),
    faithCommunityId:
      faithCommunityId && isMissionaryUuid(faithCommunityId) ? faithCommunityId : undefined,
    prayerRequest: optionalText(input.prayerRequests),
    lifeVerse: optionalText(input.lifeVerse),
  };
}

export async function createMissionaryProfile(missionaryAgencyId: string): Promise<{ id: string }> {
  const response = await fetch('/api/missionaries/profile', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ missionaryAgencyId }),
    cache: 'no-store',
  });

  const body = await response.json().catch(() => null);

  if (!response.ok) {
    const message =
      typeof body?.message === 'string'
        ? body.message
        : 'Não foi possível criar o perfil missionário';
    throw new Error(localizeApiErrorMessage(message));
  }

  const missionary = body?.data?.missionary ?? body?.missionary ?? body?.data;
  return { id: typeof missionary?.id === 'string' ? missionary.id : '' };
}

export async function updateMissionaryAbout(
  missionaryId: string | undefined,
  payload: UpdateMissionaryAboutPayload
): Promise<MissionaryAboutResult> {
  const url = missionaryId
    ? `/api/missionaries/${encodeURIComponent(missionaryId)}/about`
    : '/api/missionaries/about';
  const response = await fetch(url, {
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
        : 'Não foi possível salvar as informações do sobre';
    throw new Error(localizeApiErrorMessage(message));
  }

  const missionary = body?.data?.missionary ?? body?.missionary ?? body?.data;
  const id = typeof missionary?.id === 'string' ? missionary.id : (missionaryId ?? '');

  return { id };
}
