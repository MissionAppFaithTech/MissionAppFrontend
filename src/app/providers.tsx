'use client';

import type { ReactNode } from 'react';
import { ThemeProvider } from 'next-themes';
import { AppThemeProvider } from '@/theme/AppThemeProvider';
import ThemeColorMeta from '@/components/ThemeColorMeta';

export function Providers({ children }: { children: ReactNode }) {
  // No `enableSystem`: only the explicit toggle changes the theme, so a dark
  // operating system never opens the app in dark mode.
  return (
    <ThemeProvider attribute="class" defaultTheme="light">
      <AppThemeProvider>
        <ThemeColorMeta />
        {children}
      </AppThemeProvider>
    </ThemeProvider>
  );
}
