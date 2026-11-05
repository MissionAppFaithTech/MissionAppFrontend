import { createFaithCommunityAction, createMissionaryAgencyAction } from '@/app/actions/catalog';
import { callAction } from '@/lib/api/callAction';
import { ApiError } from '@/lib/api/client';
import { CATALOG_SEARCH_LIMIT } from '@/lib/catalog/search';
import type { CatalogKind } from '@/lib/query/keys';
import { invalidateCatalogSearches } from '@/services/queries/catalog';
import type { FaithCommunityData, MissionaryAgencyData } from '@/types/account';

export type CatalogItem = {
  id: string;
  name: string;
};

/** One page of a catalog search (BFF `GET /api/<catalog>?search=`). */
export type CatalogSearchPage = {
  items: CatalogItem[];
  hasMore: boolean;
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

const SEARCH_PATHS: Record<CatalogKind, { path: string; fallback: string }> = {
  missionaryAgencies: {
    path: '/api/missionary-agencies',
    fallback: 'Não foi possível buscar as agências missionárias',
  },
  faithCommunities: {
    path: '/api/faith-communities',
    fallback: 'Não foi possível buscar as comunidades de fé',
  },
};

/**
 * Searches a catalog through the BFF (accent and case insensitive, backend
 * ADR-0041). `signal` lets the query cache abort a search the user has
 * already typed past.
 *
 * @throws ApiError with the pt-BR message and the status (no retry on 4xx).
 */
export async function searchCatalog(
  kind: CatalogKind,
  term: string,
  { signal }: { signal?: AbortSignal } = {}
): Promise<CatalogSearchPage> {
  const { path, fallback } = SEARCH_PATHS[kind];
  const query = new URLSearchParams({ search: term, limit: String(CATALOG_SEARCH_LIMIT) });
  const response = await fetch(`${path}?${query}`, {
    headers: { Accept: 'application/json' },
    signal,
  });
  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    const message = typeof payload?.message === 'string' ? payload.message : fallback;
    // ApiError carries the status, so the query cache never retries a 4xx (ADR-0002).
    throw new ApiError(message, response.status);
  }
  return {
    items: Array.isArray(payload?.data) ? payload.data : [],
    hasMore: payload?.meta?.hasMore === true,
  };
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
    pastorName: optionalText(input.pastorName),
    pastorPhone: optionalPhone(input.pastorPhone),
    addressLine1: optionalText(input.address1),
    addressLine2: optionalText(input.address2),
    city: optionalText(input.city),
    state: optionalText(input.state),
    country: optionalText(input.country),
    postalCode: optionalText(input.zipCode),
    website: optionalWebsite(input.website),
  };
}

export async function createMissionaryAgency(input: MissionaryAgencyData): Promise<CatalogItem> {
  const item = await callAction(() =>
    createMissionaryAgencyAction(toCreateMissionaryAgencyPayload(input))
  );
  invalidateCatalogSearches('missionaryAgencies');
  return item;
}

export async function createFaithCommunity(input: FaithCommunityData): Promise<CatalogItem> {
  const item = await callAction(() =>
    createFaithCommunityAction(toCreateFaithCommunityPayload(input))
  );
  invalidateCatalogSearches('faithCommunities');
  return item;
}
