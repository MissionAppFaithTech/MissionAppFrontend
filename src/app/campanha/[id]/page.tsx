import type { Metadata } from 'next';
import { Suspense } from 'react';
import Box from '@mui/material/Box';
import VisitorNavbar from '@/components/layout/VisitorNavbar';
import VisitorBottomNav from '@/components/layout/VisitorBottomNav';
import { mockCampaign } from '@/mocks/campaign';
import { CampaignBody } from './CampaignContent';
import { getSiteUrl } from '@/lib/site';
import PublicPageFallback from '@/components/common/PublicPageFallback';

type CampaignPageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: CampaignPageProps): Promise<Metadata> {
  const { id } = await params;
  const baseUrl = getSiteUrl();
  const campaign = mockCampaign; // In production, fetch by id from API

  const title = `${campaign.title} | Mission App`;
  const description = campaign.subtitle;
  const bannerImage = campaign.bannerUrl || '/landing-page/landing-page.png';

  return {
    title,
    description,
    alternates: {
      canonical: `/campanha/${id}`,
    },
    openGraph: {
      title,
      description,
      url: `${baseUrl}/campanha/${id}`,
      type: 'article',
      siteName: 'Mission App',
      images: [
        {
          url: bannerImage,
          width: 1200,
          height: 630,
          alt: campaign.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [bannerImage],
    },
  };
}

export default function CampaignPage({ params }: CampaignPageProps) {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: 'background.default',
        pb: { xs: 'calc(env(safe-area-inset-bottom, 0px) + 76px)', md: 4 },
      }}
    >
      <VisitorNavbar maxWidth="lg" />
      <Suspense fallback={<PublicPageFallback label="Carregando campanha" />}>
        <CampaignBody params={params} />
      </Suspense>
      <VisitorBottomNav />
    </Box>
  );
}
