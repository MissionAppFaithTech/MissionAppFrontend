import { describe, it, expect, vi, beforeEach } from 'vitest';
import { listFaithCommunities, listMissionaryAgencies } from './catalog.service';

describe('catalog.service', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('returns missionary agencies from the BFF', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ data: [{ id: 'agency-1', name: 'JOCUM' }] }),
      })
    );

    await expect(listMissionaryAgencies()).resolves.toEqual([{ id: 'agency-1', name: 'JOCUM' }]);
    expect(fetch).toHaveBeenCalledWith(
      '/api/missionary-agencies',
      expect.objectContaining({ method: 'GET' })
    );
  });

  it('returns faith communities from the BFF', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ data: [{ id: 'community-1', name: 'Igreja Batista' }] }),
      })
    );

    await expect(listFaithCommunities()).resolves.toEqual([
      { id: 'community-1', name: 'Igreja Batista' },
    ]);
  });

  it('throws the API message when the BFF fails', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        json: async () => ({ message: 'Falha no catálogo' }),
      })
    );

    await expect(listMissionaryAgencies()).rejects.toThrow('Falha no catálogo');
  });
});
