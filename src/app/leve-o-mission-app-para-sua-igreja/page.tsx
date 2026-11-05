import type { Metadata } from 'next';
import Box from '@mui/material/Box';
import VisitorNavbar from '@/components/layout/VisitorNavbar';
import VisitorBottomNav from '@/components/layout/VisitorBottomNav';
import BringMissionAppView from '@/components/church/BringMissionAppView';
import { BRING_MISSION_APP_PATH } from '@/lib/church/paths';
import { getSiteUrl } from '@/lib/site';

export async function generateMetadata(): Promise<Metadata> {
  const baseUrl = getSiteUrl();
  const title = 'Leve o Mission App para sua igreja | Mission App';
  const description =
    'Adote a campanha missionária recorrente na sua igreja: kit de mídia para o culto, Dia Oficial definido pelo Mission App e QR Code da campanha para orar e ofertar.';

  return {
    title,
    description,
    alternates: { canonical: BRING_MISSION_APP_PATH },
    openGraph: {
      title,
      description,
      url: `${baseUrl}${BRING_MISSION_APP_PATH}`,
      type: 'website',
      siteName: 'Mission App',
      images: [
        {
          url: '/landing-page/landing-page.png',
          width: 1200,
          height: 630,
          alt: 'Leve o Mission App para sua igreja',
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

export default function BringMissionAppPage() {
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
        <BringMissionAppView />
      </Box>

      <VisitorBottomNav />
    </Box>
  );
}
