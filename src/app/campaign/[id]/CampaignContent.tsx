import { cacheLife } from 'next/cache';
import CampaignDetailView from '@/components/campaign/CampaignDetailView';
import { mockCampaign } from '@/mocks/campaign';

type CampaignBodyProps = {
  params: Promise<{ id: string }>;
};

/** Shared by every visitor: cached for the `public` profile (ADR-0004). */
export async function CampaignContent({ id }: { id: string }) {
  'use cache';
  cacheLife('public');
  // Use mock campaign (or customized with id) until the backend serves campaigns.
  const campaign = {
    ...mockCampaign,
    id,
  };

  return <CampaignDetailView campaign={campaign} />;
}

/** Reads the route params inside the page `<Suspense>` boundary (ADR-0005). */
export async function CampaignBody({ params }: CampaignBodyProps) {
  const { id } = await params;
  return <CampaignContent id={id} />;
}
