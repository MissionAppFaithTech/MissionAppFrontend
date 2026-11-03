import type { Metadata } from 'next';
import { Suspense } from 'react';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Skeleton from '@mui/material/Skeleton';
import InputAdornment from '@mui/material/InputAdornment';
import SearchIcon from '@mui/icons-material/Search';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Logo from '@/components/common/Logo';
import PageNavbar, { PageNavbarActions } from '@/components/layout/PageNavbar';
import ProfileAccountMenu from '@/components/profile/ProfileAccountMenu';
import { mockProfile, mockFollowedMissionaries, mockSupporterProfile } from '@/mocks/profile';
import { MissionaryProfileBody } from './MissionaryProfileContent';

type PageProps = {
  params: Promise<{ username: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { username } = await params;
  const missionary = mockFollowedMissionaries.find(
    (m) => m.username.toLowerCase() === username.toLowerCase()
  );
  const displayName =
    missionary?.displayName ||
    (username.toLowerCase() === mockProfile.username.toLowerCase()
      ? mockProfile.displayName
      : username.replace(/-/g, ' '));

  return {
    title: `${displayName} | Mission App`,
    description: `Perfil missionário de ${displayName} visualizado por apoiador.`,
  };
}

function MissionaryProfileFallback() {
  return (
    <Stack spacing={2} role="status" aria-busy="true" aria-label="Carregando perfil do missionário">
      <Skeleton variant="rounded" sx={{ height: { xs: 160, md: 200 } }} />
      <Skeleton variant="rounded" sx={{ height: { xs: 240, md: 320 } }} />
    </Stack>
  );
}

export default function SupporterMissionaryPage({ params }: PageProps) {
  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* TopBar Autenticado do Apoiador */}
      <PageNavbar maxWidth="lg">
        <Logo size="lg" variant="dark" />

        <Box sx={{ flex: 1, minWidth: 0, display: 'flex', justifyContent: 'center' }}>
          <TextField
            placeholder="Buscar missionários, projetos, campanhas..."
            size="small"
            aria-label="Buscar missionários, projetos, campanhas"
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ fontSize: 18, color: 'primary.main' }} />
                  </InputAdornment>
                ),
              },
              htmlInput: { readOnly: true },
            }}
            sx={{
              width: '100%',
              maxWidth: 320,
              '& .MuiOutlinedInput-root': {
                height: { xs: 34, sm: 36 },
                bgcolor: 'background.paper',
                borderRadius: 2,
                fontSize: { xs: '0.7rem', sm: '0.8rem' },
                px: { xs: 0.5, sm: 1 },
              },
              '& .MuiInputAdornment-root': { mr: { xs: 0.25, sm: 1 } },
            }}
          />
        </Box>

        <PageNavbarActions>
          <ProfileAccountMenu profile={mockSupporterProfile} />
        </PageNavbarActions>
      </PageNavbar>

      {/* Conteúdo do Perfil do Missionário */}
      <Container
        component="main"
        id="main-content"
        tabIndex={-1}
        maxWidth="lg"
        sx={{ px: { xs: 2, sm: 3 }, py: { xs: 2, sm: 4, md: 6 }, outline: 'none' }}
      >
        <Stack spacing={2}>
          <Suspense fallback={<MissionaryProfileFallback />}>
            <MissionaryProfileBody params={params} />
          </Suspense>
        </Stack>
      </Container>
    </Box>
  );
}
