'use server';

import { backendFetch } from '@/lib/api/backend';
import { parseInput, runWithSession, type ActionResult } from '@/lib/server/action';
import { ownerUsername, showSavedProfile } from '@/lib/server/profileCache';
import { updateAboutInputSchema, updatePublicContactsInputSchema } from '@/schemas/actions.schema';
import type { BackendMissionary, MissionaryProfilePayload } from '@/types/backend';

/** Missionary profile mutations (ADR-0006). Inputs are untrusted: always validated here. */

/**
 * Runs a save of public profile data, then expires the public profile cache and
 * re-renders the page with the saved data.
 */
async function savePublicProfileData<T>(
  tag: string,
  fallbackMessage: string,
  save: (accessToken: string) => Promise<T>
): Promise<ActionResult<T>> {
  const result = await runWithSession(tag, fallbackMessage, async (accessToken) => ({
    value: await save(accessToken),
    username: await ownerUsername(accessToken),
  }));
  if (!result.ok) return result;

  showSavedProfile(result.data.username);
  return { ok: true, data: result.data.value };
}

export async function updatePublicContactsAction(input: {
  publicEmail?: string | null;
  publicPhone?: string | null;
  publicPhoneIsWhatsapp?: boolean;
  donationMessage?: string | null;
}): Promise<ActionResult<{ missionary: BackendMissionary }>> {
  const parsed = parseInput(updatePublicContactsInputSchema, input, 'Contatos públicos inválidos');
  if (!parsed.ok) return parsed;

  return savePublicProfileData(
    'actions/public-contacts',
    'Não foi possível salvar os contatos públicos',
    async (accessToken) => {
      const result = await backendFetch<{ data: { missionary: BackendMissionary } }>(
        '/missionaries/profile',
        { method: 'PATCH', body: parsed.data, accessToken }
      );
      return result.data;
    }
  );
}

export async function updateAboutAction(input: {
  aboutMe?: string | null;
  missionStorySummary?: string | null;
  originLocation?: string | null;
  prayerRequest?: string | null;
  lifeVerse?: string | null;
  faithCommunityId?: string | null;
  missionaryAgencyId?: string;
  workAddress?: { zip: string; district: string; city: string; state: string; country: string };
}): Promise<ActionResult<MissionaryProfilePayload>> {
  const parsed = parseInput(updateAboutInputSchema, input, 'Dados do Sobre inválidos');
  if (!parsed.ok) return parsed;

  return savePublicProfileData(
    'actions/about',
    'Não foi possível salvar o Sobre',
    async (accessToken) => {
      // One request saves the texts, the catalog links and the work address.
      const result = await backendFetch<{ data: MissionaryProfilePayload }>('/missionaries/about', {
        method: 'PATCH',
        body: parsed.data,
        accessToken,
      });
      return result.data;
    }
  );
}
