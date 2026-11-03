'use server';

import { backendFetch } from '@/lib/api/backend';
import { createdItemFrom } from '@/lib/api/catalog';
import { parseInput, runWithSession, type ActionResult } from '@/lib/server/action';
import { createCatalogItemInputSchema } from '@/schemas/actions.schema';
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

function createCatalogItem(
  path: string,
  resourceKey: string,
  input: CatalogInput,
  invalidMessage: string,
  fallbackMessage: string
): Promise<ActionResult<CatalogItem>> | ActionResult<CatalogItem> {
  const parsed = parseInput(createCatalogItemInputSchema, input, invalidMessage);
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
    input,
    'Dados da agência inválidos',
    'Não foi possível cadastrar a agência missionária'
  );
}

export async function createFaithCommunityAction(
  input: CatalogInput
): Promise<ActionResult<CatalogItem>> {
  return createCatalogItem(
    '/faith-communities',
    'faithCommunity',
    input,
    'Dados da igreja inválidos',
    'Não foi possível cadastrar a igreja'
  );
}
