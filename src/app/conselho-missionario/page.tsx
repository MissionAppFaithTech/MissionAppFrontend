import type { Metadata } from 'next';
import Box from '@mui/material/Box';
import VisitorNavbar from '@/components/layout/VisitorNavbar';
import VisitorBottomNav from '@/components/layout/VisitorBottomNav';
import ChurchGuideView from '@/components/church/ChurchGuideView';
import { getSiteUrl } from '@/lib/site';

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const baseUrl = getSiteUrl();
  const title = 'Guia Prático do Conselho Missionário & Mobilização da Igreja | Mission App';
  const description =
    'Passo a passo prático para criar um conselho missionário na igreja local e engajar a congregação o ano inteiro. Frameworks de JMM, JMN, APMT e Perspectivas Brasil.';

  return {
    title,
    description,
    alternates: {
      canonical: '/conselho-missionario',
    },
    openGraph: {
      title,
      description,
      url: `${baseUrl}/conselho-missionario`,
      type: 'website',
      siteName: 'Mission App',
      images: [
        {
          url: '/landing-page/landing-page.png',
          width: 1200,
          height: 630,
          alt: 'Guia do Conselho Missionário e Mobilização da Igreja',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: ['/landing-page/landing-page.png'],
    },
  };
}

export default function ChurchCouncilGuidePage() {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: 'background.default',
        pb: { xs: 'calc(env(safe-area-inset-bottom, 0px) + 76px)', md: 6 },
      }}
    >
      <VisitorNavbar maxWidth="lg" />

      <Box component="main" id="main-content" tabIndex={-1} sx={{ outline: 'none' }}>
        <ChurchGuideView />
      </Box>

      <VisitorBottomNav />
    </Box>
  );
}
