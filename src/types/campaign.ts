export type CampaignImpactProject = {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  missionaryName?: string;
  missionaryUsername?: string;
  campaignTitle?: string;
  campaignBadge?: boolean;
};

export type CampaignData = {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  bannerUrl: string;
  badge: string;
  profileImageUrl?: string;
  images: string[];
  videoUrl?: string;
  churchDay: string; // Dia Oficial de Realização da Campanha nas Igrejas (RF 13.1)
  startDate: string;
  endDate: string;
  redirectUrl?: string;
  shareUrl?: string;
  status: 'publicada' | 'rascunho' | 'arquivada';
  missionaryName?: string;
  missionaryUsername?: string;
  associatedImpactProjects?: CampaignImpactProject[];
};
