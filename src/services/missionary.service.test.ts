import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  isMissionaryUuid,
  toUpdateMissionaryAboutPayload,
  updateMissionaryAbout,
} from './missionary.service';

describe('missionary.service', () => {
  beforeEach(() => {
    vi.unstubAllGlobals();
  });

  it('maps the about form fields to the backend payload', () => {
    expect(
      toUpdateMissionaryAboutPayload({
        introduction: '  Sobre mim  ',
        missionHistory: 'História',
        originLocation: 'São Paulo - Brasil',
        faithCommunity: '018f1a2b-3c4d-7e8f-9a0b-1c2d3e4f5a6b',
        prayerRequests: 'Orem',
        lifeVerse: 'João 3:16',
      })
    ).toEqual({
      aboutMe: 'Sobre mim',
      missionStorySummary: 'História',
      originLocation: 'São Paulo - Brasil',
      faithCommunityId: '018f1a2b-3c4d-7e8f-9a0b-1c2d3e4f5a6b',
      prayerRequest: 'Orem',
      lifeVerse: 'João 3:16',
    });
  });

  it('omits empty values and non-uuid faith communities', () => {
    expect(
      toUpdateMissionaryAboutPayload({
        introduction: '   ',
        faithCommunity: 'Igreja Batista',
      })
    ).toEqual({
      aboutMe: undefined,
      missionStorySummary: undefined,
      originLocation: undefined,
      faithCommunityId: undefined,
      prayerRequest: undefined,
      lifeVerse: undefined,
    });
  });

  it('recognizes missionary uuids', () => {
    expect(isMissionaryUuid('018f1a2b-3c4d-7e8f-9a0b-1c2d3e4f5a6b')).toBe(true);
    expect(isMissionaryUuid('nao-uuid')).toBe(false);
  });

  it('patches the about endpoint and returns the missionary id', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ data: { missionary: { id: '018f1a2b-3c4d-7e8f-9a0b-1c2d3e4f5a6b' } } }),
    });
    vi.stubGlobal('fetch', fetchMock);

    await expect(
      updateMissionaryAbout('018f1a2b-3c4d-7e8f-9a0b-1c2d3e4f5a6b', { aboutMe: 'Texto' })
    ).resolves.toEqual({ id: '018f1a2b-3c4d-7e8f-9a0b-1c2d3e4f5a6b' });

    expect(fetchMock).toHaveBeenCalledWith(
      '/api/missionaries/018f1a2b-3c4d-7e8f-9a0b-1c2d3e4f5a6b/about',
      expect.objectContaining({ method: 'PATCH' })
    );
  });

  it('throws a localized error when the BFF rejects the update', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        json: async () => ({ message: 'Faça login para editar o sobre' }),
      })
    );

    await expect(
      updateMissionaryAbout('018f1a2b-3c4d-7e8f-9a0b-1c2d3e4f5a6b', { aboutMe: 'Texto' })
    ).rejects.toThrow('Faça login para editar o sobre');
  });
});
