import type { Metadata } from 'next';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import VisitorBottomNav from '@/components/layout/VisitorBottomNav';
import VisitorNavbar from '@/components/layout/VisitorNavbar';
import VisitorProfileView from '@/components/profile/VisitorProfileView';
import JsonLd, { generateProfilePageSchema } from '@/components/seo/JsonLd';
import { getSiteUrl } from '@/lib/site';
import { mockProfile } from '@/mocks/profile';
import type { ProfileData } from '@/types/profile';

type UserPageProps = {
  params: Promise<{ username: string }>;
};

/** Public profiles — refresh cached HTML periodically when data is wired. */
export const revalidate = 300;

export async function generateMetadata({ params }: UserPageProps): Promise<Metadata> {
  const { username } = await params;
  const baseUrl = getSiteUrl();

  const isMock =
    username.toLowerCase() === mockProfile.username.toLowerCase() ||
    username.toLowerCase() === 'samuel-mendonca' ||
    username.toLowerCase() === 'samuel';

  const profile = isMock ? mockProfile : null;
  const displayName = profile ? profile.displayName : username.replace(/-/g, ' ');
  const description = profile
    ? `${profile.roleDescription} - ${profile.about.introduction.slice(0, 150)}...`
    : `Perfil público de ${displayName} no Mission App. Conecte-se, acompanhe a missão e apoie no campo.`;

  const bannerImage = profile?.impactProject?.imageUrl || '/landing-page/landing-page.png';

  return {
    title: `${displayName} (@${username})`,
    description,
    alternates: {
      canonical: `/user/${username}`,
    },
    openGraph: {
      title: `${displayName} (@${username}) | Mission App`,
      description,
      url: `${baseUrl}/user/${username}`,
      type: 'profile',
      siteName: 'Mission App',
      images: [
        {
          url: bannerImage,
          width: 1200,
          height: 630,
          alt: `Perfil de ${displayName} no Mission App`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${displayName} (@${username}) | Mission App`,
      description,
      images: [bannerImage],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
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

  const profileSchemas = generateProfilePageSchema(profile, `/user/${username}`);

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', pb: { xs: 10, md: 6 } }}>
      {/* Schema.org JSON-LD para motores de busca e IAs */}
      <JsonLd data={profileSchemas} />

      {/* TopBar do Visitante / Não Autenticado */}
      <VisitorNavbar maxWidth="lg" />

      {/* Área Central de Conteúdo */}
      <Container
        component="main"
        id="main-content"
        tabIndex={-1}
        maxWidth="lg"
        sx={{ px: { xs: 2, sm: 3 }, py: { xs: 2, sm: 4 }, outline: 'none' }}
      >
        <VisitorProfileView profile={profile} />
      </Container>

      {/* Navegação Inferior Mobile para Usuário Não Logado */}
      <VisitorBottomNav />
    </Box>
  );
}
