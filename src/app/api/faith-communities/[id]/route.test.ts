import { beforeEach, describe, expect, it, vi } from 'vitest';
import { GET } from './route';
import { clearRefreshCache } from '@/lib/api/bff';
import { backendMock, mockBackend, resetActionHarness, setSession } from '@/test/actionHarness';

vi.mock('next/headers', async () => (await import('@/test/actionHarness')).headersMock);
vi.mock('@/lib/api/backend', async () => (await import('@/test/actionHarness')).backendMock);

const COMMUNITY_ID = '019a0000-0000-7000-9000-00000000c001';

beforeEach(() => {
  resetActionHarness();
  clearRefreshCache();
});

describe('GET /api/faith-communities/[id]', () => {
  it('returns the faith community details from the backend', async () => {
    const community = {
      id: COMMUNITY_ID,
      name: 'Igreja Batista Central',
      phoneNumber: '+552134567890',
      addressLine1: 'Rua Central, 10',
      addressLine2: null,
      city: 'Niterói',
      state: 'RJ',
      country: 'Brasil',
      postalCode: '24020000',
      website: 'https://ibc.org.br',
      pastorName: 'Pr. João',
      pastorPhone: '+5521987654321',
    };
    mockBackend({
      [`GET /faith-communities/${COMMUNITY_ID}`]: () => ({
        data: { faithCommunity: community },
      }),
    });

    const response = await GET(new Request('http://localhost'), {
      params: Promise.resolve({ id: COMMUNITY_ID }),
    });

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ data: { faithCommunity: community } });
  });

  it('rejects an invalid UUID and unauthenticated requests', async () => {
    const invalid = await GET(new Request('http://localhost'), {
      params: Promise.resolve({ id: 'invalid-id' }),
    });
    expect(invalid.status).toBe(422);

    setSession();
    const unauthorized = await GET(new Request('http://localhost'), {
      params: Promise.resolve({ id: COMMUNITY_ID }),
    });
    expect(unauthorized.status).toBe(401);
    expect(backendMock.backendFetch).not.toHaveBeenCalled();
  });
});
