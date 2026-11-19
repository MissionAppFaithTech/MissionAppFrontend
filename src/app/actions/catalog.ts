'use server';

import { updateTag } from 'next/cache';
import { backendFetch } from '@/lib/api/backend';
import { createdItemFrom } from '@/lib/api/catalog';
import { catalogTag } from '@/lib/cache/tags';
import type { CatalogKind } from '@/lib/query/keys';
import { parseInput, runWithSession, type ActionResult } from '@/lib/server/action';
import { ownerUsername, showSavedProfile } from '@/lib/server/profileCache';
import {
  createCatalogItemInputSchema,
  createMissionaryAgencyInputSchema,
  faithCommunityIdSchema,
  updateFaithCommunityInputSchema,
} from '@/schemas/actions.schema';
import type { CatalogItem } from '@/services/catalog.service';

/** Catalog mutations (ADR-0006): sign-up adds a missing agency or church. */

type CatalogInput = {
  name: string;
  phoneNumber?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  website?: string;
};

/** A faith community may come with its pastor (E.164 phone; name required with a phone). */
type FaithCommunityInput = CatalogInput & { pastorName?: string; pastorPhone?: string };
type UpdateFaithCommunityInput = CatalogInput & {
  pastorName?: string | null;
  pastorPhone?: string | null;
};

function createCatalogItem(
  kind: CatalogKind,
  path: string,
  resourceKey: string,
  schema: typeof createCatalogItemInputSchema | typeof createMissionaryAgencyInputSchema,
  input: CatalogInput | FaithCommunityInput,
  invalidMessage: string,
  fallbackMessage: string
): Promise<ActionResult<CatalogItem>> | ActionResult<CatalogItem> {
  const parsed = parseInput(schema, input, invalidMessage);
  if (!parsed.ok) return parsed;

  return runWithSession(`actions${path}`, fallbackMessage, async (accessToken) => {
    const result = await backendFetch(path, { method: 'POST', body: parsed.data, accessToken });
    const item = createdItemFrom(result, resourceKey);
    // NOTE: the next search must find it (cached search, backend ADR-0041)
    updateTag(catalogTag(kind));
    return item;
  });
}

export async function createMissionaryAgencyAction(
  input: CatalogInput
): Promise<ActionResult<CatalogItem>> {
  return createCatalogItem(
    'missionaryAgencies',
    '/missionary-agencies',
    'missionaryAgency',
    createMissionaryAgencyInputSchema,
    input,
    'Dados da agência inválidos',
    'Não foi possível cadastrar a agência missionária'
  );
}

export async function createFaithCommunityAction(
  input: FaithCommunityInput
): Promise<ActionResult<CatalogItem>> {
  return createCatalogItem(
    'faithCommunities',
    '/faith-communities',
    'faithCommunity',
    createCatalogItemInputSchema,
    input,
    'Dados da igreja inválidos',
    'Não foi possível cadastrar a igreja'
  );
}

export async function updateFaithCommunityAction(
  id: string,
  input: UpdateFaithCommunityInput
): Promise<ActionResult<CatalogItem>> {
  const parsedId = parseInput(faithCommunityIdSchema, id, 'Comunidade de fé inválida');
  if (!parsedId.ok) return parsedId;
  const parsed = parseInput(updateFaithCommunityInputSchema, input, 'Dados da igreja inválidos');
  if (!parsed.ok) return parsed;

  const result = await runWithSession(
    'actions/update-faith-community',
    'Não foi possível atualizar a igreja',
    async (accessToken) => {
      const response = await backendFetch(
        `/faith-communities/${encodeURIComponent(parsedId.data)}`,
        {
          method: 'PATCH',
          body: parsed.data,
          accessToken,
        }
      );
      const item = createdItemFrom(response, 'faithCommunity');
      updateTag(catalogTag('faithCommunities'));
      const username = await ownerUsername(accessToken);
      return { item, username };
    }
  );
  if (!result.ok) return result;

  showSavedProfile(result.data.username);
  return { ok: true, data: result.data.item };
}
