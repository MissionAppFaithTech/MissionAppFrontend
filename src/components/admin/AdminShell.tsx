'use client';

import type { ReactNode } from 'react';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Logo from '@/components/common/Logo';
import RoleGate from '@/components/common/RoleGate';
import PageNavbar, { PageNavbarActions } from '@/components/layout/PageNavbar';
import ProfileSearchField from '@/components/profile/ProfileSearchField';
import ProfileAccountMenu from '@/components/profile/ProfileAccountMenu';
import AdminRegistrationsProvider from './AdminRegistrationsProvider';

export default function AdminShell({ children }: { children: ReactNode }) {
  return (
    <>
      <PageNavbar maxWidth="lg">
        <Logo size="sm" variant="dark" />
        <Box
          sx={{
            display: { xs: 'none', md: 'flex' },
            flex: 1,
            justifyContent: 'center',
            minWidth: 0,
          }}
        >
          <ProfileSearchField
            placeholder="Buscar missionários, projetos, campanhas..."
            maxWidth={360}
          />
        </Box>
        <PageNavbarActions>
          <ProfileAccountMenu
            role="admin"
            profile={{ username: 'admin', displayName: 'Administrador' }}
          />
        </PageNavbarActions>
      </PageNavbar>
      <Container
        component="main"
        id="main-content"
        tabIndex={-1}
        maxWidth="lg"
        sx={{ py: { xs: 3, md: 4 }, px: { xs: 2, sm: 3 }, minHeight: 'calc(100vh - 72px)' }}
      >
        <RoleGate>
          <AdminRegistrationsProvider>{children}</AdminRegistrationsProvider>
        </RoleGate>
      </Container>
    </>
  );
}
