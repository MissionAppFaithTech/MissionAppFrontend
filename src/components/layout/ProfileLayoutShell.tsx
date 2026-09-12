'use client';

import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import Logo from '@/components/common/Logo';
import PillButton from '@/components/common/PillButton';
import PageNavbar, { PageNavbarActions } from '@/components/layout/PageNavbar';
import ProfileAccountMenu from '@/components/profile/ProfileAccountMenu';
import ProfileNavigation from '@/components/profile/ProfileNavigation';
import ProfileSearchField from '@/components/profile/ProfileSearchField';
import ProfileSummaryCard from '@/components/profile/ProfileSummaryCard';
import MobileNavigationBar from '@/components/layout/MobileNavigationBar';
import type { ProfileData } from '@/types/profile';

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

  // Detect any edit or settings page that must be free of bottom nav bar and summary card
  const isFreePage =
    Boolean(pathname?.includes('/edit')) ||
    Boolean(pathname?.endsWith('/edit-profile')) ||
    Boolean(pathname?.includes('/financeiro')) ||
    Boolean(pathname?.includes('/configuracoes'));

  // Calculate back button destination for free pages
  const backHref =
    pathname === '/profile/projetos-de-impacto/edit'
      ? '/profile/projetos-de-impacto'
      : pathname?.includes('/financeiro')
        ? '/profile/sobre'
        : role === 'supporter'
          ? '/profile/supporter'
          : '/profile/sobre';

  // Calculate human-friendly page title
  const pageTitle =
    pathname === '/profile/projetos-de-impacto/edit'
      ? 'Editar Projeto de Impacto'
      : pathname === '/profile/sobre/edit'
        ? 'Editar Sobre'
        : pathname?.includes('/financeiro')
          ? 'Configurações Financeiras'
          : pathname?.includes('/configuracoes')
            ? 'Configurações de Conta'
            : role === 'supporter'
              ? 'Editar Perfil de Apoiador'
              : 'Editar Perfil';

  if (isFreePage) {
    return (
      <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
        {/* On edit/settings pages: top bar is strictly minimal with only the Back button and title */}
        <PageNavbar maxWidth="lg">
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              width: '100%',
              gap: { xs: 1.5, sm: 2 },
            }}
          >
            <PillButton
              href={backHref}
              tone="ghost"
              size="small"
              startIcon={<ArrowBackIcon />}
              sx={{
                fontWeight: 600,
                px: { xs: 1.5, sm: 2 },
                py: { xs: 0.5, sm: 0.6 },
                fontSize: { xs: '0.8125rem', sm: '0.875rem' },
                borderRadius: '14px',
                border: '1px solid rgba(255, 255, 255, 0.35)',
                bgcolor: 'rgba(255, 255, 255, 0.12)',
                color: 'common.white',
                minHeight: { xs: 36, sm: 40 },
                '&:hover': {
                  bgcolor: 'common.white',
                  color: 'common.black',
                  borderColor: 'common.white',
                },
              }}
            >
              Voltar
            </PillButton>

            <Typography
              variant="h6"
              component="div"
              sx={{
                fontWeight: 700,
                fontSize: { xs: '1rem', sm: '1.25rem' },
                color: 'common.white',
                lineHeight: 1.2,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {pageTitle}
            </Typography>
          </Box>
        </PageNavbar>

        {/* Free, unhindered container for edit form without ProfileSummaryCard or Bottom Nav Bar */}
        <Container
          component="main"
          id="main-content"
          tabIndex={-1}
          maxWidth="lg"
          sx={{
            px: { xs: 2, sm: 3 },
            pt: { xs: 2, sm: 3, md: 4 },
            pb: { xs: 3, sm: 4, md: 6 },
            outline: 'none',
          }}
        >
          {children}
        </Container>
      </Box>
    );
  }

  // Standard non-edit profile layout
  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <PageNavbar maxWidth="lg">
        <Logo
          size="lg"
          href={role === 'supporter' ? '/profile/supporter' : '/profile'}
          variant="dark"
        />

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
          <ProfileAccountMenu profile={profile} />
        </PageNavbarActions>
      </PageNavbar>

      <Container
        component="main"
        id="main-content"
        tabIndex={-1}
        maxWidth="lg"
        sx={{
          px: { xs: 2, sm: 3 },
          pt: { xs: 2, sm: 4, md: 6 },
          pb: { xs: 10, sm: 4, md: 6 },
          outline: 'none',
        }}
      >
        <Stack spacing={2}>
          <ProfileSummaryCard profile={profile} />
          <ProfileNavigation role={role} />
          {children}
        </Stack>
      </Container>

      <MobileNavigationBar isAuthenticated={true} role={role} />
    </Box>
  );
}
