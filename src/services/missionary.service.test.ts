import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createMissionaryProfileAction, updateAboutAction } from '@/app/actions/missionary';
import { ApiError } from '@/lib/api/client';
import { completeMissionaryAbout, createMissionaryProfile } from './missionary.service';

vi.mock('@/app/actions/missionary', () => ({
  createMissionaryProfileAction: vi.fn(),
  updateAboutAction: vi.fn(),
}));

describe('missionary.service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createMissionaryProfile', () => {
    it('sends the agency id and returns the new id', async () => {
      vi.mocked(createMissionaryProfileAction).mockResolvedValue({
        ok: true,
        data: { missionary: { id: 'missionary-1' } as never, reauthenticationRequired: true },
      });

      await expect(createMissionaryProfile('a-1')).resolves.toEqual({ id: 'missionary-1' });
      expect(createMissionaryProfileAction).toHaveBeenCalledWith({ missionaryAgencyId: 'a-1' });
    });

    it('returns an empty id when the backend omits it', async () => {
      vi.mocked(createMissionaryProfileAction).mockResolvedValue({
        ok: true,
        data: { missionary: {} as never, reauthenticationRequired: true },
      });

      await expect(createMissionaryProfile('a-1')).resolves.toEqual({ id: '' });
    });

    it('rejects with the message and field errors', async () => {
      vi.mocked(createMissionaryProfileAction).mockResolvedValue({
        ok: false,
        status: 422,
        message: 'Agência inválida',
        fieldErrors: { missionaryAgencyId: 'Não existe' },
      });

      const error = await createMissionaryProfile('missing').catch((e: unknown) => e);
      expect(error).toBeInstanceOf(ApiError);
      expect(error).toMatchObject({
        status: 422,
        message: 'Agência inválida',
        fieldErrors: { missionaryAgencyId: 'Não existe' },
      });
    });
  });

  describe('completeMissionaryAbout', () => {
    it('sends the community id and description', async () => {
      vi.mocked(updateAboutAction).mockResolvedValue({
        ok: true,
        data: { missionary: { id: 'm-1' } as never },
      });

      await expect(
        completeMissionaryAbout({ faithCommunityId: 'fc-1', aboutMe: 'Bio' })
      ).resolves.toBeUndefined();
      expect(updateAboutAction).toHaveBeenCalledWith({ faithCommunityId: 'fc-1', aboutMe: 'Bio' });
    });

    it('keeps the sign-up copy when the server is unreachable', async () => {
      vi.mocked(updateAboutAction).mockResolvedValue({
        ok: false,
        status: 502,
        message: 'Não foi possível salvar o Sobre',
      });

      await expect(completeMissionaryAbout({ aboutMe: 'Bio' })).rejects.toMatchObject({
        status: 502,
        message: 'Não foi possível concluir os dados do seu perfil missionário',
      });
    });

    it('rejects with status 401 when the missionary session is missing', async () => {
      vi.mocked(updateAboutAction).mockResolvedValue({
        ok: false,
        status: 401,
        message: 'Sua sessão expirou. Entre novamente para continuar.',
      });

      await expect(completeMissionaryAbout({ aboutMe: 'Bio' })).rejects.toMatchObject({
        status: 401,
      });
    });
  });
});
