import { localizeApiErrorMessage } from '@/lib/api/errors';
import type { FaithCommunityData, MissionaryAgencyData } from '@/types/account';

export type CatalogItem = {
  id: string;
  name: string;
};

export type CatalogListResponse = {
  data: CatalogItem[];
};

function optionalText(value?: string) {
  const trimmed = value?.trim() ?? '';
  return trimmed ? trimmed : undefined;
}

function optionalPhone(value?: string) {
  const digits = value?.replace(/\D/g, '') ?? '';
  if (digits.length <= 4) return undefined;
  const compact = value?.replace(/[^\d+]/g, '') ?? '';
  return compact.startsWith('+') ? compact : `+${compact}`;
}

function optionalWebsite(value?: string) {
  const trimmed = optionalText(value);
  if (!trimmed) return undefined;
  return trimmed.includes('://') ? trimmed : `https://${trimmed}`;
}

function catalogItemsFrom(payload: unknown, collectionKey: string): CatalogItem[] {
  const root =
    payload && typeof payload === 'object' && 'data' in payload
      ? (payload as { data: unknown }).data
      : payload;

  const source = Array.isArray(root)
    ? root
    : root && typeof root === 'object' && collectionKey in root
      ? (root as Record<string, unknown>)[collectionKey]
      : [];

  if (!Array.isArray(source)) return [];

  return source.flatMap((item) => {
    if (!item || typeof item !== 'object') return [];
    const id = 'id' in item && typeof item.id === 'string' ? item.id : '';
    const name = 'name' in item && typeof item.name === 'string' ? item.name : '';
    return id && name ? [{ id, name }] : [];
  });
}

function createdItemFrom(payload: unknown, resourceKey: string): CatalogItem {
  const root =
    payload && typeof payload === 'object' && 'data' in payload
      ? (payload as { data: unknown }).data
      : payload;
  const resource =
    root && typeof root === 'object' && resourceKey in root
      ? (root as Record<string, unknown>)[resourceKey]
      : root;

  const id =
    resource && typeof resource === 'object' && 'id' in resource && typeof resource.id === 'string'
      ? resource.id
      : '';
  const name =
    resource &&
    typeof resource === 'object' &&
    'name' in resource &&
    typeof resource.name === 'string'
      ? resource.name
      : '';

  if (!id || !name) {
    throw new Error('Resposta inválida ao cadastrar o item');
  }

  return { id, name };
}

async function fetchCatalog(path: string, fallbackMessage: string): Promise<CatalogItem[]> {
  const response = await fetch(path, {
    method: 'GET',
    headers: { Accept: 'application/json' },
    cache: 'no-store',
  });

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    const message = typeof payload?.message === 'string' ? payload.message : fallbackMessage;
    throw new Error(localizeApiErrorMessage(message));
  }

  return Array.isArray(payload?.data) ? payload.data : [];
}

async function postCatalog(
  path: string,
  body: Record<string, unknown>,
  resourceKey: string,
  fallbackMessage: string
): Promise<CatalogItem> {
  const response = await fetch(path, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
    cache: 'no-store',
  });

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    const message = typeof payload?.message === 'string' ? payload.message : fallbackMessage;
    throw new Error(localizeApiErrorMessage(message));
  }

  return createdItemFrom(payload, resourceKey);
}

export function toCreateMissionaryAgencyPayload(input: MissionaryAgencyData) {
  return {
    name: input.name.trim(),
    phoneNumber: optionalPhone(input.phone),
    addressLine1: optionalText(input.address1),
    addressLine2: optionalText(input.address2),
    city: optionalText(input.city),
    state: optionalText(input.state),
    country: optionalText(input.country),
    postalCode: optionalText(input.zipCode),
    website: optionalWebsite(input.website),
  };
}

export function toCreateFaithCommunityPayload(input: FaithCommunityData) {
  return {
    name: input.name.trim(),
    phoneNumber: optionalPhone(input.churchPhone),
    addressLine1: optionalText(input.address1),
    addressLine2: optionalText(input.address2),
    city: optionalText(input.city),
    state: optionalText(input.state),
    country: optionalText(input.country),
    postalCode: optionalText(input.zipCode),
    website: optionalWebsite(input.website),
  };
}

export function listMissionaryAgencies(): Promise<CatalogItem[]> {
  return fetchCatalog(
    '/api/missionary-agencies',
    'Não foi possível carregar as agências missionárias'
  );
}

export function listFaithCommunities(): Promise<CatalogItem[]> {
  return fetchCatalog('/api/faith-communities', 'Não foi possível carregar as comunidades de fé');
}

export function createMissionaryAgency(input: MissionaryAgencyData): Promise<CatalogItem> {
  return postCatalog(
    '/api/missionary-agencies',
    toCreateMissionaryAgencyPayload(input),
    'missionaryAgency',
    'Não foi possível cadastrar a agência missionária'
  );
}

export function createFaithCommunity(input: FaithCommunityData): Promise<CatalogItem> {
  return postCatalog(
    '/api/faith-communities',
    toCreateFaithCommunityPayload(input),
    'faithCommunity',
    'Não foi possível cadastrar a igreja'
  );
}

export function normalizeCatalogList(payload: unknown, collectionKey: string): CatalogListResponse {
  return { data: catalogItemsFrom(payload, collectionKey) };
}
