import type { Metadata } from 'next';
import { Suspense } from 'react';
import Box from '@mui/material/Box';
import VisitorBottomNav from '@/components/layout/VisitorBottomNav';
import VisitorNavbar from '@/components/layout/VisitorNavbar';
import { getSiteUrl } from '@/lib/site';
import PublicPageFallback from '@/components/common/PublicPageFallback';
import { mockProfile } from '@/mocks/profile';
import { UserProfileBody } from './UserProfileContent';

type UserPageProps = {
  params: Promise<{ username: string }>;
};

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

export default function UserPage({ params }: UserPageProps) {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: 'background.default',
        pb: { xs: 'calc(env(safe-area-inset-bottom, 0px) + 76px)', md: 6 },
      }}
    >
      {/* TopBar do Visitante / Não Autenticado */}
      <VisitorNavbar maxWidth="lg" />

      <Suspense fallback={<PublicPageFallback label="Carregando perfil" />}>
        <UserProfileBody params={params} />
      </Suspense>

      {/* Navegação Inferior Mobile para Usuário Não Logado */}
      <VisitorBottomNav />
    </Box>
  );
}
