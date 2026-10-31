import { afterEach, beforeEach, describe, expect, it, vi, type MockInstance } from 'vitest';
import { ApiError } from '@/lib/api/client';
import { emptyProfile } from '@/services/profile.service';
import { useMissionaryRegisterStore } from './missionaryRegisterStore';
import { PROFILE_STORAGE_KEY, useProfileStore } from './profileStore';
import { clearUserStores, useSessionStore } from './sessionStore';
import { useSupporterRegisterStore } from './supporterRegisterStore';

const MISSIONARY_REGISTER_KEY = 'missionapp_missionary_register_v1';
const SUPPORTER_REGISTER_KEY = 'missionapp_supporter_register_v1';

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

/** Fills every user-scoped store (and therefore sessionStorage) with data. */
function seedUserStores() {
  useProfileStore.setState({
    profile: { ...emptyProfile, displayName: 'Ana', username: 'ana' },
    status: 'ready',
  });
  useMissionaryRegisterStore.setState({
    step: 2,
    formData: { fullName: 'Ana', email: 'ana@example.com' },
    submission: { accountCreated: true },
  });
  useSupporterRegisterStore.setState({ step: 2, formData: { fullName: 'Bia' } });
}

function expectUserStoresCleared() {
  expect(useProfileStore.getState()).toMatchObject({ profile: emptyProfile, status: 'idle' });
  expect(useMissionaryRegisterStore.getState()).toMatchObject({
    step: 1,
    formData: {},
    submission: {},
  });
  expect(useSupporterRegisterStore.getState()).toMatchObject({ step: 1, formData: {} });
  expect(window.sessionStorage.getItem(PROFILE_STORAGE_KEY)).toBeNull();
  expect(window.sessionStorage.getItem(MISSIONARY_REGISTER_KEY)).toBeNull();
  expect(window.sessionStorage.getItem(SUPPORTER_REGISTER_KEY)).toBeNull();
}

describe('sessionStore', () => {
  let fetchSpy: MockInstance<typeof fetch>;

  beforeEach(() => {
    fetchSpy = vi.spyOn(globalThis, 'fetch');
    useSessionStore.setState(useSessionStore.getInitialState(), true);
    clearUserStores();
    window.sessionStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    window.sessionStorage.clear();
  });

  it('starts with an unknown session', () => {
    expect(useSessionStore.getState()).toMatchObject({
      status: 'unknown',
      userId: null,
      role: null,
    });
  });

  describe('loadSession', () => {
    it('marks the session authenticated with user id and role', async () => {
      fetchSpy.mockResolvedValue(
        jsonResponse({ data: { authenticated: true, userId: 'user-1', role: 'MISSIONARY' } })
      );

      await expect(useSessionStore.getState().loadSession()).resolves.toBe('authenticated');

      expect(fetchSpy.mock.calls[0][0]).toBe('/api/auth/session');
      expect(useSessionStore.getState()).toMatchObject({
        status: 'authenticated',
        userId: 'user-1',
        role: 'MISSIONARY',
      });
    });

    it('marks the session anonymous on 401', async () => {
      useSessionStore.setState({ status: 'authenticated', userId: 'user-1', role: 'SUPPORTER' });
      fetchSpy.mockResolvedValue(jsonResponse({ message: 'Não autenticado' }, 401));

      await expect(useSessionStore.getState().loadSession()).resolves.toBe('anonymous');
      expect(useSessionStore.getState()).toMatchObject({
        status: 'anonymous',
        userId: null,
        role: null,
      });
    });

    it.each([
      ['a server error', () => Promise.resolve(jsonResponse({}, 500))],
      ['a network failure', () => Promise.reject(new TypeError('Failed to fetch'))],
    ])('stays unknown (never throws) on %s', async (_label, respond) => {
      useSessionStore.setState({ status: 'authenticated' });
      fetchSpy.mockImplementation(respond);

      await expect(useSessionStore.getState().loadSession()).resolves.toBe('unknown');
      expect(useSessionStore.getState().status).toBe('unknown');
    });
  });

  describe('logout', () => {
    it('POSTs to the BFF, clears every user store and becomes anonymous', async () => {
      useSessionStore.setState({ status: 'authenticated', userId: 'user-1', role: 'MISSIONARY' });
      seedUserStores();
      fetchSpy.mockResolvedValue(jsonResponse({ message: 'ok' }));

      await useSessionStore.getState().logout();

      const [path, init] = fetchSpy.mock.calls[0];
      expect(path).toBe('/api/auth/logout');
      expect(init?.method).toBe('POST');
      expectUserStoresCleared();
      expect(useSessionStore.getState()).toMatchObject({
        status: 'anonymous',
        userId: null,
        role: null,
      });
    });

    it('keeps the session state when the BFF call fails (cookies are still set), then rethrows', async () => {
      useSessionStore.setState({ status: 'authenticated', userId: 'user-1', role: 'MISSIONARY' });
      fetchSpy.mockResolvedValue(jsonResponse({}, 500));

      await expect(useSessionStore.getState().logout()).rejects.toBeInstanceOf(ApiError);

      expect(useSessionStore.getState().status).toBe('authenticated');
    });

    it('rethrows a network failure without pretending to be logged out', async () => {
      useSessionStore.setState({ status: 'authenticated', userId: 'user-1', role: 'MISSIONARY' });
      fetchSpy.mockRejectedValue(new TypeError('Failed to fetch'));

      await expect(useSessionStore.getState().logout()).rejects.toMatchObject({ status: 0 });
      expect(useSessionStore.getState().status).toBe('authenticated');
    });
  });

  describe('expire', () => {
    it('clears every user store locally without calling the BFF', () => {
      useSessionStore.setState({ status: 'authenticated', userId: 'user-1', role: 'SUPPORTER' });
      seedUserStores();

      useSessionStore.getState().expire();

      expect(fetchSpy).not.toHaveBeenCalled();
      expectUserStoresCleared();
      expect(useSessionStore.getState()).toMatchObject({
        status: 'anonymous',
        userId: null,
        role: null,
      });
    });
  });

  describe('clearUserStores', () => {
    it('resets profile and both register drafts', () => {
      seedUserStores();
      expect(window.sessionStorage.getItem(PROFILE_STORAGE_KEY)).not.toBeNull();

      clearUserStores();

      expectUserStoresCleared();
    });
  });
});
