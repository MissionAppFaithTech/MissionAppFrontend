import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import {
  A11Y_PRE_PAINT_SCRIPT,
  A11Y_STORAGE_KEY,
  DEFAULT_A11Y_PREFERENCES,
  a11yDataAttributes,
  useA11yPreferencesStore,
} from './a11yPreferencesStore';

const root = document.documentElement;

function clearAttributes() {
  for (const name of Object.keys(a11yDataAttributes(DEFAULT_A11Y_PREFERENCES))) {
    root.removeAttribute(name);
  }
}

describe('a11yPreferencesStore', () => {
  beforeEach(() => {
    localStorage.clear();
    clearAttributes();
    useA11yPreferencesStore.setState({ ...DEFAULT_A11Y_PREFERENCES });
  });

  afterEach(clearAttributes);

  it('applies a preference to <html> immediately and persists it in localStorage', () => {
    useA11yPreferencesStore.getState().setPreference('fontScale', 130);
    useA11yPreferencesStore.getState().setPreference('highContrast', true);

    expect(root.getAttribute('data-a11y-font-scale')).toBe('130');
    expect(root.getAttribute('data-a11y-contrast')).toBe('high');
    const stored = JSON.parse(localStorage.getItem(A11Y_STORAGE_KEY) ?? '{}');
    expect(stored.state).toEqual({
      ...DEFAULT_A11Y_PREFERENCES,
      fontScale: 130,
      highContrast: true,
    });
  });

  it('starts with every preference off and the default text size', () => {
    expect(DEFAULT_A11Y_PREFERENCES).toEqual({
      fontScale: 100,
      highContrast: false,
      reduceMotion: false,
      readableFont: false,
      textSpacing: false,
      underlineLinks: false,
    });
    expect(a11yDataAttributes(DEFAULT_A11Y_PREFERENCES)['data-a11y-contrast']).toBe('normal');
    expect(A11Y_STORAGE_KEY).toBe('missionapp_a11y_preferences_v1');
  });

  it('reset restores the defaults on the store and the document', () => {
    const { setPreference, reset } = useA11yPreferencesStore.getState();
    setPreference('reduceMotion', true);
    setPreference('underlineLinks', true);

    reset();

    expect(useA11yPreferencesStore.getState().reduceMotion).toBe(false);
    expect(root.getAttribute('data-a11y-reduce-motion')).toBe('false');
    expect(root.getAttribute('data-a11y-underline-links')).toBe('false');
    expect(root.getAttribute('data-a11y-contrast')).toBe('normal');
  });

  it('rehydrates saved preferences and ignores an invalid font scale', async () => {
    localStorage.setItem(
      A11Y_STORAGE_KEY,
      JSON.stringify({ state: { fontScale: 999, readableFont: true }, version: 1 })
    );

    await useA11yPreferencesStore.persist.rehydrate();

    const state = useA11yPreferencesStore.getState();
    expect(state.fontScale).toBe(100);
    expect(state.readableFont).toBe(true);
    expect(root.getAttribute('data-a11y-readable-font')).toBe('true');
  });

  it('pre-paint script applies saved preferences without the store', () => {
    localStorage.setItem(
      A11Y_STORAGE_KEY,
      JSON.stringify({ state: { fontScale: 115, textSpacing: true }, version: 1 })
    );

    new Function(A11Y_PRE_PAINT_SCRIPT)();

    expect(root.getAttribute('data-a11y-font-scale')).toBe('115');
    expect(root.getAttribute('data-a11y-text-spacing')).toBe('true');
    expect(root.getAttribute('data-a11y-contrast')).toBe('normal');
  });

  it('pre-paint script reads the same storage key as the store', () => {
    expect(A11Y_PRE_PAINT_SCRIPT).toContain(`'${A11Y_STORAGE_KEY}'`);
  });

  it('pre-paint script survives corrupted storage', () => {
    localStorage.setItem(A11Y_STORAGE_KEY, '{not json');
    expect(() => new Function(A11Y_PRE_PAINT_SCRIPT)()).not.toThrow();
  });
});
