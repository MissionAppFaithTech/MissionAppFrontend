import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ApiError } from '@/lib/api/client';
import * as profileService from '@/services/profile.service';
import type { AccountProfilePayload } from '@/types/backend';
import type { ProfileData } from '@/types/profile';
import { PROFILE_STORAGE_KEY, rehydrateProfileStore, useProfileStore } from './profileStore';

vi.mock('@/services/profile.service', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/services/profile.service')>();
  return {
    ...actual,
    getMyProfile: vi.fn(),
    updateHeader: vi.fn(),
    updatePublicContacts: vi.fn(),
    updateAbout: vi.fn(),
    upsertWorkAddress: vi.fn(),
  };
});

const { emptyProfile } = profileService;
const getMyProfile = vi.mocked(profileService.getMyProfile);
const updateHeader = vi.mocked(profileService.updateHeader);
const updatePublicContacts = vi.mocked(profileService.updatePublicContacts);
const updateAbout = vi.mocked(profileService.updateAbout);
const upsertWorkAddress = vi.mocked(profileService.upsertWorkAddress);

const LEGACY_STORAGE_KEY = 'missionapp_missionary_profile_v1';

const payload: AccountProfilePayload = {
  user: {
    id: 'user-1',
    fullName: 'Ana Missionária',
    username: 'ana',
    email: 'ana.login@example.com',
    phoneNumber: '+5511900000000',
    biography: 'Bio original',
    profilePictureId: null,
    role: 'MISSIONARY',
  },
  missionary: {
    id: 'missionary-1',
    publicEmail: 'publico@missao.org',
    publicPhone: '+5592900000000',
    aboutMe: 'Sobre mim',
    missionStorySummary: 'História',
    originLocation: 'Recife',
    prayerRequest: 'Oração',
    lifeVerse: 'Salmo 23',
  },
  workAddress: {
    zip: '69000-000',
    district: 'Centro',
    city: 'Manaus',
    state: 'AM',
    country: 'Brasil',
  },
  missionaryAgency: { id: 'agency-1', name: 'JMN' },
  faithCommunity: { id: 'fc-1', name: 'Igreja Local' },
};

const loadedProfile = profileService.mapAccountProfile(payload);

function seedProfile(profile: ProfileData = loadedProfile) {
  useProfileStore.setState({ profile, status: 'ready', error: null });
}

function readPersisted(): { state: { profile: ProfileData }; version: number } | null {
  const raw = window.sessionStorage.getItem(PROFILE_STORAGE_KEY);
  return raw ? JSON.parse(raw) : null;
}

function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((r) => {
    resolve = r;
  });
  return { promise, resolve };
}

describe('profileStore', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useProfileStore.setState(useProfileStore.getInitialState(), true);
    window.sessionStorage.clear();
    window.localStorage.clear();
  });

  afterEach(() => {
    window.sessionStorage.clear();
    window.localStorage.clear();
  });

  it('starts idle with the empty profile and example stats', () => {
    const state = useProfileStore.getState();
    expect(state.status).toBe('idle');
    expect(state.error).toBeNull();
    expect(state.hasHydrated).toBe(false);
    expect(state.profile).toEqual(emptyProfile);
    expect(state.profile.statsAreExample).toBe(true);
  });

  it('skips automatic hydration (rehydrated explicitly on the client)', () => {
    expect(useProfileStore.persist.getOptions().skipHydration).toBe(true);
  });

  describe('fetchProfile', () => {
    it('sets loading while in flight, then stores the mapped profile', async () => {
      const pending = deferred<AccountProfilePayload>();
      getMyProfile.mockReturnValue(pending.promise);

      const request = useProfileStore.getState().fetchProfile();
      expect(useProfileStore.getState().status).toBe('loading');

      pending.resolve(payload);
      const result = await request;

      expect(result).toEqual(loadedProfile);
      expect(useProfileStore.getState()).toMatchObject({
        status: 'ready',
        error: null,
        profile: loadedProfile,
      });
    });

    it('keeps the private login e-mail out of the public contact', async () => {
      getMyProfile.mockResolvedValue({
        ...payload,
        missionary: { id: 'missionary-1', publicEmail: null, publicPhone: null },
      });

      await useProfileStore.getState().fetchProfile();

      const contact = useProfileStore.getState().profile.contact;
      expect(contact?.publicEmail).toBe('');
      expect(contact?.accountEmail).toBe('ana.login@example.com');
    });

    it('never throws on failure: sets status error and keeps the previous profile', async () => {
      seedProfile();
      getMyProfile.mockRejectedValue(new ApiError('Servidor indisponível', 503));

      await expect(useProfileStore.getState().fetchProfile()).resolves.toBeNull();

      expect(useProfileStore.getState()).toMatchObject({
        status: 'error',
        error: 'Servidor indisponível',
        profile: loadedProfile,
      });
    });

    it('uses a localized fallback message for non-Error rejections', async () => {
      getMyProfile.mockRejectedValue('boom');

      await expect(useProfileStore.getState().fetchProfile()).resolves.toBeNull();
      expect(useProfileStore.getState().error).toBe('Não foi possível carregar o seu perfil');
    });

    it('clears a previous error when a retry succeeds', async () => {
      useProfileStore.setState({ status: 'error', error: 'antigo' });
      getMyProfile.mockResolvedValue(payload);

      await useProfileStore.getState().fetchProfile();
      expect(useProfileStore.getState()).toMatchObject({ status: 'ready', error: null });
    });

    it('resets the store and clears storage on 401', async () => {
      seedProfile();
      expect(readPersisted()).not.toBeNull();
      getMyProfile.mockRejectedValue(new ApiError('Sessão expirada', 401));

      await expect(useProfileStore.getState().fetchProfile()).resolves.toBeNull();

      expect(useProfileStore.getState()).toMatchObject({
        status: 'idle',
        error: null,
        profile: emptyProfile,
      });
      expect(readPersisted()).toBeNull();
    });
  });

  describe('saveHeader', () => {
    beforeEach(() => seedProfile());

    it('updates header fields only after the backend confirms', async () => {
      const pending = deferred<{ fullName: string }>();
      updateHeader.mockReturnValue(pending.promise);

      const save = useProfileStore.getState().saveHeader({ header: { fullName: 'Ana Souza' } });
      expect(useProfileStore.getState().profile.displayName).toBe('Ana Missionária');

      pending.resolve({ fullName: 'Ana Souza' });
      await save;

      expect(updateHeader).toHaveBeenCalledWith({ fullName: 'Ana Souza' });
      expect(useProfileStore.getState().profile.displayName).toBe('Ana Souza');
    });

    it('keeps the current bio when neither the payload nor the response mention it', async () => {
      const before = useProfileStore.getState().profile.roleDescription;
      updateHeader.mockResolvedValue({ fullName: 'Só o nome' });

      await useProfileStore.getState().saveHeader({ header: { fullName: 'Só o nome' } });

      expect(before).not.toBe('');
      expect(useProfileStore.getState().profile.roleDescription).toBe(before);
    });

    it('prefers the backend response over the submitted values', async () => {
      updateHeader.mockResolvedValue({ username: 'ana_normalizada' });

      await useProfileStore.getState().saveHeader({ header: { username: 'Ana_Normalizada' } });
      expect(useProfileStore.getState().profile.username).toBe('ana_normalizada');
    });

    it('falls back to the submitted values when the response omits them', async () => {
      updateHeader.mockResolvedValue({});

      await useProfileStore.getState().saveHeader({
        header: { fullName: 'Nome Novo', biography: 'Bio nova' },
      });

      expect(useProfileStore.getState().profile).toMatchObject({
        displayName: 'Nome Novo',
        roleDescription: 'Bio nova',
        username: 'ana',
      });
    });

    it('clears the bio when null is sent', async () => {
      updateHeader.mockResolvedValue({ biography: null });

      await useProfileStore.getState().saveHeader({ header: { biography: null } });
      expect(useProfileStore.getState().profile.roleDescription).toBe('');
    });

    it('rethrows and leaves the profile unchanged when the header save fails', async () => {
      const error = new ApiError('Nome de usuário em uso', 409, { username: 'Em uso' });
      updateHeader.mockRejectedValue(error);
      const before = useProfileStore.getState().profile;

      await expect(
        useProfileStore.getState().saveHeader({
          header: { username: 'taken' },
          contacts: { publicEmail: 'novo@missao.org' },
        })
      ).rejects.toBe(error);

      expect(useProfileStore.getState().profile).toBe(before);
      expect(updatePublicContacts).not.toHaveBeenCalled();
    });

    it('saves public contacts and clears one when null is sent', async () => {
      updatePublicContacts.mockResolvedValue({ publicEmail: 'novo@missao.org', publicPhone: null });

      await useProfileStore.getState().saveHeader({
        contacts: { publicEmail: 'novo@missao.org', publicPhone: null },
      });

      expect(updateHeader).not.toHaveBeenCalled();
      expect(updatePublicContacts).toHaveBeenCalledWith({
        publicEmail: 'novo@missao.org',
        publicPhone: null,
      });
      expect(useProfileStore.getState().profile.contact).toMatchObject({
        publicEmail: 'novo@missao.org',
        publicPhone: '',
        accountEmail: 'ana.login@example.com',
      });
    });

    it('saves the header before contacts, keeping the header when contacts fail', async () => {
      updateHeader.mockResolvedValue({ fullName: 'Ana Souza' });
      updatePublicContacts.mockRejectedValue(new ApiError('Telefone inválido', 422));

      await expect(
        useProfileStore.getState().saveHeader({
          header: { fullName: 'Ana Souza' },
          contacts: { publicPhone: 'abc' },
        })
      ).rejects.toThrow('Telefone inválido');

      const profile = useProfileStore.getState().profile;
      expect(profile.displayName).toBe('Ana Souza');
      expect(profile.contact?.publicPhone).toBe('+5592900000000');
      expect(updateHeader.mock.invocationCallOrder[0]).toBeLessThan(
        updatePublicContacts.mock.invocationCallOrder[0]
      );
    });

    it('does not call the backend for empty inputs', async () => {
      const before = useProfileStore.getState().profile;
      await useProfileStore.getState().saveHeader({ header: {}, contacts: {} });

      expect(updateHeader).not.toHaveBeenCalled();
      expect(updatePublicContacts).not.toHaveBeenCalled();
      expect(useProfileStore.getState().profile).toBe(before);
    });
  });

  describe('saveAbout', () => {
    const newAddress = {
      zip: '01000-000',
      district: 'Sé',
      city: 'São Paulo',
      state: 'SP',
      country: 'Brasil',
    };

    beforeEach(() => seedProfile());

    it('applies about fields after success and clears fields sent as null', async () => {
      updateAbout.mockResolvedValue({ id: 'missionary-1', aboutMe: 'Novo sobre' });

      await useProfileStore.getState().saveAbout({
        about: { aboutMe: 'Novo sobre', lifeVerse: null, prayerRequest: null },
      });

      expect(updateAbout).toHaveBeenCalledWith({
        aboutMe: 'Novo sobre',
        lifeVerse: null,
        prayerRequest: null,
      });
      expect(useProfileStore.getState().profile.about).toMatchObject({
        introduction: 'Novo sobre',
        lifeVerse: '',
        prayerRequests: '',
        missionHistory: 'História',
        originLocation: 'Recife',
      });
    });

    it('updates the work address and the formatted location', async () => {
      upsertWorkAddress.mockResolvedValue(newAddress);

      await useProfileStore.getState().saveAbout({ workAddress: newAddress });

      expect(upsertWorkAddress).toHaveBeenCalledWith(newAddress);
      const profile = useProfileStore.getState().profile;
      expect(profile.location).toBe('São Paulo - SP - Brasil');
      expect(profile.about.currentLocation).toBe('São Paulo - SP - Brasil');
      expect(profile.about.workAddress).toEqual(newAddress);
    });

    it('rethrows and leaves the profile unchanged when the about save fails', async () => {
      const error = new ApiError('Texto muito longo', 422, { aboutMe: 'Máx. 500' });
      updateAbout.mockRejectedValue(error);
      const before = useProfileStore.getState().profile;

      await expect(
        useProfileStore.getState().saveAbout({
          about: { aboutMe: 'x'.repeat(600) },
          workAddress: newAddress,
        })
      ).rejects.toBe(error);

      expect(useProfileStore.getState().profile).toBe(before);
      expect(upsertWorkAddress).not.toHaveBeenCalled();
    });

    it('keeps the saved about fields when the work address fails afterwards', async () => {
      updateAbout.mockResolvedValue({ aboutMe: 'Novo sobre' });
      upsertWorkAddress.mockRejectedValue(new ApiError('CEP inválido', 422));

      await expect(
        useProfileStore.getState().saveAbout({
          about: { aboutMe: 'Novo sobre' },
          workAddress: newAddress,
        })
      ).rejects.toThrow('CEP inválido');

      const profile = useProfileStore.getState().profile;
      expect(profile.about.introduction).toBe('Novo sobre');
      expect(profile.location).toBe('Manaus - AM - Brasil');
    });

    it('does not call the backend for empty inputs', async () => {
      await useProfileStore.getState().saveAbout({ about: {} });
      expect(updateAbout).not.toHaveBeenCalled();
      expect(upsertWorkAddress).not.toHaveBeenCalled();
    });
  });

  describe('persistence', () => {
    const withPrivateData: ProfileData = {
      ...loadedProfile,
      financial: {
        supporterMessage: 'Obrigado',
        pix: { enabled: true, key: '12345678909', keyType: 'cpf' },
        bankTransfer: {
          enabled: true,
          bankName: 'Banco',
          bankNumber: '001',
          agency: '1234',
          account: '99999-9',
          accountType: 'corrente',
          holderName: 'Ana',
          holderDocument: '12345678909',
        },
      },
    };

    it('partialize keeps only the public profile (no contact or financial)', () => {
      const partialize = useProfileStore.persist.getOptions().partialize!;
      const output = partialize({ ...useProfileStore.getState(), profile: withPrivateData }) as {
        profile: ProfileData;
      };

      expect(Object.keys(output)).toEqual(['profile']);
      expect(output.profile).not.toHaveProperty('contact');
      expect(output.profile).not.toHaveProperty('financial');
      expect(output.profile.displayName).toBe('Ana Missionária');
    });

    it('writes to sessionStorage without e-mail, phone or financial data', () => {
      seedProfile(withPrivateData);

      const raw = window.sessionStorage.getItem(PROFILE_STORAGE_KEY)!;
      expect(raw).toBeTruthy();
      expect(raw).not.toContain('ana.login@example.com');
      expect(raw).not.toContain('publico@missao.org');
      expect(raw).not.toContain('+5511900000000');
      expect(raw).not.toContain('12345678909');
      expect(readPersisted()).toMatchObject({ version: 2 });
      expect(window.localStorage.getItem(PROFILE_STORAGE_KEY)).toBeNull();
    });

    it('reset clears the state and sessionStorage', () => {
      seedProfile();
      expect(readPersisted()).not.toBeNull();

      useProfileStore.getState().reset();

      expect(readPersisted()).toBeNull();
      expect(useProfileStore.getState()).toMatchObject({
        profile: emptyProfile,
        status: 'idle',
        error: null,
      });
    });
  });

  describe('rehydrateProfileStore', () => {
    it('restores the cached public profile, marks hydration and drops the legacy key', async () => {
      window.localStorage.setItem(LEGACY_STORAGE_KEY, JSON.stringify({ email: 'pii' }));
      const { contact: _contact, ...publicProfile } = loadedProfile;
      window.sessionStorage.setItem(
        PROFILE_STORAGE_KEY,
        JSON.stringify({ state: { profile: publicProfile }, version: 2 })
      );

      await rehydrateProfileStore();

      const state = useProfileStore.getState();
      expect(state.hasHydrated).toBe(true);
      expect(state.profile.displayName).toBe('Ana Missionária');
      expect(state.profile.about.currentLocation).toBe('Manaus - AM - Brasil');
      // Missing keys come back from the empty profile, never from storage.
      expect(state.profile.contact).toEqual(emptyProfile.contact);
      expect(window.localStorage.getItem(LEGACY_STORAGE_KEY)).toBeNull();
    });

    it('discards a cache written by another version', async () => {
      window.sessionStorage.setItem(
        PROFILE_STORAGE_KEY,
        JSON.stringify({
          state: { profile: { ...loadedProfile, displayName: 'Velho' } },
          version: 1,
        })
      );

      await rehydrateProfileStore();

      expect(useProfileStore.getState().profile).toEqual(emptyProfile);
      expect(useProfileStore.getState().hasHydrated).toBe(true);
    });

    it('keeps the current state when nothing is cached', async () => {
      await rehydrateProfileStore();
      expect(useProfileStore.getState().profile).toEqual(emptyProfile);
      expect(useProfileStore.getState().hasHydrated).toBe(true);
    });

    it('still rehydrates when localStorage is blocked', async () => {
      const removeItem = vi.spyOn(Storage.prototype, 'removeItem').mockImplementationOnce(() => {
        throw new DOMException('blocked', 'SecurityError');
      });

      await expect(rehydrateProfileStore()).resolves.toBeUndefined();
      expect(useProfileStore.getState().hasHydrated).toBe(true);
      removeItem.mockRestore();
    });
  });
});
