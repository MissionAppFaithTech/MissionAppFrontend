import { createMissionaryProfileAction, updateAboutAction } from '@/app/actions/missionary';
import { callAction } from '@/lib/api/callAction';
import { ApiError } from '@/lib/api/client';

/**
 * Converts the logged-in supporter into a missionary. The backend revokes all
 * sessions afterwards (the action clears the cookies), so the caller must log in again.
 */
export async function createMissionaryProfile(missionaryAgencyId: string): Promise<{ id: string }> {
  const { missionary } = await callAction(() =>
    createMissionaryProfileAction({ missionaryAgencyId })
  );
  return { id: missionary.id ?? '' };
}

/**
 * Saves the sign-up data that only a missionary session can write: the faith
 * community link and the project description (shown as the "Sobre" biography).
 */
export async function completeMissionaryAbout(payload: {
  faithCommunityId?: string;
  aboutMe?: string;
}): Promise<void> {
  try {
    await callAction(() => updateAboutAction(payload));
  } catch (error) {
    // Keep the sign-up copy when the action has no specific message.
    if (error instanceof ApiError && error.status === 502) {
      throw new ApiError(
        'Não foi possível concluir os dados do seu perfil missionário',
        error.status,
        error.fieldErrors,
        error.code
      );
    }
    throw error;
  }
}
