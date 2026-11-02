'use client';

import type { ReactNode } from 'react';
import { ThemeProvider } from 'next-themes';
import { AppThemeProvider } from '@/theme/AppThemeProvider';
import ThemeColorMeta from '@/components/ThemeColorMeta';
import { SessionWatcher } from '@/components/auth/SessionWatcher';
import FeedbackToast from '@/components/common/FeedbackToast';
import { A11yPreferencesSync } from '@/components/a11y/AccessibilityPreferences';

export function Providers({ children }: { children: ReactNode }) {
  // No `enableSystem`: only the explicit toggle changes the theme, so a dark
  // operating system never opens the app in dark mode.
  return (
    <ThemeProvider attribute="class" defaultTheme="light">
      <AppThemeProvider>
        <ThemeColorMeta />
        <SessionWatcher />
        <A11yPreferencesSync />
        {children}
        <FeedbackToast />
      </AppThemeProvider>
    </ThemeProvider>
  );
}
