import type { ProfileData, FollowedMissionary, SavedPost } from '@/types/profile';

export const mockProfile: ProfileData = {
  username: '_SamiMendonca',
  displayName: 'Samuel Mendonça',
  roleDescription: 'Missionário (a)(s) na África do Sul',
  role: 'missionary',
  followersCount: 5,
  location: 'Cidade do Cabo, África do Sul',
  projectsCount: 25,
  postsCount: 3,
  campaignsCount: 4,
  supportersCount: '1.2k',
  followingCount: 12,
  about: {
    introduction:
      'Meu nome é Samuel Mendonça e sou missionário em tempo integral. Desde minha infância tenho sido chamado por Deus para servir na África e na Ásia. Junte-se comigo e ajude a trazer luz para aqueles que estão em trevas!',
    missionHistory:
      'Meu nome é Samuel Mendonça e sou missionário em tempo integral. Desde minha infância tenho sido chamado por Deus para servir na África e na Ásia. Junte-se comigo e ajude a trazer luz para aqueles que estão em trevas!',
    originLocation: 'Rio de Janeiro - Brasil',
    currentLocation: 'Rio de Janeiro - Brasil',
    missionaryAgency: 'JOCUM (Jovens com uma Missão)',
    faithCommunity: 'Igreja Batista',
    prayerRequests: '"O Senhor é meu pastor e nada me faltará." Salmos 23:1',
    lifeVerse: '"O Senhor é meu pastor e nada me faltará." Salmos 23:1',
  },
  contact: {
    publicEmail: 'samuelhe@gmail.com',
    publicPhone: '+55 (21) 98765-4321',
    whatsappNumber: '+5521987654321',
  },
  impactProject: {
    id: 'proj-1',
    title: 'Projeto social na favela do Lixão',
    description:
      'Ajude-nos a construir uma escola cristã em uma favela da África do Sul. Neste lugar, as crianças quase não tem acesso a materiais educativos cristãos. Ter uma escola confessional cristã em lugar tão carente pode revolucionar uma geração inteira.\n\nPrecisamos de recursos para comprar tijolos, argamassa, cimento, areia, tinta, telhas, carteiras escolares, quadro, mesas, dentre outros.',
    imageUrl: '/images/projects/projeto-impacto.jpg',
    galleryImages: [
      '/landing-page/landing-page.png',
      '/images/projects/projeto-impacto.jpg',
      '/landing-page/background.png',
    ],
    videoUrl: 'https://www.youtube.com/watch?v=5dsGWM5XGdg',
    campaignTitle: 'Campanha de Educação & Esperança',
    campaignBadge: true,
  },
  financial: {
    supporterMessage:
      'Sua oferta voluntária sustenta nossa atuação direta em comunidades carentes da África do Sul, permitindo manter projetos de educação infantil e apoio pastoral. Que Deus abençoe sua generosidade!',
    pix: {
      enabled: true,
      key: 'samuelhe@gmail.com',
      keyType: 'email',
      qrCodeUrl: '/images/projects/projeto-impacto.jpg',
    },
    bankTransfer: {
      enabled: true,
      bankName: 'Banco do Brasil',
      bankNumber: '001',
      agency: '1234-5',
      account: '98765-4',
      accountType: 'corrente',
      holderName: 'Samuel Mendonça',
      holderDocument: '123.456.789-00',
    },
  },
};

export const mockSupporterProfile: ProfileData = {
  username: 'SoraiaSantos',
  displayName: 'Soraia Santos Correa',
  roleDescription: 'Apoiador de missões',
  role: 'supporter',
  location: 'Rio de Janeiro - RJ',
  followingCount: 12,
  supportedCampaignsCount: 4,
  about: {
    introduction:
      'Apaixonada pelo Reino e entusiasta de missões transculturais. Apoio ativamente missionários no campo através de orações, suporte financeiro e engajamento comunitário.',
    originLocation: 'Rio de Janeiro - RJ',
    currentLocation: 'Rio de Janeiro - RJ',
    faithCommunity: 'Centro Evangelístico Internacional',
    lifeVerse: '"Ide por todo o mundo e pregai o evangelho a toda criatura." Marcos 16:15',
  },
  contact: {
    publicEmail: 'soraia.santos@email.com',
    publicPhone: '+55 (21) 99876-5432',
    whatsappNumber: '+5521998765432',
  },
};

export const mockFollowedMissionaries: FollowedMissionary[] = [
  {
    id: '1',
    username: 'MariaSilva',
    displayName: 'Maria Silva',
    location: 'Moçambique',
    supportersCount: '320 apoiadores',
  },
  {
    id: '2',
    username: 'LucasMoreira',
    displayName: 'Lucas Moreira',
    location: 'Nepal',
    supportersCount: '148 apoiadores',
  },
  {
    id: '3',
    username: '_SamiMendonca',
    displayName: 'Samuel Mendonça',
    location: 'África do Sul',
    supportersCount: '1.2k apoiadores',
  },
];

export const mockSavedPosts: SavedPost[] = [
  {
    id: '1',
    authorName: 'Samuel Mendonça',
    authorUsername: '_SamiMendonca',
    createdAt: '09/07/2025 às 19:40h',
    type: 'prayer',
    content:
      'Orem pela liberação dos materiais da escola — a alfândega travou o contêiner com as bíblias infantis.',
    likesCount: 74,
    prayersCount: 112,
    hasPrayed: true,
  },
  {
    id: '2',
    authorName: 'Samuel Mendonça',
    authorUsername: '_SamiMendonca',
    createdAt: '10/07/2025 às 22:06h',
    type: 'post',
    content:
      'Hoje, fizemos uma leitura bíblica com as crianças sobre a vida de Jesus. Ensinamos a elas como manusear a Bíblia e a diferença entre o novo e velho Testamento.',
    imageUrl: '/landing-page/landing-page.png',
    likesCount: 142,
    prayersCount: 88,
    hasPrayed: false,
  },
  {
    id: '3',
    authorName: 'Maria Silva',
    authorUsername: 'MariaSilva',
    createdAt: '11/07/2025 às 15:30h',
    type: 'post',
    content:
      'Distribuímos cestas básicas e kits escolares para 50 famílias em Moçambique. Glória a Deus pelas portas abertas!',
    imageUrl: '/landing-page/background.png',
    likesCount: 95,
    prayersCount: 64,
    hasPrayed: false,
  },
  {
    id: '4',
    authorName: 'Lucas Moreira',
    authorUsername: 'LucasMoreira',
    createdAt: '12/07/2025 às 10:15h',
    type: 'campaign',
    content:
      'Iniciamos a campanha de agasalhos e suprimentos para as comunidades remotas do Nepal.',
    likesCount: 81,
    prayersCount: 45,
    hasPrayed: true,
  },
];
