import type { Metadata } from 'next';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import InputAdornment from '@mui/material/InputAdornment';
import SearchIcon from '@mui/icons-material/Search';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Logo from '@/components/common/Logo';
import PageNavbar, { PageNavbarActions } from '@/components/layout/PageNavbar';
import ProfileAccountMenu from '@/components/profile/ProfileAccountMenu';
import SupporterMissionaryProfileView from '@/components/profile/SupporterMissionaryProfileView';
import {
  mockProfile,
  mockFollowedMissionaries,
  mockSavedPosts,
  mockSupporterProfile,
} from '@/mocks/profile';
import type { ProfileData } from '@/types/profile';

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

export default async function SupporterMissionaryPage({ params }: PageProps) {
  const { username } = await params;

  const isMockSamuel =
    username.toLowerCase() === mockProfile.username.toLowerCase() ||
    username.toLowerCase() === 'samuel-mendonca' ||
    username.toLowerCase() === 'samuel';

  const followed = mockFollowedMissionaries.find(
    (m) => m.username.toLowerCase() === username.toLowerCase()
  );

  const profile: ProfileData = isMockSamuel
    ? mockProfile
    : followed
      ? {
          ...mockProfile,
          username: followed.username,
          displayName: followed.displayName,
          location: followed.location,
          supportersCount: followed.supportersCount,
          about: {
            ...mockProfile.about,
            introduction: `Perfil missionário de ${followed.displayName} no Mission App. Atuando com dedicação no campo em ${followed.location}.`,
            currentLocation: followed.location,
          },
        }
      : {
          ...mockProfile,
          username,
          displayName: username.replace(/-/g, ' '),
          about: {
            ...mockProfile.about,
            introduction: `Perfil missionário de ${username.replace(/-/g, ' ')} no Mission App.`,
          },
        };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* TopBar Autenticado do Apoiador */}
      <PageNavbar maxWidth="lg">
        <Logo size="lg" href="/profile/supporter" variant="dark" />

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
      <Container maxWidth="lg" sx={{ px: { xs: 2, sm: 3 }, py: { xs: 2, sm: 4, md: 6 } }}>
        <Stack spacing={2}>
          <SupporterMissionaryProfileView profile={profile} posts={mockSavedPosts} />
        </Stack>
      </Container>
    </Box>
  );
}
