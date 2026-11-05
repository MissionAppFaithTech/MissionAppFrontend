import { mockCampaign } from '@/mocks/campaign';
import type { CampaignData } from '@/types/campaign';

/**
 * The recurring campaign in effect, highlighted on the landing page and in the
 * church guide (QR code, official day).
 *
 * NOTE: sample data until campaigns come from the API; swap only this export.
 */
export const featuredCampaign: CampaignData = mockCampaign;

/** Public page of a campaign, the one the QR code opens. */
export function campaignPath(campaign: Pick<CampaignData, 'id'>): string {
  return `/campanha/${campaign.id}`;
}
