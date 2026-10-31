'use client';

import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Stack from '@mui/material/Stack';
import Logo from '@/components/common/Logo';
import PageNavbar, { PageNavbarActions } from '@/components/layout/PageNavbar';
import ProfileAccountMenu from '@/components/profile/ProfileAccountMenu';
import ProfileNavigation from '@/components/profile/ProfileNavigation';
import ProfileSearchField from '@/components/profile/ProfileSearchField';
import ProfileSummaryCard from '@/components/profile/ProfileSummaryCard';
import MobileNavigationBar from '@/components/layout/MobileNavigationBar';
import type { ProfileData } from '@/types/profile';
import AccessibilityPreferencesButton from '@/components/a11y/AccessibilityPreferences';

export interface ProfileLayoutShellProps {
  children: ReactNode;
  role?: 'missionary' | 'supporter';
  profile: ProfileData;
}

export default function ProfileLayoutShell({
  children,
  role = 'missionary',
  profile,
}: ProfileLayoutShellProps) {
  const pathname = usePathname();

  const isFreePage =
    Boolean(pathname?.includes('/edit')) ||
    Boolean(pathname?.endsWith('/edit-profile')) ||
    Boolean(pathname?.includes('/financeiro')) ||
    Boolean(pathname?.includes('/configuracoes'));

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <PageNavbar maxWidth="lg">
        <Logo size="lg" variant="dark" />

        <Box
          sx={{
            flex: 1,
            minWidth: 0,
            display: { xs: 'none', md: 'flex' },
            justifyContent: 'center',
          }}
        >
          <ProfileSearchField
            placeholder={
              role === 'supporter'
                ? 'Buscar missionários, projetos, campanhas...'
                : 'Pesquisar missionário'
            }
            maxWidth={
              role === 'supporter' ? { xs: 150, sm: 240, md: 320 } : { xs: 150, sm: 240, md: 280 }
            }
          />
        </Box>

        <PageNavbarActions>
          <AccessibilityPreferencesButton size="medium" />
          <ProfileAccountMenu profile={profile} role={role} />
        </PageNavbarActions>
      </PageNavbar>

      <Container
        component="main"
        id="main-content"
        tabIndex={-1}
        maxWidth="lg"
        sx={{
          px: { xs: 2, sm: 3 },
          pt: { xs: 2, sm: isFreePage ? 3 : 4, md: isFreePage ? 4 : 6 },
          pb: isFreePage ? { xs: 3, sm: 4, md: 6 } : { xs: 10, sm: 4, md: 6 },
          outline: 'none',
        }}
      >
        {isFreePage ? (
          children
        ) : (
          <Stack spacing={2}>
            <ProfileSummaryCard profile={profile} />
            <ProfileNavigation role={role} />
            {children}
          </Stack>
        )}
      </Container>

      {isFreePage ? null : <MobileNavigationBar isAuthenticated={true} role={role} />}
    </Box>
  );
}
