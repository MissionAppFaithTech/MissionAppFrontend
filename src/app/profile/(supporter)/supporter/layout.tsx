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
import { mockSupporterProfile } from '@/mocks/profile';

export default function SupporterProfileLayout({ children }: { children: ReactNode }) {
  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <PageNavbar maxWidth="lg">
        <Logo size="lg" href="/profile/supporter" variant="dark" />

        <Box sx={{ flex: 1, minWidth: 0, display: 'flex', justifyContent: 'center' }}>
          <ProfileSearchField
            placeholder="Buscar missionários, projetos, campanhas..."
            maxWidth={{ xs: 150, sm: 240, md: 320 }}
          />
        </Box>

        <PageNavbarActions>
          <ProfileAccountMenu profile={mockSupporterProfile} />
        </PageNavbarActions>
      </PageNavbar>

      <Container
        component="main"
        id="main-content"
        tabIndex={-1}
        maxWidth="lg"
        sx={{ px: { xs: 2, sm: 3 }, py: { xs: 2, sm: 4, md: 6 }, outline: 'none' }}
      >
        <Stack spacing={2}>
          <ProfileSummaryCard profile={mockSupporterProfile} />
          <ProfileNavigation role="supporter" />
          {children}
        </Stack>
      </Container>
    </Box>
  );
}
