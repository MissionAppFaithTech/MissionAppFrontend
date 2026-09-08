'use client';

import { useMemo, type ReactNode } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { createAppTheme } from './theme';

/**
 * The theme carries both color schemes as CSS variables, and next-themes puts the
 * `.dark` class on <html> before first paint. So the scheme is chosen by CSS, not by
 * React state — no mount gate, and no flash of the light theme on load.
 */
export function AppThemeProvider({ children }: { children: ReactNode }) {
  const theme = useMemo(() => createAppTheme(), []);

  return (
    <ThemeProvider
      theme={theme}
      // next-themes owns <html class> and its own storage. Without these, MUI's
      // CssVars provider would also write the class and a `mui-mode` key, and the
      // two would fight over the same attribute with independent state.
      defaultMode="light"
      colorSchemeNode={null}
      storageManager={null}
    >
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
}
