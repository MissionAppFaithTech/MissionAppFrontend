import { beforeEach, describe, expect, it, vi } from 'vitest';
import { cacheLife, cacheTag } from 'next/cache';
import { BackendApiError } from '@/lib/api/backend';
import { publicBackendFetch } from '@/lib/api/public';
import { publicMissionaryPayload, publicProfileFixture } from '@/test/publicProfile';
import { getPublicProfile } from './publicProfile';

vi.mock('next/cache', () => ({ cacheLife: vi.fn(), cacheTag: vi.fn() }));
vi.mock('@/lib/api/public', () => ({ publicBackendFetch: vi.fn() }));

describe('getPublicProfile', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('reads the public profile by lowercase username and maps it', async () => {
    vi.mocked(publicBackendFetch).mockResolvedValue({
      data: { missionary: publicMissionaryPayload },
    });

    await expect(getPublicProfile(' Samuel_Missionary ')).resolves.toEqual(publicProfileFixture);
    expect(publicBackendFetch).toHaveBeenCalledWith('/public/missionaries/samuel_missionary');
  });

  it('caches under the profile tag with the public life (ADR-0004)', async () => {
    vi.mocked(publicBackendFetch).mockResolvedValue({
      data: { missionary: publicMissionaryPayload },
    });

    await getPublicProfile('Samuel_Missionary');

    expect(cacheTag).toHaveBeenCalledWith('profile:samuel_missionary');
    expect(cacheLife).toHaveBeenCalledWith('public');
  });

  it('answers null for a 404: missing, pending, inactive or deleted look the same', async () => {
    vi.mocked(publicBackendFetch).mockRejectedValue(
      new BackendApiError('Not found', 404, { code: 'E_MISSIONARY_PROFILE_NOT_FOUND' })
    );

    await expect(getPublicProfile('pendente')).resolves.toBeNull();
  });

  it.each(['ab', 'Ana Souza', 'ana-souza', 'a'.repeat(33), '../admin'])(
    'never asks the backend for an impossible username (%s)',
    async (username) => {
      await expect(getPublicProfile(username)).resolves.toBeNull();
      expect(publicBackendFetch).not.toHaveBeenCalled();
    }
  );

  it('lets other failures reach the error boundary', async () => {
    const tooMany = new BackendApiError('Too many requests', 429, {});
    vi.mocked(publicBackendFetch).mockRejectedValue(tooMany);

    await expect(getPublicProfile('samuel_missionary')).rejects.toBe(tooMany);
  });
});
