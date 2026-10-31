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

/**
 * Saves the sign-up data that only a missionary session can write: the faith
 * community link and the project description (shown as the "Sobre" biography).
 */
export async function completeMissionaryAbout(payload: {
  faithCommunityId?: string;
  aboutMe?: string;
}): Promise<void> {
  await bffRequest('/api/missionaries/about', {
    method: 'PATCH',
    body: payload,
    fallbackMessage: 'Não foi possível concluir os dados do seu perfil missionário',
  });
}
