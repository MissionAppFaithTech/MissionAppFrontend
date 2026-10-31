'use client';

import type { ReactNode } from 'react';
import Box from '@mui/material/Box';
import CardContent from '@mui/material/CardContent';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Link from 'next/link';
import AuthCard from '@/components/common/AuthCard';
import Logo from '@/components/common/Logo';
import ThemeToggle from '@/components/ThemeToggle';
import VisitorBottomNav from '@/components/layout/VisitorBottomNav';
import AccessibilityPreferencesButton from '@/components/a11y/AccessibilityPreferences';

const footerLinkSx = {
  color: 'mission.main',
  fontWeight: 700,
  textDecoration: 'none',
  minHeight: 44,
  display: 'inline-flex',
  alignItems: 'center',
  px: 0.75,
  borderRadius: 1,
  transition: 'color 0.2s ease, background-color 0.2s ease',
  '&:hover': {
    color: 'mission.dark',
    backgroundColor: 'action.hover',
    textDecoration: 'none',
  },
} as const;

type AuthLayoutProps = {
  children: ReactNode;
  /** Title inside the main white card (login / select-role pattern). */
  title?: ReactNode;
  /** Action next to the title (e.g. Trocar perfil). */
  titleAction?: ReactNode;
  logoSize?: 'md' | 'lg';
  /** Content between the logo and the main card (stepper, role label, back). */
  header?: ReactNode;
  footerPrompt?: string;
  footerActionLabel?: string;
  footerActionHref?: string;
  /** Quiet link under the footer card (e.g. back to home). */
  subFooter?: ReactNode;
  className?: string;
};

/**
 * Shared auth page chrome: logo, white card, optional footer card, bottom nav.
 */
export default function AuthLayout({
  children,
  title,
  titleAction,
  logoSize = 'lg',
  header,
  footerPrompt,
  footerActionLabel,
  footerActionHref,
  subFooter,
  className,
}: AuthLayoutProps) {
  return (
    <Box
      component="main"
      id="main-content"
      tabIndex={-1}
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        px: { xs: 2, sm: 3 },
        pt: { xs: 4, sm: 6 },
        pb: { xs: 'calc(env(safe-area-inset-bottom, 0px) + 76px)', sm: 6 },
        position: 'relative',
        outline: 'none',
        bgcolor: 'background.default',
      }}
    >
      <Box sx={{ position: 'absolute', top: 16, right: 16, display: 'flex', gap: 0.5 }}>
        <AccessibilityPreferencesButton />
        <ThemeToggle />
      </Box>

      <Box
        sx={{
          width: '100%',
          maxWidth: 440,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'center' }}>
          <Logo size={logoSize} />
        </Box>

        {header}

        <Stack direction="column" spacing={2.5} sx={{ width: '100%', alignItems: 'stretch' }}>
          <AuthCard className={className}>
            <CardContent sx={{ p: { xs: 3, sm: 3.5 }, '&:last-child': { pb: { xs: 3, sm: 3.5 } } }}>
              {title ? (
                <Stack
                  direction="row"
                  spacing={1}
                  sx={{
                    mb: 2.5,
                    alignItems: 'center',
                    justifyContent: titleAction ? 'space-between' : 'center',
                    flexWrap: 'wrap',
                    rowGap: 0.5,
                  }}
                >
                  <Typography
                    component="h1"
                    variant="h6"
                    sx={{
                      fontWeight: 700,
                      color: 'text.primary',
                      textAlign: titleAction ? 'left' : 'center',
                      flex: titleAction ? 1 : undefined,
                      minWidth: 0,
                      wordBreak: 'break-word',
                    }}
                  >
                    {title}
                  </Typography>
                  {titleAction}
                </Stack>
              ) : null}
              {children}
            </CardContent>
          </AuthCard>

          {footerPrompt && footerActionLabel && footerActionHref ? (
            <AuthCard muted>
              <CardContent sx={{ py: 2, px: 3, '&:last-child': { pb: 2 } }}>
                <Stack
                  direction="row"
                  spacing={1}
                  sx={{ alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap' }}
                >
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    {footerPrompt}
                  </Typography>
                  <Typography
                    component={Link}
                    href={footerActionHref}
                    variant="body2"
                    sx={footerLinkSx}
                  >
                    {footerActionLabel}
                  </Typography>
                </Stack>
              </CardContent>
            </AuthCard>
          ) : null}

          {subFooter}
        </Stack>
      </Box>

      <VisitorBottomNav />
    </Box>
  );
}
