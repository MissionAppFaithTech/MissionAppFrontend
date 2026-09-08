'use client';

import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { ThemeProvider, useColorScheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { useTheme } from 'next-themes';
import { createAppTheme } from './theme';

/**
 * Mirrors next-themes' resolved theme into MUI's color scheme.
 *
 * next-themes owns the `.dark` class on <html>, which is what drives the CSS
 * variables. But a lot of components read `theme.palette.mode` at render time,
 * and under CSS variables that value comes from MUI's own state — which would
 * otherwise sit at `defaultMode` forever and freeze every one of those styles
 * in light mode. Syncing the two keeps both mechanisms telling the same story.
 */
function ColorSchemeBridge() {
  const { resolvedTheme } = useTheme();
  const { mode, setMode } = useColorScheme();

  useEffect(() => {
    if (!resolvedTheme) return;
    const next = resolvedTheme === 'dark' ? 'dark' : 'light';
    if (mode !== next) setMode(next);
  }, [resolvedTheme, mode, setMode]);

  return null;
}

/**
 * next-themes writes the `.dark` class in a blocking script before React hydrates,
 * so the DOM already knows the scheme on the first client render. Seeding MUI from
 * it avoids a frame of light-mode styling in every component that reads
 * `palette.mode` while the sync effect catches up.
 */
function readInitialMode(): 'light' | 'dark' {
  if (typeof document === 'undefined') return 'light';
  return document.documentElement.classList.contains('dark') ? 'dark' : 'light';
}

/**
 * The theme carries both color schemes as CSS variables, and next-themes puts the
 * `.dark` class on <html> before first paint — so colors that come from tokens are
 * correct on the very first frame, with no flash of the light theme.
 */
export function AppThemeProvider({ children }: { children: ReactNode }) {
  const theme = useMemo(() => createAppTheme(), []);
  const [initialMode] = useState(readInitialMode);

  return (
    <ThemeProvider
      theme={theme}
      // next-themes owns <html class> and its own storage. Without these, MUI's
      // CssVars provider would also write the class and a `mui-mode` key, and the
      // two would fight over the same attribute with independent state.
      defaultMode={initialMode}
      colorSchemeNode={null}
      storageManager={null}
      // Recalculates `theme.palette.*` when the mode changes, so components that
      // branch on `palette.mode` follow the active scheme.
      forceThemeRerender
    >
      <ColorSchemeBridge />
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
}
