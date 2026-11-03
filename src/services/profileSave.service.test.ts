import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  updateAbout,
  updateHeader,
  updatePublicContacts,
  upsertWorkAddress,
} from '@/services/profile.service';
import { saveProfileAbout, saveProfileHeader } from './profileSave.service';

vi.mock('@/services/profile.service', () => ({
  updateHeader: vi.fn(async () => ({})),
  updatePublicContacts: vi.fn(async () => ({})),
  updateAbout: vi.fn(async () => ({})),
  upsertWorkAddress: vi.fn(async () => ({})),
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

    await saveProfileHeader({
      header: { fullName: 'Ana' },
      contacts: { publicEmail: 'ana@example.com' },
    });

    expect(updateHeader).toHaveBeenCalledWith({ fullName: 'Ana' });
    expect(updatePublicContacts).toHaveBeenCalledWith({ publicEmail: 'ana@example.com' });
    expect(order).toEqual(['header', 'contacts']);
  });

  it('skips empty parts of the header form', async () => {
    await saveProfileHeader({ header: {}, contacts: { publicPhone: null } });

    expect(updateHeader).not.toHaveBeenCalled();
    expect(updatePublicContacts).toHaveBeenCalledTimes(1);

    await saveProfileHeader({});
    expect(updatePublicContacts).toHaveBeenCalledTimes(1);
  });

  it('stops before the contacts when the header fails', async () => {
    vi.mocked(updateHeader).mockRejectedValue(new Error('falhou'));

    await expect(
      saveProfileHeader({ header: { fullName: 'Ana' }, contacts: { publicEmail: 'a@b.co' } })
    ).rejects.toThrow('falhou');
    expect(updatePublicContacts).not.toHaveBeenCalled();
  });

  it('saves the about fields, then the work address', async () => {
    await saveProfileAbout({ about: { lifeVerse: 'João 3:16' }, workAddress });

    expect(updateAbout).toHaveBeenCalledWith({ lifeVerse: 'João 3:16' });
    expect(upsertWorkAddress).toHaveBeenCalledWith(workAddress);
  });

  it('skips the parts of the about form that did not change', async () => {
    await saveProfileAbout({ about: {} });

    expect(updateAbout).not.toHaveBeenCalled();
    expect(upsertWorkAddress).not.toHaveBeenCalled();
  });
});
