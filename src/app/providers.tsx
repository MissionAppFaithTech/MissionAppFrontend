'use client';

import type { ReactNode } from 'react';
import { ThemeProvider } from 'next-themes';
import { AppThemeProvider } from '@/theme/AppThemeProvider';
import ThemeColorMeta from '@/components/ThemeColorMeta';
import { SessionWatcher } from '@/components/auth/SessionWatcher';
import { SessionProvider } from '@/components/auth/SessionProvider';
import type { SessionSnapshot } from '@/lib/auth/session';
import FeedbackToast from '@/components/common/FeedbackToast';
import { A11yPreferencesSync } from '@/components/a11y/AccessibilityPreferences';

export function Providers({
  children,
  session,
}: {
  children: ReactNode;
  session: Promise<SessionSnapshot>;
}) {
  // No `enableSystem`: only the explicit toggle changes the theme, so a dark
  // operating system never opens the app in dark mode.
  return (
    <SessionProvider session={session}>
      <ThemeProvider attribute="class" defaultTheme="light">
        <AppThemeProvider>
          <ThemeColorMeta />
          <SessionWatcher />
          <A11yPreferencesSync />
          {children}
          <FeedbackToast />
        </AppThemeProvider>
      </ThemeProvider>
    </SessionProvider>
  );
}
