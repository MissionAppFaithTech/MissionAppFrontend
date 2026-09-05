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

export const mockCampaignMaria: CampaignData = {
  id: 'campanha-esperanca-mocambique',
  title: 'Campanha Esperança & Dignidade em Moçambique',
  subtitle:
    'Levando água potável, apoio nutricional e discipulado bíblico para mais de 300 crianças e suas famílias.',
  description:
    'A Campanha Esperança & Dignidade em Moçambique atua em aldeias do interior de Moçambique promovendo a abertura de poços artesianos, distribuição de cestas básicas e implantação de salas de alfabetização cristã. Com o apoio dos parceiros de missão, formamos líderes locais e garantimos que famílias inteiras tenham condições dignas e acesso à Palavra de Deus.',
  bannerUrl: '/landing-page/background.png',
  badge: 'Selo Oficial de Campanha',
  profileImageUrl: '/landing-page/background.png',
  images: [
    '/landing-page/background.png',
    '/landing-page/landing-page.png',
    '/images/projects/projeto-impacto.jpg',
  ],
  videoUrl: 'https://www.youtube.com/watch?v=5dsGWM5XGdg',
  churchDay: '15 de Novembro de 2026',
  startDate: '2026-09-01',
  endDate: '2026-12-15',
  redirectUrl: 'https://github.com/MissionAppFaithTech',
  shareUrl: '/campanha/campanha-esperanca-mocambique',
  status: 'publicada',
  missionaryName: 'Maria Silva',
  associatedImpactProjects: [
    {
      id: 'proj-maria-1',
      title: 'Apoio Nutricional e Alfabetização em Moçambique',
      description:
        'Distribuição contínua de kits escolares, cestas de alimentos e discipulado infantil para crianças em Moçambique.',
      imageUrl: '/landing-page/background.png',
      missionaryName: 'Maria Silva',
      missionaryUsername: 'MariaSilva',
      campaignTitle: 'Campanha Esperança & Dignidade em Moçambique',
      campaignBadge: true,
    },
  ],
};

export const mockCampaignLucas: CampaignData = {
  id: 'campanha-alento-nepal',
  title: 'Campanha Alento & Luz nas Montanhas do Nepal',
  subtitle:
    'Fornecendo abrigo, agasalhos térmicos e assistência médica emergencial para vilarejos isolados no Himalaia.',
  description:
    'A Campanha Alento & Luz nas Montanhas do Nepal mobiliza equipes para alcançar comunidades em altas altitudes desprovidas de infraestrutura médica e aquecimento. Através deste ministério pioneiro, levamos compaixão prática, tradução de porções bíblicas na língua local e apoio a orfanatos da região.',
  bannerUrl: '/landing-page/landing-page.png',
  badge: 'Selo Oficial de Campanha',
  profileImageUrl: '/images/projects/projeto-impacto.jpg',
  images: [
    '/images/projects/projeto-impacto.jpg',
    '/landing-page/landing-page.png',
    '/landing-page/background.png',
  ],
  videoUrl: 'https://www.youtube.com/watch?v=5dsGWM5XGdg',
  churchDay: '28 de Novembro de 2026',
  startDate: '2026-10-01',
  endDate: '2026-12-31',
  redirectUrl: 'https://github.com/MissionAppFaithTech',
  shareUrl: '/campanha/campanha-alento-nepal',
  status: 'publicada',
  missionaryName: 'Lucas Moreira',
  associatedImpactProjects: [
    {
      id: 'proj-lucas-1',
      title: 'Socorro e Assistência no Himalaia',
      description:
        'Envio de suprimentos de inverno e suporte humanitário a vilarejos montanhosos no Nepal.',
      imageUrl: '/landing-page/landing-page.png',
      missionaryName: 'Lucas Moreira',
      missionaryUsername: 'LucasMoreira',
      campaignTitle: 'Campanha Alento & Luz nas Montanhas do Nepal',
      campaignBadge: true,
    },
  ],
};

export function getMockCampaignForMissionary(username?: string): CampaignData | null {
  if (!username) return mockCampaign;
  const normalized = username.toLowerCase();
  if (normalized.includes('maria')) return mockCampaignMaria;
  if (normalized.includes('lucas')) return mockCampaignLucas;
  return mockCampaign;
}
