'use client';

import type { ReactNode } from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Toolbar from '@mui/material/Toolbar';

export type PageNavbarVariant = 'default' | 'landing';

type PageNavbarProps = {
  children: ReactNode;
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | false;
  variant?: PageNavbarVariant;
  /** Landing only: show delimiter after the user scrolls */
  scrolled?: boolean;
};

/**
 * `palette.mode` is no longer readable at render time — one theme now serves both
 * schemes — so these branch through tokens instead of a JS ternary.
 */
const variantStyles = {
  default: {
    backgroundColor: 'brandFill.main',
    color: 'brandFill.contrastText',
  },
  landing: {
    color: 'text.primary',
    backgroundColor: 'transparent',
    boxShadow: 'none',
  },
} as const;

export default function PageNavbar({
  children,
  maxWidth = 'lg',
  variant = 'default',
  scrolled = false,
}: PageNavbarProps) {
  const isLanding = variant === 'landing';

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        top: 0,
        zIndex: (theme) => theme.zIndex.appBar,
        ...variantStyles[variant],
        borderBottom: isLanding ? (scrolled ? '1px solid' : 'none') : '1px solid',
        borderColor: 'divider',
        transition: 'border-color 0.2s ease, background-color 0.2s ease, backdrop-filter 0.2s ease',
        ...(isLanding &&
          scrolled && {
            // The scrolled scrim was a fixed light wash, which painted a white bar
            // across the top of the dark landing page.
            backgroundColor: 'var(--app-navbar-scrim)',
            backdropFilter: 'blur(8px)',
          }),
      }}
    >
      <Container
        maxWidth={isLanding ? false : maxWidth}
        sx={
          isLanding
            ? {
                px: { xs: 2, sm: 3, md: 3, lg: 4 },
                maxWidth: { md: 1280, lg: 1440, xl: 1600 },
                mx: 'auto',
              }
            : undefined
        }
      >
        <Toolbar
          disableGutters
          sx={{
            gap: { xs: 1, sm: 2 },
            py: 0.5,
            minHeight: { xs: 56, sm: 64 },
            px: { xs: 1, sm: 0 },
          }}
        >
          {children}
        </Toolbar>
      </Container>
    </AppBar>
  );
}

export function PageNavbarActions({ children }: { children: ReactNode }) {
  return <Box sx={{ ml: 'auto', display: 'flex', alignItems: 'center', gap: 1 }}>{children}</Box>;
}
