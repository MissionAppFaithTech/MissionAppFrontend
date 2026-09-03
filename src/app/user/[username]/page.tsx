import type { Metadata } from 'next';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import VisitorBottomNav from '@/components/layout/VisitorBottomNav';
import VisitorNavbar from '@/components/layout/VisitorNavbar';
import VisitorProfileView from '@/components/profile/VisitorProfileView';
import { mockProfile } from '@/mocks/profile';
import type { ProfileData } from '@/types/profile';

type UserPageProps = {
  params: Promise<{ username: string }>;
};

/** Public profiles — refresh cached HTML periodically when data is wired. */
export const revalidate = 300;

export async function generateMetadata({ params }: UserPageProps): Promise<Metadata> {
  const { username } = await params;
  const displayName =
    username.toLowerCase() === mockProfile.username.toLowerCase()
      ? mockProfile.displayName
      : username.replace(/-/g, ' ');

  return {
    title: `${displayName} (@${username}) | Mission App`,
    description: `Perfil público de ${displayName} no Mission App. Conecte-se, acompanhe a missão e apoie no campo.`,
    alternates: { canonical: `/user/${username}` },
    openGraph: {
      title: `${displayName} (@${username}) | Mission App`,
      description: `Perfil público de ${displayName} no Mission App.`,
      url: `/user/${username}`,
      type: 'profile',
    },
    robots: { index: true, follow: true },
  };
}

export default async function UserPage({ params }: UserPageProps) {
  const { username } = await params;

  const isMockMissionary =
    username.toLowerCase() === mockProfile.username.toLowerCase() ||
    username.toLowerCase() === 'samuel-mendonca' ||
    username.toLowerCase() === 'samuel';

  const profile: ProfileData = isMockMissionary
    ? mockProfile
    : {
        ...mockProfile,
        username,
        displayName: username.replace(/-/g, ' '),
        about: {
          ...mockProfile.about,
          introduction: `Perfil público de ${username.replace(/-/g, ' ')} no Mission App.`,
        },
      };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', pb: { xs: 10, md: 6 } }}>
      {/* TopBar do Visitante / Não Autenticado */}
      <VisitorNavbar maxWidth="lg" />

      {/* Área Central de Conteúdo */}
      <Container maxWidth="lg" sx={{ px: { xs: 2, sm: 3 }, py: { xs: 2, sm: 4 } }}>
        <VisitorProfileView profile={profile} />
      </Container>

      {/* Navegação Inferior Mobile para Usuário Não Logado */}
      <VisitorBottomNav />
    </Box>
  );
}
