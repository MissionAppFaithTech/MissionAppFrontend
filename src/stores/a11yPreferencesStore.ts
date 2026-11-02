import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export const A11Y_STORAGE_KEY = 'missionapp_a11y_preferences_v1';

export const FONT_SCALES = [100, 115, 130] as const;
export type FontScale = (typeof FONT_SCALES)[number];

/** Reading and interaction preferences (not personal data): kept in localStorage. */
export type A11yPreferences = {
  /** Root font size in %, scales every rem-based size (WCAG 1.4.4). */
  fontScale: FontScale;
  /** Stronger text and border contrast. */
  highContrast: boolean;
  /** Turns animations off even when the OS does not ask for it (WCAG 2.3.3). */
  reduceMotion: boolean;
  /** Atkinson Hyperlegible, designed for low vision and dyslexia. */
  readableFont: boolean;
  /** WCAG 1.4.12 text spacing: line, letter, word and paragraph spacing. */
  textSpacing: boolean;
  /** Underline every link so it does not depend on color (WCAG 1.4.1). */
  underlineLinks: boolean;
};

export const DEFAULT_A11Y_PREFERENCES: A11yPreferences = {
  fontScale: 100,
  highContrast: false,
  reduceMotion: false,
  readableFont: false,
  textSpacing: false,
  underlineLinks: false,
};

export interface A11yPreferencesState extends A11yPreferences {
  setPreference: <K extends keyof A11yPreferences>(key: K, value: A11yPreferences[K]) => void;
  reset: () => void;
}

/** `<html>` data attributes read by globals.css; also written by the pre-paint script. */
export function a11yDataAttributes(prefs: A11yPreferences): Record<string, string> {
  return {
    'data-a11y-font-scale': String(prefs.fontScale),
    'data-a11y-contrast': prefs.highContrast ? 'high' : 'normal',
    'data-a11y-reduce-motion': String(prefs.reduceMotion),
    'data-a11y-readable-font': String(prefs.readableFont),
    'data-a11y-text-spacing': String(prefs.textSpacing),
    'data-a11y-underline-links': String(prefs.underlineLinks),
  };
}

export function applyA11yPreferences(prefs: A11yPreferences, root = document.documentElement) {
  for (const [name, value] of Object.entries(a11yDataAttributes(prefs))) {
    root.setAttribute(name, value);
  }
}

function pickPreferences(state: A11yPreferences): A11yPreferences {
  const { fontScale, highContrast, reduceMotion, readableFont, textSpacing, underlineLinks } =
    state;
  return { fontScale, highContrast, reduceMotion, readableFont, textSpacing, underlineLinks };
}

const localStorageSafe = createJSONStorage<A11yPreferences>(() =>
  typeof window === 'undefined'
    ? { getItem: () => null, setItem: () => {}, removeItem: () => {} }
    : window.localStorage
);

export const useA11yPreferencesStore = create<A11yPreferencesState>()(
  persist<A11yPreferencesState, [], [], A11yPreferences>(
    (set, get) => ({
      ...DEFAULT_A11Y_PREFERENCES,

      setPreference: (key, value) => {
        set({ [key]: value } as Partial<A11yPreferences>);
        if (typeof document !== 'undefined') applyA11yPreferences(pickPreferences(get()));
      },

      reset: () => {
        set(DEFAULT_A11Y_PREFERENCES);
        if (typeof document !== 'undefined') applyA11yPreferences(DEFAULT_A11Y_PREFERENCES);
      },
    }),
    {
      name: A11Y_STORAGE_KEY,
      version: 1,
      storage: localStorageSafe,
      skipHydration: true,
      partialize: (state) => pickPreferences(state),
      merge: (persisted, current) => {
        const stored = (persisted ?? {}) as Partial<A11yPreferences>;
        const fontScale = FONT_SCALES.includes(stored.fontScale as FontScale)
          ? (stored.fontScale as FontScale)
          : current.fontScale;
        return {
          ...current,
          ...pickPreferences({ ...DEFAULT_A11Y_PREFERENCES, ...stored, fontScale }),
        };
      },
      onRehydrateStorage: () => (state) => {
        if (state && typeof document !== 'undefined') applyA11yPreferences(pickPreferences(state));
      },
    }
  )
);

/**
 * Inline script for `<head>`: applies the saved preferences before first paint so
 * larger text or reduced motion never flashes in after hydration.
 * Fully static (the storage key is a literal, kept in sync with A11Y_STORAGE_KEY by tests):
 * nothing is interpolated into executable code.
 */
export const A11Y_PRE_PAINT_SCRIPT = `(function(){try{var p=JSON.parse(localStorage.getItem('missionapp_a11y_preferences_v1')||'{}').state||{};var r=document.documentElement;var s=[100,115,130].indexOf(p.fontScale)>-1?p.fontScale:100;r.setAttribute('data-a11y-font-scale',String(s));r.setAttribute('data-a11y-contrast',p.highContrast?'high':'normal');r.setAttribute('data-a11y-reduce-motion',String(!!p.reduceMotion));r.setAttribute('data-a11y-readable-font',String(!!p.readableFont));r.setAttribute('data-a11y-text-spacing',String(!!p.textSpacing));r.setAttribute('data-a11y-underline-links',String(!!p.underlineLinks));}catch(e){}})();`;
