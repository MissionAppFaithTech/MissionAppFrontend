'use client';

import { useMemo, type ReactNode } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { useTheme } from 'next-themes';
import useHasMounted from '@/lib/useHasMounted';
import { createAppTheme } from './theme';

export function AppThemeProvider({ children }: { children: ReactNode }) {
  const { resolvedTheme } = useTheme();
  const mounted = useHasMounted();
  const mode = mounted && resolvedTheme === 'dark' ? 'dark' : 'light';

  const theme = useMemo(() => createAppTheme(mode), [mode]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
}
