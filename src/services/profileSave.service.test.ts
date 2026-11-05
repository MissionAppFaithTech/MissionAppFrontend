import { beforeEach, describe, expect, it, vi } from 'vitest';
import { updateAbout, updateHeader, updatePublicContacts } from '@/services/profile.service';
import { uploadPictureFile, waitForProcessedPicture } from '@/services/profilePicture.service';
import {
  profileSaveFeedback,
  saveProfileAbout,
  saveProfileEdits,
  type PictureOutcome,
} from './profileSave.service';

vi.mock('@/services/profile.service', () => ({
  updateHeader: vi.fn(async () => ({})),
  updatePublicContacts: vi.fn(async () => ({})),
  updateAbout: vi.fn(async () => ({})),
}));

vi.mock('@/services/profilePicture.service', () => ({
  uploadPictureFile: vi.fn(async () => 'asset-1'),
  waitForProcessedPicture: vi.fn(async () => 'https://cdn.test/asset-1.webp'),
}));

const file = new File(['photo'], 'foto.png', { type: 'image/png' });

const workAddress = {
  zip: '01001000',
  district: 'Sé',
  city: 'São Paulo',
  state: 'SP',
  country: 'Brasil',
};

describe('profileSave.service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('saves the header before the public contacts', async () => {
    const order: string[] = [];
    vi.mocked(updateHeader).mockImplementation(async () => {
      order.push('header');
      return {} as never;
    });
    vi.mocked(updatePublicContacts).mockImplementation(async () => {
      order.push('contacts');
      return {} as never;
    });

    await saveProfileEdits({
      header: { fullName: 'Ana' },
      contacts: { publicEmail: 'ana@example.com' },
    });

    expect(updateHeader).toHaveBeenCalledWith({ fullName: 'Ana' });
    expect(updatePublicContacts).toHaveBeenCalledWith({ publicEmail: 'ana@example.com' });
    expect(order).toEqual(['header', 'contacts']);
  });

  it('skips empty parts of the header form', async () => {
    await saveProfileEdits({ header: {}, contacts: { publicPhone: null } });

    expect(updateHeader).not.toHaveBeenCalled();
    expect(updatePublicContacts).toHaveBeenCalledTimes(1);

    await saveProfileEdits({});
    expect(updatePublicContacts).toHaveBeenCalledTimes(1);
  });

  it('stops before the contacts when the header fails', async () => {
    vi.mocked(updateHeader).mockRejectedValue(new Error('falhou'));

    await expect(
      saveProfileEdits({ header: { fullName: 'Ana' }, contacts: { publicEmail: 'a@b.co' } })
    ).rejects.toThrow('falhou');
    expect(updatePublicContacts).not.toHaveBeenCalled();
  });

  it('saves the about fields, catalog links and work address in one request', async () => {
    await saveProfileAbout({
      about: { lifeVerse: 'João 3:16', missionaryAgencyId: 'agency-2', faithCommunityId: null },
      workAddress,
    });

    expect(updateAbout).toHaveBeenCalledTimes(1);
    expect(updateAbout).toHaveBeenCalledWith({
      lifeVerse: 'João 3:16',
      missionaryAgencyId: 'agency-2',
      faithCommunityId: null,
      workAddress,
    });
  });

  it('sends only the work address when no text changed', async () => {
    await saveProfileAbout({ workAddress });

    expect(updateAbout).toHaveBeenCalledWith({ workAddress });
  });

  it('skips the request when nothing changed', async () => {
    await saveProfileAbout({ about: {} });
    await saveProfileAbout({});

    expect(updateAbout).not.toHaveBeenCalled();
  });

  describe('photo', () => {
    it('uploads the file and links it in the same PATCH as the header fields', async () => {
      vi.mocked(updateHeader).mockResolvedValue({ profilePictureUrl: 'https://cdn.test/a.webp' });

      await expect(
        saveProfileEdits({
          header: { fullName: 'Ana' },
          picture: { kind: 'replace', file },
          hadPicture: false,
        })
      ).resolves.toEqual({ picture: 'added' });

      expect(uploadPictureFile).toHaveBeenCalledWith(file);
      expect(updateHeader).toHaveBeenCalledTimes(1);
      expect(updateHeader).toHaveBeenCalledWith({ fullName: 'Ana', profilePictureId: 'asset-1' });
      expect(waitForProcessedPicture).not.toHaveBeenCalled();
    });

    it('uploads before the PATCH and does not link anything when the upload fails', async () => {
      vi.mocked(uploadPictureFile).mockRejectedValueOnce(new Error('rede'));

      await expect(
        saveProfileEdits({ header: { fullName: 'Ana' }, picture: { kind: 'replace', file } })
      ).rejects.toThrow('rede');
      expect(updateHeader).not.toHaveBeenCalled();
    });

    it('removes the photo with profilePictureId null', async () => {
      await expect(saveProfileEdits({ picture: { kind: 'remove' } })).resolves.toEqual({
        picture: 'removed',
      });
      expect(updateHeader).toHaveBeenCalledWith({ profilePictureId: null });
      expect(uploadPictureFile).not.toHaveBeenCalled();
    });

    it('waits for the backend to compress a new photo, then reports it replaced', async () => {
      vi.mocked(updateHeader).mockResolvedValue({ profilePictureUrl: null });
      const onProcessing = vi.fn();

      await expect(
        saveProfileEdits({ picture: { kind: 'replace', file }, hadPicture: true, onProcessing })
      ).resolves.toEqual({ picture: 'replaced' });
      expect(onProcessing).toHaveBeenCalledTimes(1);
      expect(waitForProcessedPicture).toHaveBeenCalledWith('asset-1');
    });

    it('reports a photo still processing after the wait as queued', async () => {
      vi.mocked(updateHeader).mockResolvedValue({ profilePictureUrl: null });
      vi.mocked(waitForProcessedPicture).mockResolvedValueOnce(null);

      await expect(saveProfileEdits({ picture: { kind: 'replace', file } })).resolves.toEqual({
        picture: 'queued',
      });
    });

    it('reports a processing failure without throwing (the rest is saved)', async () => {
      vi.mocked(updateHeader).mockResolvedValue({ profilePictureUrl: null });
      vi.mocked(waitForProcessedPicture).mockRejectedValueOnce(new Error('FAILED'));

      await expect(
        saveProfileEdits({
          header: { fullName: 'Ana' },
          contacts: { publicEmail: 'a@b.co' },
          picture: { kind: 'replace', file },
        })
      ).resolves.toEqual({ picture: 'failed' });
      expect(updatePublicContacts).toHaveBeenCalledTimes(1);
    });

    it('leaves the photo alone without a change', async () => {
      await expect(saveProfileEdits({ header: { fullName: 'Ana' } })).resolves.toEqual({
        picture: 'unchanged',
      });
      expect(updateHeader).toHaveBeenCalledWith({ fullName: 'Ana' });
    });
  });

  describe('profileSaveFeedback', () => {
    const feedback = (fieldsSaved: boolean, picture: PictureOutcome, fieldsMessage?: string) =>
      profileSaveFeedback({ fieldsSaved, picture, fieldsMessage });

    it('confirms each photo outcome in green', () => {
      expect(feedback(false, 'added')).toEqual({
        message: 'Foto de perfil adicionada com sucesso.',
        severity: 'success',
      });
      expect(feedback(false, 'replaced').message).toBe('Foto de perfil atualizada com sucesso.');
      expect(feedback(false, 'removed').message).toBe('Foto de perfil removida com sucesso.');
      expect(feedback(false, 'queued')).toEqual({
        message: 'Foto de perfil enviada. Ela aparece assim que o processamento terminar.',
        severity: 'success',
      });
    });

    it('confirms the fields alone or with the photo', () => {
      expect(feedback(true, 'unchanged')).toEqual({
        message: 'Perfil atualizado com sucesso.',
        severity: 'success',
      });
      expect(feedback(true, 'removed').message).toBe(
        'Perfil atualizado com sucesso. Foto de perfil removida.'
      );
      expect(feedback(true, 'added').message).toBe(
        'Perfil atualizado com sucesso. Foto de perfil adicionada.'
      );
      expect(feedback(true, 'replaced').message).toBe(
        'Perfil atualizado com sucesso. Foto de perfil atualizada.'
      );
      expect(feedback(true, 'queued').message).toBe(
        'Perfil atualizado com sucesso. Foto de perfil enviada. Ela aparece assim que o processamento terminar.'
      );
      expect(
        feedback(true, 'unchanged', 'Perfil de apoiador atualizado com sucesso!').message
      ).toBe('Perfil de apoiador atualizado com sucesso!');
    });

    it('reports a photo that could not be processed in red', () => {
      expect(feedback(false, 'failed')).toEqual({
        message: 'Não foi possível processar a imagem. Tente enviar outra foto.',
        severity: 'error',
      });
      expect(feedback(true, 'failed')).toEqual({
        message:
          'As demais alterações foram salvas, mas não foi possível processar a imagem. Tente enviar outra foto.',
        severity: 'error',
      });
    });

    it('falls back to the fields message when nothing about the photo applies', () => {
      expect(feedback(false, 'unchanged').message).toBe('Perfil atualizado com sucesso.');
    });
  });
});
