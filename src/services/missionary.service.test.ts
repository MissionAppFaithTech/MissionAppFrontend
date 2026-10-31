import { afterEach, beforeEach, describe, expect, it, vi, type MockInstance } from 'vitest';
import { ApiError } from '@/lib/api/client';
import { createMissionaryProfile, linkFaithCommunity } from './missionary.service';

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

describe('missionary.service', () => {
  let fetchSpy: MockInstance<typeof fetch>;

  beforeEach(() => {
    fetchSpy = vi.spyOn(globalThis, 'fetch');
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  function lastCall() {
    const [path, init] = fetchSpy.mock.calls.at(-1)!;
    return { path, method: init?.method, body: JSON.parse(String(init?.body)) };
  }

  describe('createMissionaryProfile', () => {
    it('POSTs the agency id to /api/missionaries/profile and returns the new id', async () => {
      fetchSpy.mockResolvedValue(
        jsonResponse({ data: { missionary: { id: 'missionary-1', missionaryAgencyId: 'a-1' } } })
      );

      await expect(createMissionaryProfile('a-1')).resolves.toEqual({ id: 'missionary-1' });
      expect(lastCall()).toEqual({
        path: '/api/missionaries/profile',
        method: 'POST',
        body: { missionaryAgencyId: 'a-1' },
      });
    });

    it('returns an empty id when the backend omits it', async () => {
      fetchSpy.mockResolvedValue(jsonResponse({ data: { missionary: {} } }));
      await expect(createMissionaryProfile('a-1')).resolves.toEqual({ id: '' });
    });

    it('rejects with the BFF message and field errors', async () => {
      fetchSpy.mockResolvedValue(
        jsonResponse(
          { message: 'Agência inválida', fieldErrors: { missionaryAgencyId: 'Não existe' } },
          422
        )
      );

      const error = await createMissionaryProfile('missing').catch((e: unknown) => e);
      expect(error).toBeInstanceOf(ApiError);
      expect(error).toMatchObject({
        status: 422,
        message: 'Agência inválida',
        fieldErrors: { missionaryAgencyId: 'Não existe' },
      });
    });

    it('falls back to a localized message when the BFF sends none', async () => {
      fetchSpy.mockResolvedValue(jsonResponse({}, 500));
      await expect(createMissionaryProfile('a-1')).rejects.toThrow(
        'Não foi possível criar o perfil missionário'
      );
    });
  });

  describe('linkFaithCommunity', () => {
    it('PATCHes the community id to /api/missionaries/about', async () => {
      fetchSpy.mockResolvedValue(jsonResponse({ data: { missionary: { id: 'm-1' } } }));

      await expect(linkFaithCommunity('fc-1')).resolves.toBeUndefined();
      expect(lastCall()).toEqual({
        path: '/api/missionaries/about',
        method: 'PATCH',
        body: { faithCommunityId: 'fc-1' },
      });
    });

    it('falls back to a localized message on failure', async () => {
      fetchSpy.mockResolvedValue(jsonResponse(null, 500));
      await expect(linkFaithCommunity('fc-1')).rejects.toThrow(
        'Não foi possível vincular a comunidade de fé'
      );
    });

    it('rejects with status 401 when the missionary session is missing', async () => {
      fetchSpy.mockResolvedValue(jsonResponse({ message: 'Não autenticado' }, 401));
      await expect(linkFaithCommunity('fc-1')).rejects.toMatchObject({ status: 401 });
    });
  });
});
