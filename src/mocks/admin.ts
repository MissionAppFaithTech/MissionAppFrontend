import type { MissionaryRegistration, RegistrationStatus } from '@/types/admin';

const featured = [
  [
    'Ana Carolina Silva',
    'ana.carolina',
    'Maputo, Moçambique',
    'JOCUM',
    'Igreja Batista',
    'pending',
    '2026-11-02T09:42:00-03:00',
  ],
  [
    'Lucas Oliveira',
    'lucas.oliveira',
    'Manaus, Brasil',
    'MEAP',
    'Presbiteriana',
    'pending',
    '2026-11-02T08:15:00-03:00',
  ],
  [
    'Mariana Costa',
    'mariana.costa',
    'Luanda, Angola',
    'AMME',
    'Assembleia de Deus',
    'pending',
    '2026-11-01T17:30:00-03:00',
  ],
  [
    'Pedro Henrique Santos',
    'pedro.henrique',
    'Lisboa, Portugal',
    'Missão Antioquia',
    'Batista',
    'pending',
    '2026-11-01T14:08:00-03:00',
  ],
  [
    'Samuel Mendonça',
    'samuel.mendonca',
    'Cidade do Cabo, África do Sul',
    'JOCUM',
    'Igreja Batista',
    'approved',
    '2026-10-31T11:22:00-03:00',
  ],
  [
    'Beatriz Almeida',
    'beatriz.almeida',
    'Recife, Brasil',
    'Missão ALEM',
    'Presbiteriana',
    'approved',
    '2026-10-30T18:45:00-03:00',
  ],
  [
    'Rafael Ferreira',
    'rafael.ferreira',
    'São Paulo, Brasil',
    'Independente',
    'Igreja Batista',
    'rejected',
    '2026-10-29T10:18:00-03:00',
  ],
  [
    'Camila Rodrigues',
    'camila.rodrigues',
    'Belo Horizonte, Brasil',
    'Independente',
    'Comunidade da Fé',
    'rejected',
    '2026-10-28T16:36:00-03:00',
  ],
] as const;

function registration(
  id: number,
  name: string,
  username: string,
  location: string,
  agency: string,
  church: string,
  status: RegistrationStatus,
  registeredAt: string
): MissionaryRegistration {
  return {
    id: String(id),
    name,
    username,
    email: `${username}@example.com`,
    location,
    agency: { name: agency },
    church: { name: church },
    status,
    registeredAt,
    birthDate: '1994-03-15',
    gender: id % 2 ? 'Feminino' : 'Masculino',
    document: '123.456.789-09',
    phone: '+55 (11) 99999-0000',
    description: `Atuação missionária em ${location}, com apoio a crianças e famílias em situação de vulnerabilidade. O projeto realiza atividades educativas, acompanhamento comunitário e ações de evangelização em parceria com igrejas locais.`,
    ...(status === 'rejected'
      ? {
          rejectionReason:
            'Complete a descrição do projeto com os objetivos e as atividades previstas.',
        }
      : {}),
  };
}

/** Deterministic, fictional fixtures. No real account is read or changed. */
export const mockMissionaryRegistrations: MissionaryRegistration[] = [
  ...featured.map(([name, username, location, agency, church, status, date], index) =>
    registration(index + 1, name, username, location, agency, church, status, date)
  ),
  ...Array.from({ length: 120 }, (_, index) => {
    const firstNames = [
      'Daniel',
      'Sofia',
      'Gabriel',
      'Helena',
      'André',
      'Isabela',
      'Tiago',
      'Julia',
      'Marcos',
      'Laura',
    ];
    const lastNames = [
      'Souza',
      'Pereira',
      'Lima',
      'Rocha',
      'Barbosa',
      'Ribeiro',
      'Melo',
      'Dias',
      'Nunes',
      'Castro',
      'Azevedo',
      'Teixeira',
    ];
    const name = `${firstNames[index % 10]} ${lastNames[Math.floor(index / 10)]}`;
    const username = name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replaceAll(' ', '.');
    const status = index < 8 ? 'pending' : index < 114 ? 'approved' : 'rejected';
    return registration(
      index + 9,
      name,
      username,
      'Fortaleza, Brasil',
      'JOCUM',
      'Igreja Batista',
      status,
      new Date(Date.UTC(2026, 9, 27, 15) - index * 86_400_000).toISOString()
    );
  }),
];
