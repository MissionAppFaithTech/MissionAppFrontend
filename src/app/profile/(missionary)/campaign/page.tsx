import type { Metadata } from 'next';
import MissionaryCampaignSection from '@/components/campaign/MissionaryCampaignSection';
import { mockCampaign } from '@/mocks/campaign';
import { mockProfile } from '@/mocks/profile';

export const metadata: Metadata = {
  title: 'Campanha Missionária | Mission App',
  description: 'Acompanhe as campanhas missionárias oficiais vinculadas aos projetos de impacto.',
};

export default function CampaignPage() {
  return (
    <MissionaryCampaignSection
      campaign={mockCampaign}
      missionaryName={mockProfile.displayName}
      isOwnProfile={true}
    />
  );
}
