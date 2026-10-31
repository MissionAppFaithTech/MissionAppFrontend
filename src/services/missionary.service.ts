import { bffRequest } from '@/lib/api/client';
import type { BackendMissionary } from '@/types/backend';

/**
 * Converts the logged-in supporter into a missionary. The backend revokes all
 * sessions afterwards (the BFF clears the cookies), so the caller must log in again.
 */
export async function createMissionaryProfile(missionaryAgencyId: string): Promise<{ id: string }> {
  const { data } = await bffRequest<{ data: { missionary: Partial<BackendMissionary> } }>(
    '/api/missionaries/profile',
    {
      method: 'POST',
      body: { missionaryAgencyId },
      fallbackMessage: 'Não foi possível criar o perfil missionário',
    }
  );
  return { id: data.missionary.id ?? '' };
}

/** Links the missionary to a faith community (requires a missionary session). */
export async function linkFaithCommunity(faithCommunityId: string): Promise<void> {
  await bffRequest('/api/missionaries/about', {
    method: 'PATCH',
    body: { faithCommunityId },
    fallbackMessage: 'Não foi possível vincular a comunidade de fé',
  });
}
