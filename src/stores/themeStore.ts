import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export type ThemeMode = 'light' | 'dark';

export interface ThemeState {
  mode: ThemeMode;
  hasHydrated: boolean;
  setMode: (mode: ThemeMode) => void;
  toggleMode: () => void;
  setHasHydrated: (status: boolean) => void;
}

function getInitialThemeMode(): ThemeMode {
  if (typeof document !== 'undefined') {
    if (document.documentElement.classList.contains('dark')) return 'dark';
    try {
      const stored = window.localStorage.getItem('theme');
      if (stored === 'dark') return 'dark';
    } catch {
      // ignore
    }
  }
  return 'light';
}

function syncDocumentTheme(mode: ThemeMode) {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  if (mode === 'dark') {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }
  try {
    window.localStorage.setItem('theme', mode);
  } catch {
    // ignore
  }
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      mode: getInitialThemeMode(),
      hasHydrated: false,

      setMode: (mode: ThemeMode) => {
        set({ mode });
        syncDocumentTheme(mode);
      },

      toggleMode: () => {
        const next = get().mode === 'dark' ? 'light' : 'dark';
        set({ mode: next });
        syncDocumentTheme(next);
      },

      setHasHydrated: (status: boolean) => {
        set({ hasHydrated: status });
      },
    }),
    {
      name: 'missionapp_theme_mode_v1',
      storage: createJSONStorage(() => {
        if (typeof window !== 'undefined') {
          return window.localStorage;
        }
        return {
          getItem: () => null,
          setItem: () => {},
          removeItem: () => {},
        };
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
        if (typeof document !== 'undefined') {
          const isDomDark = document.documentElement.classList.contains('dark');
          if (isDomDark && state && state.mode !== 'dark') {
            state.setMode('dark');
          } else if (state?.mode) {
            syncDocumentTheme(state.mode);
          }
        }
      },
    }
  )
);
