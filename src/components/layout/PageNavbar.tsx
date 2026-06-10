'use client';

import type { ReactNode } from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Toolbar from '@mui/material/Toolbar';
import { brandColors, brandGradient } from '@/theme/theme';

type PageNavbarProps = {
  children: ReactNode;
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | false;
};

export default function PageNavbar({ children, maxWidth = 'lg' }: PageNavbarProps) {
  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        background: (theme) =>
          theme.palette.mode === 'light' ? brandColors.missionary : brandColors.missionaryDark,
        color: brandColors.white,
        borderBottom: '1px solid',
        borderColor: 'divider',
      }}
    >
      <Container maxWidth={maxWidth}>
        <Toolbar disableGutters sx={{ gap: 2, py: 1 }}>
          {children}
        </Toolbar>
      </Container>
    </AppBar>
  );
}

export function PageNavbarActions({ children }: { children: ReactNode }) {
  return <Box sx={{ ml: 'auto', display: 'flex', alignItems: 'center', gap: 1 }}>{children}</Box>;
}
