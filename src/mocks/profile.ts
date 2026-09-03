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
    authorName: 'Maria Silva',
    authorUsername: 'MariaSilva',
    createdAt: '10/07/2025 às 22:06h',
    type: 'post',
    content:
      'Hoje, fizemos uma leitura bíblica com as crianças sobre a vida de Jesus. Ensinamos a elas como manusear a Bíblia e a diferença entre o novo e velho Testamento.',
    imageUrl: '/landing-page/landing-page.png',
    likesCount: 142,
    prayersCount: 88,
    hasPrayed: false,
  },
];
