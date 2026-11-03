'use server';

import { cookies } from 'next/headers';
import { backendFetch } from '@/lib/api/backend';
import { expireAuthCookies } from '@/lib/auth/cookies';
import { parseInput, runWithSession, type ActionResult } from '@/lib/server/action';
import { ownerUsername, showSavedProfile } from '@/lib/server/profileCache';
import {
  createMissionaryProfileInputSchema,
  updateAboutInputSchema,
  updateIdentityInputSchema,
  updatePublicContactsInputSchema,
  updateWorkAddressInputSchema,
} from '@/schemas/actions.schema';
import type { BackendMissionary, BackendWorkAddress } from '@/types/backend';

/** Missionary profile mutations (ADR-0006). Inputs are untrusted: always validated here. */

/**
 * Converts the logged-in supporter into a missionary. The backend revokes every
 * session afterwards, so the auth cookies are cleared and the user must log in again.
 */
export async function createMissionaryProfileAction(input: {
  missionaryAgencyId: string;
}): Promise<ActionResult<{ missionary: BackendMissionary; reauthenticationRequired: true }>> {
  const parsed = parseInput(
    createMissionaryProfileInputSchema,
    input,
    'Selecione uma agência missionária válida'
  );
  if (!parsed.ok) return parsed;

  const store = await cookies();
  return runWithSession(
    'actions/create-missionary-profile',
    'Não foi possível criar o perfil missionário',
    async (accessToken) => {
      const result = await backendFetch<{ data: { missionary: BackendMissionary } }>(
        '/missionaries/profile',
        { method: 'POST', body: parsed.data, accessToken }
      );
      expireAuthCookies(store);
      return { missionary: result.data.missionary, reauthenticationRequired: true as const };
    }
  );
}

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
  faithCommunityId?: string;
}): Promise<ActionResult<{ missionary: BackendMissionary }>> {
  const parsed = parseInput(updateAboutInputSchema, input, 'Dados do Sobre inválidos');
  if (!parsed.ok) return parsed;

  return savePublicProfileData(
    'actions/about',
    'Não foi possível salvar o Sobre',
    async (accessToken) => {
      const result = await backendFetch<{ data: { missionary: BackendMissionary } }>(
        '/missionaries/about',
        { method: 'PATCH', body: parsed.data, accessToken }
      );
      return result.data;
    }
  );
}

export async function updateWorkAddressAction(input: {
  zip: string;
  district: string;
  city: string;
  state: string;
  country: string;
}): Promise<ActionResult<{ workAddress: BackendWorkAddress }>> {
  const parsed = parseInput(updateWorkAddressInputSchema, input, 'Local de atuação inválido');
  if (!parsed.ok) return parsed;

  return savePublicProfileData(
    'actions/work-address',
    'Não foi possível salvar o local de atuação',
    async (accessToken) => {
      const result = await backendFetch<{ data: { workAddress: BackendWorkAddress } }>(
        '/missionaries/work-address',
        { method: 'PATCH', body: parsed.data, accessToken }
      );
      return result.data;
    }
  );
}

/** The identity document is private: no public cache to expire. */
export async function updateIdentityAction(input: {
  identityType: 'CPF' | 'PASSPORT';
  identityDocument: string;
}): Promise<ActionResult<{ missionary: BackendMissionary }>> {
  const parsed = parseInput(updateIdentityInputSchema, input, 'Documento de identidade inválido');
  if (!parsed.ok) return parsed;

  return runWithSession(
    'actions/identity',
    'Não foi possível salvar o documento de identidade',
    async (accessToken) => {
      const result = await backendFetch<{ data: { missionary: BackendMissionary } }>(
        '/missionaries/identity',
        { method: 'PATCH', body: parsed.data, accessToken }
      );
      return result.data;
    }
  );
}
