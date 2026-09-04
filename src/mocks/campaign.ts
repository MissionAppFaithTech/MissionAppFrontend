import type { CampaignData } from '@/types/campaign';

export const mockCampaign: CampaignData = {
  id: 'campanha-educacao-esperanca',
  title: 'Campanha de Educação & Esperança',
  subtitle:
    'Mobilizando comunidades de fé para transformar a infância e capacitar novas gerações através do evangelho e suporte educacional no campo missionário.',
  description:
    'A Campanha de Educação & Esperança é uma iniciativa oficial do Mission App que une igrejas locais, missionários em campo e apoiadores dedicados na construção de centros de apoio escolar e comunidades de fé vivas. Milhares de crianças em regiões em vulnerabilidade extrema vivem sem acesso básico a materiais didáticos cristãos, reforço escolar ou orientação pastoral. Através desta campanha nacional, fornecemos suporte estrutural, aquisição de suprimentos, treinamento de obreiros e bolsas de auxílio para que as famílias sejam acolhidas integralmente pelo amor de Cristo.',
  bannerUrl: '/landing-page/landing-page.png',
  badge: 'Selo Oficial de Campanha',
  profileImageUrl: '/images/projects/projeto-impacto.jpg',
  images: [
    '/landing-page/landing-page.png',
    '/images/projects/projeto-impacto.jpg',
    '/landing-page/background.png',
  ],
  videoUrl: 'https://www.youtube.com/watch?v=5dsGWM5XGdg',
  churchDay: '20 de Outubro de 2026',
  startDate: '2026-09-01',
  endDate: '2026-11-30',
  redirectUrl: 'https://github.com/MissionAppFaithTech',
  shareUrl: '/campanha/campanha-educacao-esperanca',
  status: 'publicada',
  missionaryName: 'Samuel Mendonça',
  missionaryUsername: '_SamiMendonca',
  associatedImpactProjects: [
    {
      id: 'proj-1',
      title: 'Projeto social na favela do Lixão',
      description:
        'Construção de uma escola confessional cristã e centro comunitário para atender mais de 120 crianças em situação de vulnerabilidade na África do Sul.',
      imageUrl: '/images/projects/projeto-impacto.jpg',
      missionaryName: 'Samuel Mendonça',
      missionaryUsername: '_SamiMendonca',
      campaignTitle: 'Campanha de Educação & Esperança',
      campaignBadge: true,
    },
  ],
};
