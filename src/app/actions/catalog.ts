'use server';

import { backendFetch } from '@/lib/api/backend';
import { createdItemFrom } from '@/lib/api/catalog';
import { parseInput, runWithSession, type ActionResult } from '@/lib/server/action';
import {
  createCatalogItemInputSchema,
  createMissionaryAgencyInputSchema,
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

function createCatalogItem(
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
    return createdItemFrom(result, resourceKey);
  });
}

export async function createMissionaryAgencyAction(
  input: CatalogInput
): Promise<ActionResult<CatalogItem>> {
  return createCatalogItem(
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
    '/faith-communities',
    'faithCommunity',
    createCatalogItemInputSchema,
    input,
    'Dados da igreja inválidos',
    'Não foi possível cadastrar a igreja'
  );
}
