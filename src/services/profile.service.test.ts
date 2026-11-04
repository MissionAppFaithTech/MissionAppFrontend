import { beforeEach, describe, expect, it, vi } from 'vitest';
import { changePasswordAction, updateAccountProfileAction } from '@/app/actions/account';
import { updateAboutAction, updatePublicContactsAction } from '@/app/actions/missionary';
import { ApiError } from '@/lib/api/client';
import type { AccountProfilePayload, BackendUser } from '@/types/backend';
import {
  changeAccountPassword,
  emptyProfile,
  formatWorkAddress,
  mapAccountProfile,
  mapPublicProfile,
  updateAbout,
  updateHeader,
  updatePublicContacts,
} from './profile.service';

vi.mock('@/app/actions/account', () => ({
  changePasswordAction: vi.fn(),
  updateAccountProfileAction: vi.fn(),
}));
vi.mock('@/app/actions/missionary', () => ({
  updateAboutAction: vi.fn(),
  updatePublicContactsAction: vi.fn(),
}));

import { publicMissionaryPayload } from '@/test/publicProfile';

const user: BackendUser = {
  id: 'user-1',
  fullName: 'Pastor Elias',
  username: 'pastor_elias',
  email: 'private.login@example.com',
  phoneNumber: '+5511999990000',
  biography: 'Missionário no Amazonas',
  profilePictureId: null,
  role: 'MISSIONARY',
};

function buildPayload(overrides: Partial<AccountProfilePayload> = {}): AccountProfilePayload {
  return {
    user,
    missionary: {
      id: 'missionary-1',
      publicEmail: 'contato@missao.org',
      publicPhone: '+5592988887777',
      aboutMe: 'Trabalho com ribeirinhos',
      missionStorySummary: '10 anos de ministério',
      originLocation: 'São Paulo',
      prayerRequest: 'Orem pela equipe',
      lifeVerse: 'Isaías 6:8',
      missionaryAgencyId: 'agency-1',
      faithCommunityId: 'community-1',
    },
    workAddress: {
      id: 'wa-1',
      missionaryId: 'missionary-1',
      zip: '69000-000',
      district: 'Centro',
      city: 'Manaus',
      state: 'AM',
      country: 'Brasil',
    },
    missionaryAgency: { id: 'agency-1', name: 'JMN' },
    faithCommunity: { id: 'community-1', name: 'Igreja Batista Central' },
    ...overrides,
  };
}

describe('formatWorkAddress', () => {
  it('joins city, state and country with " - "', () => {
    expect(
      formatWorkAddress({
        zip: '1',
        district: 'd',
        city: 'Manaus',
        state: 'AM',
        country: 'Brasil',
      })
    ).toBe('Manaus - AM - Brasil');
  });

  it('skips blank and whitespace-only parts and trims the rest', () => {
    expect(
      formatWorkAddress({ zip: '', district: '', city: '  Lima ', state: '   ', country: 'Peru' })
    ).toBe('Lima - Peru');
  });

  it('returns an empty string for null or undefined', () => {
    expect(formatWorkAddress(null)).toBe('');
    expect(formatWorkAddress(undefined)).toBe('');
  });
});

describe('mapAccountProfile', () => {
  it('maps user, missionary, work address and resolved names to the UI model', () => {
    const profile = mapAccountProfile(buildPayload());

    expect(profile).toMatchObject({
      userId: 'user-1',
      missionaryId: 'missionary-1',
      username: 'pastor_elias',
      displayName: 'Pastor Elias',
      roleDescription: 'Missionário no Amazonas',
      role: 'missionary',
      location: 'Manaus - AM - Brasil',
      about: {
        introduction: 'Trabalho com ribeirinhos',
        missionHistory: '10 anos de ministério',
        originLocation: 'São Paulo',
        currentLocation: 'Manaus - AM - Brasil',
        missionaryAgency: 'JMN',
        missionaryAgencyId: 'agency-1',
        faithCommunity: 'Igreja Batista Central',
        faithCommunityId: 'community-1',
        prayerRequests: 'Orem pela equipe',
        lifeVerse: 'Isaías 6:8',
        workAddress: {
          zip: '69000-000',
          district: 'Centro',
          city: 'Manaus',
          state: 'AM',
          country: 'Brasil',
        },
      },
      contact: {
        publicEmail: 'contato@missao.org',
        publicPhone: '+5592988887777',
      },
    });
  });

  it('fills the avatar from the profile picture URL, and leaves it empty while processing', () => {
    expect(
      mapAccountProfile(
        buildPayload({ user: { ...user, profilePictureUrl: 'https://cdn.test/p.webp' } })
      ).avatarUrl
    ).toBe('https://cdn.test/p.webp');
    expect(
      mapAccountProfile(buildPayload({ user: { ...user, profilePictureUrl: null } })).avatarUrl
    ).toBeUndefined();
  });

  it('enables WhatsApp only when the backend confirms the public phone takes it', () => {
    const confirmed = buildPayload();
    confirmed.missionary = { ...confirmed.missionary!, publicPhoneIsWhatsapp: true };
    expect(mapAccountProfile(confirmed).contact?.allowWhatsappContact).toBe(true);
    expect(mapAccountProfile(buildPayload()).contact?.allowWhatsappContact).toBe(false);
  });

  it('strips backend-only ids from the work address', () => {
    const profile = mapAccountProfile(buildPayload());
    expect(profile.about.workAddress).not.toHaveProperty('id');
    expect(profile.about.workAddress).not.toHaveProperty('missionaryId');
  });

  it('never leaks the private login e-mail/phone into the public contacts', () => {
    const profile = mapAccountProfile(
      buildPayload({
        missionary: { id: 'missionary-1', publicEmail: null, publicPhone: null },
      })
    );

    expect(profile.contact?.publicEmail).toBe('');
    expect(profile.contact?.publicPhone).toBe('');
    expect(profile.contact?.publicEmail).not.toBe(user.email);
    expect(profile.contact?.publicPhone).not.toBe(user.phoneNumber);
    expect(profile.contact?.accountEmail).toBe('private.login@example.com');
    expect(profile.contact?.accountPhone).toBe('+5511999990000');
  });

  it('keeps public contacts empty for a supporter without a missionary record', () => {
    const profile = mapAccountProfile({
      user: { ...user, role: 'SUPPORTER', biography: null },
      missionary: null,
      workAddress: null,
      missionaryAgency: null,
      faithCommunity: null,
    });

    expect(profile.role).toBe('supporter');
    expect(profile.missionaryId).toBe('');
    expect(profile.roleDescription).toBe('');
    expect(profile.location).toBe('');
    expect(profile.about).toEqual({
      introduction: '',
      missionHistory: '',
      originLocation: '',
      currentLocation: '',
      missionaryAgency: '',
      missionaryAgencyId: '',
      faithCommunity: '',
      faithCommunityId: '',
      prayerRequests: '',
      lifeVerse: '',
      workAddress: null,
    });
    expect(profile.contact).toEqual({
      publicEmail: '',
      publicPhone: '',
      allowWhatsappContact: false,
      accountEmail: user.email,
      accountPhone: user.phoneNumber,
    });
  });

  it('maps ADMIN to the missionary role (only SUPPORTER is a supporter)', () => {
    expect(mapAccountProfile(buildPayload({ user: { ...user, role: 'ADMIN' } })).role).toBe(
      'missionary'
    );
  });

  it('turns null missionary text fields into empty strings', () => {
    const profile = mapAccountProfile(
      buildPayload({
        missionary: {
          id: 'missionary-1',
          aboutMe: null,
          missionStorySummary: null,
          originLocation: null,
          prayerRequest: null,
          lifeVerse: null,
        },
        missionaryAgency: null,
        faithCommunity: null,
      })
    );

    expect(profile.about.introduction).toBe('');
    expect(profile.about.missionHistory).toBe('');
    expect(profile.about.originLocation).toBe('');
    expect(profile.about.prayerRequests).toBe('');
    expect(profile.about.lifeVerse).toBe('');
    expect(profile.about.missionaryAgency).toBe('');
    expect(profile.about.faithCommunity).toBe('');
  });

  it('starts counters at zero without the example-data flag', () => {
    const profile = mapAccountProfile(buildPayload());
    expect(profile).toMatchObject({
      followersCount: 0,
      projectsCount: 0,
      postsCount: 0,
      campaignsCount: 0,
      supportersCount: 0,
      followingCount: 0,
    });
    expect(profile.statsAreExample).toBe(false);
    expect(emptyProfile.statsAreExample).toBe(false);
  });
});

describe('profile.service saves (Server Actions)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('updateHeader', () => {
    it('sends the payload (null clears the bio) and returns the user', async () => {
      vi.mocked(updateAccountProfileAction).mockResolvedValue({ ok: true, data: { user } });

      await expect(updateHeader({ fullName: 'Pastor Elias', biography: null })).resolves.toEqual(
        user
      );
      expect(updateAccountProfileAction).toHaveBeenCalledWith({
        fullName: 'Pastor Elias',
        biography: null,
      });
    });

    it('surfaces field errors', async () => {
      vi.mocked(updateAccountProfileAction).mockResolvedValue({
        ok: false,
        status: 422,
        message: 'Dados de perfil inválidos',
        fieldErrors: { username: 'Este nome de usuário já está em uso' },
      });

      const error = await updateHeader({ username: 'usado' }).catch((e: unknown) => e);
      expect(error).toBeInstanceOf(ApiError);
      expect(error).toMatchObject({
        status: 422,
        fieldErrors: { username: 'Este nome de usuário já está em uso' },
      });
    });
  });

  it('updatePublicContacts returns the missionary', async () => {
    const missionary = { id: 'm-1', publicEmail: 'contato@missao.org' };
    vi.mocked(updatePublicContactsAction).mockResolvedValue({ ok: true, data: { missionary } });

    await expect(updatePublicContacts({ publicEmail: 'contato@missao.org' })).resolves.toEqual(
      missionary
    );
    expect(updatePublicContactsAction).toHaveBeenCalledWith({ publicEmail: 'contato@missao.org' });
  });

  it('updateAbout sends texts, catalog links and work address in one call', async () => {
    const workAddress = {
      zip: '48900-000',
      district: 'Centro',
      city: 'Juazeiro',
      state: 'BA',
      country: 'Brasil',
    };
    const data = {
      missionary: { id: 'm-1', lifeVerse: 'Fp 4:13' },
      workAddress,
      missionaryAgency: { id: 'agency-2', name: 'JOCUM' },
      faithCommunity: null,
    };
    vi.mocked(updateAboutAction).mockResolvedValue({ ok: true, data });

    await expect(
      updateAbout({
        lifeVerse: 'Fp 4:13',
        missionaryAgencyId: 'agency-2',
        faithCommunityId: null,
        workAddress,
      })
    ).resolves.toEqual(data);
    expect(updateAboutAction).toHaveBeenCalledTimes(1);
    expect(updateAboutAction).toHaveBeenCalledWith({
      lifeVerse: 'Fp 4:13',
      missionaryAgencyId: 'agency-2',
      faithCommunityId: null,
      workAddress,
    });
  });

  it('changeAccountPassword rejects with field errors when the current password is wrong', async () => {
    vi.mocked(changePasswordAction).mockResolvedValue({
      ok: false,
      status: 400,
      message: 'Senha atual incorreta',
      fieldErrors: { currentPassword: 'Senha atual incorreta' },
    });

    await expect(
      changeAccountPassword({
        currentPassword: 'x',
        newPassword: 'Nova1234!',
        newPasswordConfirmation: 'Nova1234!',
      })
    ).rejects.toMatchObject({
      status: 400,
      fieldErrors: { currentPassword: 'Senha atual incorreta' },
    });
  });
});

describe('mapPublicProfile', () => {
  it('maps the anonymous profile to the UI model', () => {
    expect(mapPublicProfile(publicMissionaryPayload)).toMatchObject({
      username: 'samuel_missionary',
      displayName: 'Samuel Mendonça',
      roleDescription: 'Missionário na África do Sul',
      role: 'missionary',
      location: 'Juazeiro - BA - Brasil',
      followersCount: 12,
      followingCount: 3,
      statsAreExample: false,
      about: {
        introduction: 'Sirvo comunidades rurais há dez anos.',
        missionHistory: 'Comecei em 2015 no sertão nordestino.',
        originLocation: 'Recife - Brasil',
        currentLocation: 'Juazeiro - BA - Brasil',
        missionaryAgency: 'JOCUM',
        faithCommunity: 'Igreja Batista Central',
        prayerRequests: 'Pela saúde da equipe.',
        lifeVerse: 'Filipenses 4:13',
        workAddress: null,
      },
      contact: {
        publicEmail: 'contato@missao.test',
        publicPhone: '+5521912345678',
        allowWhatsappContact: true,
      },
    });
  });

  it('shows the public profile picture when there is one', () => {
    expect(
      mapPublicProfile({ ...publicMissionaryPayload, profilePictureUrl: 'https://cdn.test/p.webp' })
        .avatarUrl
    ).toBe('https://cdn.test/p.webp');
    expect(
      mapPublicProfile({ ...publicMissionaryPayload, profilePictureUrl: null }).avatarUrl
    ).toBeUndefined();
  });

  it('turns missing fields into empty text and never invents private data', () => {
    const profile = mapPublicProfile({
      ...publicMissionaryPayload,
      biography: null,
      missionaryAgency: null,
      faithCommunity: null,
      about: {
        aboutMe: null,
        missionStorySummary: null,
        originLocation: null,
        prayerRequest: null,
        lifeVerse: null,
      },
      workLocation: null,
      contact: { publicEmail: null, publicPhone: null, publicPhoneIsWhatsapp: false },
    });

    expect(profile.roleDescription).toBe('');
    expect(profile.location).toBe('');
    expect(profile.about).toMatchObject({
      introduction: '',
      missionaryAgency: '',
      faithCommunity: '',
      lifeVerse: '',
    });
    expect(profile.contact).toEqual({
      publicEmail: '',
      publicPhone: '',
      allowWhatsappContact: false,
    });
    expect(profile.userId).toBeUndefined();
    expect(profile.contact).not.toHaveProperty('accountEmail');
  });
});
