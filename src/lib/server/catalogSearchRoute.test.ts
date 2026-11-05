import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/lib/server/catalogSearch', () => ({ searchCatalogCached: vi.fn() }));

import { BackendApiError } from '@/lib/api/backend';
import { searchCatalogCached } from '@/lib/server/catalogSearch';
import { resetRateLimits } from '@/lib/server/rateLimit';
import { CATALOG_SEARCH_IP_LIMIT, catalogSearchRoute } from './catalogSearchRoute';

const GET = catalogSearchRoute('missionaryAgencies', 'Não foi possível buscar as agências');

function search(query: string, ip: string | null = '10.0.0.1') {
  return GET(
    new Request(`http://localhost/api/missionary-agencies${query}`, {
      headers: ip ? { 'x-forwarded-for': `${ip}, 10.9.9.9` } : {},
    })
  );
}

describe('catalogSearchRoute', () => {
  beforeEach(() => {
    resetRateLimits();
    vi.mocked(searchCatalogCached).mockReset();
    vi.mocked(searchCatalogCached).mockResolvedValue({
      items: [{ id: 'a-1', name: 'Missão Ágape' }],
      hasMore: true,
    });
  });

  it('searches the normalized term with the default page size', async () => {
    const response = await search('?search=%20%20MISS%C3%95ES%20%20%20S%C3%A3o%20');

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      data: [{ id: 'a-1', name: 'Missão Ágape' }],
      meta: { hasMore: true },
    });
    expect(searchCatalogCached).toHaveBeenCalledWith('missionaryAgencies', 'missoes sao', 10);
  });

  it.each([
    ['', 'no term'],
    ['?search=a', 'one letter'],
    ['?search=%20%C3%A1%20', 'one letter with accent and spaces'],
  ])('answers an empty page without calling the backend (%s: %s)', async (query) => {
    const response = await search(query);

    await expect(response.json()).resolves.toEqual({ data: [], meta: { hasMore: false } });
    expect(searchCatalogCached).not.toHaveBeenCalled();
  });

  it('cuts very long terms to 100 characters', async () => {
    await search(`?search=${'a'.repeat(300)}`);

    expect(searchCatalogCached).toHaveBeenCalledWith('missionaryAgencies', 'a'.repeat(100), 10);
  });

  it.each([
    ['1', 1],
    ['5', 5],
    ['20', 20],
    ['50', 20],
    ['0', 10],
    ['-3', 10],
    ['2.5', 10],
    ['abc', 10],
  ])('reads limit=%s as a page of %d', async (limit, expected) => {
    await search(`?search=jocum&limit=${limit}`);

    expect(searchCatalogCached).toHaveBeenCalledWith('missionaryAgencies', 'jocum', expected);
  });

  it('limits each IP and tells how long to wait', async () => {
    for (let index = 0; index < CATALOG_SEARCH_IP_LIMIT; index += 1) {
      expect((await search('?search=jo')).status).toBe(200);
    }

    const blocked = await search('?search=jo');

    expect(blocked.status).toBe(429);
    expect(Number(blocked.headers.get('Retry-After'))).toBeGreaterThan(0);
    await expect(blocked.json()).resolves.toMatchObject({
      message: 'Muitas buscas seguidas. Aguarde alguns segundos e tente de novo.',
      code: 'E_TOO_MANY_REQUESTS',
    });
    expect(searchCatalogCached).toHaveBeenCalledTimes(CATALOG_SEARCH_IP_LIMIT);
    // Another visitor still searches.
    expect((await search('?search=jo', '10.0.0.2')).status).toBe(200);
  });

  it('reads the limit from CATALOG_SEARCH_IP_LIMIT when it is a positive integer', async () => {
    vi.stubEnv('CATALOG_SEARCH_IP_LIMIT', '2');
    try {
      expect((await search('?search=jo')).status).toBe(200);
      expect((await search('?search=jo')).status).toBe(200);
      expect((await search('?search=jo')).status).toBe(429);
      resetRateLimits();
    } finally {
      vi.unstubAllEnvs();
    }
  });

  it.each(['abc', '0', '-2', '2.5'])(
    'falls back to the default limit for CATALOG_SEARCH_IP_LIMIT=%s',
    async (raw) => {
      vi.stubEnv('CATALOG_SEARCH_IP_LIMIT', raw);
      try {
        for (let index = 0; index < CATALOG_SEARCH_IP_LIMIT; index += 1) {
          expect((await search('?search=jo')).status).toBe(200);
        }
        expect((await search('?search=jo')).status).toBe(429);
      } finally {
        vi.unstubAllEnvs();
      }
    }
  );

  it('does not limit requests without a proxy IP (local runs)', async () => {
    for (let index = 0; index < CATALOG_SEARCH_IP_LIMIT + 5; index += 1) {
      expect((await search('?search=jo', null)).status).toBe(200);
    }
  });

  it('does not count short terms against the IP limit', async () => {
    for (let index = 0; index < CATALOG_SEARCH_IP_LIMIT + 5; index += 1) await search('?search=j');

    expect((await search('?search=jo')).status).toBe(200);
  });

  it('maps backend failures to the BFF error envelope', async () => {
    vi.mocked(searchCatalogCached).mockRejectedValue(
      new BackendApiError('Too many requests', 429, { message: 'Too many requests' })
    );

    const response = await search('?search=jocum');

    expect(response.status).toBe(429);
    await expect(response.json()).resolves.toMatchObject({
      message: 'Muitas tentativas em pouco tempo. Aguarde um minuto e tente novamente.',
    });
  });

  it('answers 502 with the pt-BR fallback on a network failure and logs it by route', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.mocked(searchCatalogCached).mockRejectedValue(new TypeError('fetch failed'));

    const response = await search('?search=jocum');

    expect(response.status).toBe(502);
    await expect(response.json()).resolves.toEqual({
      message: 'Não foi possível buscar as agências',
    });
    expect(consoleError).toHaveBeenCalledWith(
      '[api/missionaryAgencies GET]',
      expect.any(TypeError)
    );
    consoleError.mockRestore();
  });
});
