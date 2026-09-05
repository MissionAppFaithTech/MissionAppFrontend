import type { Metadata } from 'next';
import Box from '@mui/material/Box';
import VisitorNavbar from '@/components/layout/VisitorNavbar';
import VisitorBottomNav from '@/components/layout/VisitorBottomNav';
import CampaignDetailView from '@/components/campaign/CampaignDetailView';
import { mockCampaign } from '@/mocks/campaign';
import { getSiteUrl } from '@/lib/site';

type CampaignPageProps = {
  params: Promise<{ id: string }>;
};

export const revalidate = 300;

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

export default async function CampaignPage({ params }: CampaignPageProps) {
  const { id } = await params;
  // Use mock campaign (or customized with id)
  const campaign = {
    ...mockCampaign,
    id,
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <VisitorNavbar maxWidth="lg" />
      <CampaignDetailView campaign={campaign} />
      <VisitorBottomNav />
    </Box>
  );
}
