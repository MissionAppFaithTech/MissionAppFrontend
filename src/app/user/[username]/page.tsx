import type { Metadata } from 'next';
import { Suspense } from 'react';
import Box from '@mui/material/Box';
import VisitorBottomNav from '@/components/layout/VisitorBottomNav';
import VisitorNavbar from '@/components/layout/VisitorNavbar';
import { getSiteUrl } from '@/lib/site';
import PublicPageFallback from '@/components/common/PublicPageFallback';
import { getPublicProfile } from '@/lib/server/publicProfile';
import { UserProfileBody } from './UserProfileContent';

type UserPageProps = {
  params: Promise<{ username: string }>;
};

export async function generateMetadata({ params }: UserPageProps): Promise<Metadata> {
  const { username } = await params;
  const profile = await getPublicProfile(username);
  if (!profile) {
    return { title: 'Perfil não encontrado', robots: { index: false, follow: false } };
  }

  const baseUrl = getSiteUrl();
  const handle = profile.username;
  const displayName = profile.displayName;
  const summary = profile.about.introduction || profile.roleDescription;
  const description = summary
    ? `${displayName}: ${summary.slice(0, 150)}${summary.length > 150 ? '…' : ''}`
    : `Perfil público de ${displayName} no Mission App. Conecte-se, acompanhe a missão e apoie no campo.`;
  const shareImage = '/landing-page/landing-page.png';

  return {
    title: `${displayName} (@${handle})`,
    description,
    alternates: {
      canonical: `/user/${handle}`,
    },
    openGraph: {
      title: `${displayName} (@${handle}) | Mission App`,
      description,
      url: `${baseUrl}/user/${handle}`,
      type: 'profile',
      siteName: 'Mission App',
      images: [
        {
          url: shareImage,
          width: 1200,
          height: 630,
          alt: `Perfil de ${displayName} no Mission App`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${displayName} (@${handle}) | Mission App`,
      description,
      images: [shareImage],
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
