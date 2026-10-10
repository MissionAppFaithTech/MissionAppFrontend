export type CatalogItem = {
  id: string;
  name: string;
};

export type CatalogListResponse = {
  data: CatalogItem[];
};

async function fetchCatalog(path: string, fallbackMessage: string): Promise<CatalogItem[]> {
  const response = await fetch(path, {
    method: 'GET',
    headers: { Accept: 'application/json' },
    cache: 'no-store',
  });

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    const message =
      typeof payload?.message === 'string' ? payload.message : fallbackMessage;
    throw new Error(message);
  }

  return Array.isArray(payload?.data) ? payload.data : [];
}

export function listMissionaryAgencies(): Promise<CatalogItem[]> {
  return fetchCatalog(
    '/api/missionary-agencies',
    'Não foi possível carregar as agências missionárias'
  );
}

export function listFaithCommunities(): Promise<CatalogItem[]> {
  return fetchCatalog(
    '/api/faith-communities',
    'Não foi possível carregar as comunidades de fé'
  );
}
