import { afterEach, beforeEach, describe, expect, it, vi, type MockInstance } from 'vitest';
import { ApiError } from '@/lib/api/client';
import type { AccountProfilePayload, BackendUser } from '@/types/backend';
import {
  EXAMPLE_PROFILE_STATS,
  changeAccountPassword,
  emptyProfile,
  formatWorkAddress,
  getMyProfile,
  mapAccountProfile,
  updateAbout,
  updateHeader,
  updateMissionaryIdentity,
  updatePublicContacts,
  upsertWorkAddress,
} from './profile.service';

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

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
        faithCommunity: 'Igreja Batista Central',
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
      faithCommunity: '',
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

  it('keeps the example stats flagged as example data', () => {
    const profile = mapAccountProfile(buildPayload());
    expect(profile).toMatchObject(EXAMPLE_PROFILE_STATS);
    expect(profile.statsAreExample).toBe(true);
    expect(emptyProfile.statsAreExample).toBe(true);
  });
});

describe('profile.service BFF calls', () => {
  let fetchSpy: MockInstance<typeof fetch>;

  beforeEach(() => {
    fetchSpy = vi.spyOn(globalThis, 'fetch');
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  function lastCall() {
    const [path, init] = fetchSpy.mock.calls.at(-1)!;
    return {
      path,
      method: init?.method,
      body: typeof init?.body === 'string' ? JSON.parse(init.body) : init?.body,
    };
  }

  describe('getMyProfile', () => {
    it('GETs /api/account/profile and unwraps data', async () => {
      const payload = buildPayload();
      fetchSpy.mockResolvedValue(jsonResponse({ data: payload }));

      await expect(getMyProfile()).resolves.toEqual(payload);
      expect(lastCall()).toEqual({ path: '/api/account/profile', method: 'GET', body: undefined });
    });

    it('rejects with an ApiError carrying the fallback message', async () => {
      fetchSpy.mockResolvedValue(jsonResponse({}, 500));

      await expect(getMyProfile()).rejects.toMatchObject({
        name: 'ApiError',
        status: 500,
        message: 'Não foi possível carregar o seu perfil',
      });
    });
  });

  describe('updateHeader', () => {
    it('PATCHes /api/account/profile (null clears the bio) and returns the user', async () => {
      fetchSpy.mockResolvedValue(
        jsonResponse({ data: { user: { fullName: 'Novo Nome', biography: null } } })
      );

      await expect(updateHeader({ fullName: 'Novo Nome', biography: null })).resolves.toEqual({
        fullName: 'Novo Nome',
        biography: null,
      });
      expect(lastCall()).toEqual({
        path: '/api/account/profile',
        method: 'PATCH',
        body: { fullName: 'Novo Nome', biography: null },
      });
    });

    it('surfaces field errors from the BFF', async () => {
      fetchSpy.mockResolvedValue(
        jsonResponse({ message: 'Inválido', fieldErrors: { username: 'Em uso' } }, 409)
      );

      const error = await updateHeader({ username: 'taken' }).catch((e: unknown) => e);
      expect(error).toBeInstanceOf(ApiError);
      expect(error).toMatchObject({ status: 409, fieldErrors: { username: 'Em uso' } });
    });
  });

  describe('updatePublicContacts', () => {
    it('PATCHes /api/missionaries/profile and returns the missionary', async () => {
      fetchSpy.mockResolvedValue(
        jsonResponse({ data: { missionary: { id: 'm-1', publicEmail: null } } })
      );

      await expect(updatePublicContacts({ publicEmail: null })).resolves.toEqual({
        id: 'm-1',
        publicEmail: null,
      });
      expect(lastCall()).toEqual({
        path: '/api/missionaries/profile',
        method: 'PATCH',
        body: { publicEmail: null },
      });
    });

    it('uses its own fallback message on failure', async () => {
      fetchSpy.mockResolvedValue(jsonResponse(null, 500));
      await expect(updatePublicContacts({ publicPhone: '+55' })).rejects.toThrow(
        'Não foi possível salvar os contatos públicos'
      );
    });
  });

  describe('updateAbout', () => {
    it('PATCHes /api/missionaries/about and returns the missionary', async () => {
      fetchSpy.mockResolvedValue(
        jsonResponse({ data: { missionary: { id: 'm-1', aboutMe: 'Olá', lifeVerse: null } } })
      );

      await expect(updateAbout({ aboutMe: 'Olá', lifeVerse: null })).resolves.toEqual({
        id: 'm-1',
        aboutMe: 'Olá',
        lifeVerse: null,
      });
      expect(lastCall()).toEqual({
        path: '/api/missionaries/about',
        method: 'PATCH',
        body: { aboutMe: 'Olá', lifeVerse: null },
      });
    });

    it('uses its own fallback message on failure', async () => {
      fetchSpy.mockResolvedValue(jsonResponse({}, 500));
      await expect(updateAbout({ aboutMe: 'x' })).rejects.toThrow(
        'Não foi possível salvar o Sobre'
      );
    });
  });

  describe('upsertWorkAddress', () => {
    const address = {
      zip: '69000-000',
      district: 'Centro',
      city: 'Manaus',
      state: 'AM',
      country: 'Brasil',
    };

    it('PATCHes /api/missionaries/work-address and strips backend ids', async () => {
      fetchSpy.mockResolvedValue(
        jsonResponse({ data: { workAddress: { id: 'wa-1', missionaryId: 'm-1', ...address } } })
      );

      await expect(upsertWorkAddress(address)).resolves.toEqual(address);
      expect(lastCall()).toEqual({
        path: '/api/missionaries/work-address',
        method: 'PATCH',
        body: address,
      });
    });

    it('uses its own fallback message on failure', async () => {
      fetchSpy.mockResolvedValue(jsonResponse({}, 500));
      await expect(upsertWorkAddress(address)).rejects.toThrow(
        'Não foi possível salvar o local de atuação'
      );
    });
  });

  describe('updateMissionaryIdentity', () => {
    it('PATCHes /api/missionaries/identity and resolves to undefined', async () => {
      fetchSpy.mockResolvedValue(jsonResponse({ data: {} }));

      await expect(
        updateMissionaryIdentity({ identityType: 'CPF', identityDocument: '12345678909' })
      ).resolves.toBeUndefined();
      expect(lastCall()).toEqual({
        path: '/api/missionaries/identity',
        method: 'PATCH',
        body: { identityType: 'CPF', identityDocument: '12345678909' },
      });
    });

    it('rejects with the BFF message on failure', async () => {
      fetchSpy.mockResolvedValue(jsonResponse({ message: 'CPF inválido' }, 422));
      await expect(
        updateMissionaryIdentity({ identityType: 'CPF', identityDocument: '0' })
      ).rejects.toThrow('CPF inválido');
    });
  });

  describe('changeAccountPassword', () => {
    const payload = {
      currentPassword: 'Old@1234',
      newPassword: 'New@12345',
      newPasswordConfirmation: 'New@12345',
    };

    it('PATCHes /api/account/password', async () => {
      fetchSpy.mockResolvedValue(jsonResponse({ data: {} }));

      await expect(changeAccountPassword(payload)).resolves.toBeUndefined();
      expect(lastCall()).toEqual({ path: '/api/account/password', method: 'PATCH', body: payload });
    });

    it('rejects with field errors when the current password is wrong', async () => {
      fetchSpy.mockResolvedValue(
        jsonResponse(
          { message: 'Senha atual incorreta', fieldErrors: { currentPassword: 'Incorreta' } },
          400
        )
      );

      await expect(changeAccountPassword(payload)).rejects.toMatchObject({
        message: 'Senha atual incorreta',
        status: 400,
        fieldErrors: { currentPassword: 'Incorreta' },
      });
    });
  });
});
