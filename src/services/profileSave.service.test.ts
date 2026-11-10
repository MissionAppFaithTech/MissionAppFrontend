import { beforeEach, describe, expect, it, vi } from 'vitest';
import { updateAbout, updateHeader, updatePublicContacts } from '@/services/profile.service';
import { saveProfileAbout, saveProfileEdits } from './profileSave.service';

vi.mock('@/services/profile.service', () => ({
  updateHeader: vi.fn(async () => ({})),
  updatePublicContacts: vi.fn(async () => ({})),
  updateAbout: vi.fn(async () => ({})),
}));

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
});
