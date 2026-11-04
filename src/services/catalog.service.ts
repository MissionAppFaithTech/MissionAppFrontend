import { createFaithCommunityAction, createMissionaryAgencyAction } from '@/app/actions/catalog';
import { callAction } from '@/lib/api/callAction';
import { ApiError } from '@/lib/api/client';
import { addCatalogItem } from '@/services/queries/catalog';
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

async function fetchCatalog(path: string, fallbackMessage: string): Promise<CatalogItem[]> {
  const response = await fetch(path, {
    method: 'GET',
    headers: { Accept: 'application/json' },
    cache: 'no-store',
  });

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    const message = typeof payload?.message === 'string' ? payload.message : fallbackMessage;
    // ApiError carries the status, so the query cache never retries a 4xx (ADR-0002).
    throw new ApiError(message, response.status);
  }

  return Array.isArray(payload?.data) ? payload.data : [];
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

export function listMissionaryAgencies(): Promise<CatalogItem[]> {
  return fetchCatalog(
    '/api/missionary-agencies',
    'Não foi possível carregar as agências missionárias'
  );
}

export function listFaithCommunities(): Promise<CatalogItem[]> {
  return fetchCatalog('/api/faith-communities', 'Não foi possível carregar as comunidades de fé');
}

export async function createMissionaryAgency(input: MissionaryAgencyData): Promise<CatalogItem> {
  const item = await callAction(() =>
    createMissionaryAgencyAction(toCreateMissionaryAgencyPayload(input))
  );
  addCatalogItem('missionaryAgencies', item);
  return item;
}

export async function createFaithCommunity(input: FaithCommunityData): Promise<CatalogItem> {
  const item = await callAction(() =>
    createFaithCommunityAction(toCreateFaithCommunityPayload(input))
  );
  addCatalogItem('faithCommunities', item);
  return item;
}
