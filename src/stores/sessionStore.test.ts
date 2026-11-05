import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { getQueryClient } from '@/lib/query/client';
import { useChurchChecklistStore } from './churchChecklistStore';
import { useFeedbackStore } from './feedbackStore';
import { useMissionaryRegisterStore } from './missionaryRegisterStore';
import { clearUserStores, purgeDrafts, purgeLegacyProfileCache } from './sessionStore';
import { useSupporterRegisterStore } from './supporterRegisterStore';

const MISSIONARY_REGISTER_KEY = 'missionapp_missionary_register_v1';
const SUPPORTER_REGISTER_KEY = 'missionapp_supporter_register_v1';
const LEGACY_LOCAL_KEY = 'missionapp_missionary_profile_v1';
const LEGACY_SESSION_KEY = 'missionapp_profile_v2';

function seedLegacyCache() {
  window.localStorage.setItem(LEGACY_LOCAL_KEY, '{"email":"ana@example.com"}');
  window.sessionStorage.setItem(LEGACY_SESSION_KEY, '{"profile":{"username":"ana"}}');
}

describe('purgeLegacyProfileCache', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    window.localStorage.clear();
    window.sessionStorage.clear();
  });

  it('removes both old profile caches and keeps other keys', () => {
    seedLegacyCache();
    window.localStorage.setItem('missionapp_theme', 'dark');

    purgeLegacyProfileCache();

    expect(window.localStorage.getItem(LEGACY_LOCAL_KEY)).toBeNull();
    expect(window.sessionStorage.getItem(LEGACY_SESSION_KEY)).toBeNull();
    expect(window.localStorage.getItem('missionapp_theme')).toBe('dark');
  });

  it('keeps going when a storage is blocked', () => {
    seedLegacyCache();
    const removeItem = Storage.prototype.removeItem;
    vi.spyOn(Storage.prototype, 'removeItem').mockImplementation(function (this: Storage, key) {
      if (this === window.localStorage) throw new DOMException('blocked', 'SecurityError');
      removeItem.call(this, key);
    });

    expect(() => purgeLegacyProfileCache()).not.toThrow();
    expect(window.sessionStorage.getItem(LEGACY_SESSION_KEY)).toBeNull();
  });
});

describe('clearUserStores', () => {
  beforeEach(() => {
    window.sessionStorage.clear();
  });

  afterEach(() => {
    window.localStorage.clear();
    window.sessionStorage.clear();
  });

  it('resets the wizards and drops Web Storage, the query cache and the old caches', () => {
    useMissionaryRegisterStore.setState({
      step: 2,
      formData: { fullName: 'Ana', email: 'ana@example.com' },
      submission: { pending: true },
    });
    useSupporterRegisterStore.setState({ step: 2, formData: { fullName: 'Bia' } });
    seedLegacyCache();
    getQueryClient().setQueryData(['active-sessions'], [{ id: 's-1' }]);

    clearUserStores();

    expect(getQueryClient().getQueryData(['active-sessions'])).toBeUndefined();

    expect(useMissionaryRegisterStore.getState()).toMatchObject({
      step: 1,
      formData: {},
      submission: {},
    });
    expect(useSupporterRegisterStore.getState()).toMatchObject({ step: 1, formData: {} });
    expect(window.sessionStorage.getItem(MISSIONARY_REGISTER_KEY)).toBeNull();
    expect(window.sessionStorage.getItem(SUPPORTER_REGISTER_KEY)).toBeNull();
    expect(window.localStorage.getItem(LEGACY_LOCAL_KEY)).toBeNull();
    expect(window.sessionStorage.getItem(LEGACY_SESSION_KEY)).toBeNull();
  });
});

describe('purgeDrafts', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    window.localStorage.clear();
    window.sessionStorage.clear();
  });

  it("removes the editors' drafts from both storages and keeps other keys", () => {
    window.localStorage.setItem('draft_missionary_new_post', '<p>Post da Ana</p>');
    window.localStorage.setItem('draft_other', 'x');
    window.sessionStorage.setItem('draft_session', 'y');
    window.localStorage.setItem('missionapp_theme', 'dark');

    purgeDrafts();

    expect(window.localStorage.getItem('draft_missionary_new_post')).toBeNull();
    expect(window.localStorage.getItem('draft_other')).toBeNull();
    expect(window.sessionStorage.getItem('draft_session')).toBeNull();
    expect(window.localStorage.getItem('missionapp_theme')).toBe('dark');
  });

  it('keeps going when a storage is blocked', () => {
    window.sessionStorage.setItem('draft_session', 'y');
    vi.spyOn(window, 'localStorage', 'get').mockImplementation(() => {
      throw new DOMException('blocked', 'SecurityError');
    });

    expect(() => purgeDrafts()).not.toThrow();
    expect(window.sessionStorage.getItem('draft_session')).toBeNull();
  });
});

describe('clearUserStores and the previous account', () => {
  afterEach(() => {
    window.localStorage.clear();
    window.sessionStorage.clear();
  });

  it("drops the previous account's draft, checklist progress and toast", () => {
    window.localStorage.setItem('draft_missionary_new_post', '<p>Post da Ana</p>');
    useChurchChecklistStore.setState({ completedPhases: ['fase-1'] });
    useFeedbackStore.getState().notify('E-mail alterado para ana@example.com');

    clearUserStores();

    expect(window.localStorage.getItem('draft_missionary_new_post')).toBeNull();
    expect(useChurchChecklistStore.getState().completedPhases).toEqual([]);
    expect(useFeedbackStore.getState().current).toBeNull();
  });
});
