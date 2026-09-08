'use client';

import type { ReactNode } from 'react';
import { ThemeProvider } from 'next-themes';
import { AppThemeProvider } from '@/theme/AppThemeProvider';
import ThemeColorMeta from '@/components/ThemeColorMeta';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <AppThemeProvider>
        <ThemeColorMeta />
        {children}
      </AppThemeProvider>
    </ThemeProvider>
  );
}
