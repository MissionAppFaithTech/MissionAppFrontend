export interface ChecklistPhase {
  id: string;
  number: number;
  title: string;
  action: string;
  guideline: string;
}

export interface CouncilRole {
  id: string;
  title: string;
  roleBadge: string;
  iconName: 'coordinator' | 'secretary' | 'financial' | 'intercession' | 'care';
  description: string;
}

export interface CadenceItem {
  id: string;
  period: string;
  cadenceBadge: string;
  title: string;
  frequency: string;
  description: string;
  actionItem: string;
}

export type MaterialCategory =
  'Todos' | 'Gestão e Estatuto' | 'Mobilização e Mídia' | 'Capacitação' | 'Infantil e Jovens';

export interface MaterialItem {
  title: string;
  description: string;
}

export interface ReferenceInstitution {
  id: string;
  name: string;
  shortName: string;
  logoUrl: string;
  categories: MaterialCategory[];
  focus: string;
  resources: MaterialItem[];
  links: Array<{
    label: string;
    url: string;
  }>;
}

export interface ChurchVideoPlaylist {
  id: string;
  title: string;
  subtitle: string;
  playlistUrl: string;
  embedUrl: string;
  thumbnailUrl: string;
  description: string;
  topics: string[];
}

export interface CopyableTemplate {
  id: string;
  title: string;
  subtitle: string;
  content: string;
}

export const CHECKLIST_PHASES: ChecklistPhase[] = [
  {
    id: 'fase-1',
    number: 1,
    title: 'Fase 1: Alinhamento Pastoral e Visão',
    action:
      'Reunião inicial com o pastor e liderança da igreja para definir o propósito do conselho.',
    guideline:
      'O conselho não é um departamento isolado que compete por agenda, mas um braço auxiliar do pastorado para conectar todos os ministérios da igreja à missão.',
  },
  {
    id: 'fase-2',
    number: 2,
    title: 'Fase 2: Formação da Equipe e Regimento Interno',
    action: 'Escolha de 4 a 7 membros vocacionados e engajados na igreja local.',
    guideline:
      'Elaborar um Regimento Interno simples definindo tempo de mandato (1 a 2 anos), frequência de reuniões (mensal) e critérios objetivos para adoção de projetos e missionários.',
  },
  {
    id: 'fase-3',
    number: 3,
    title: 'Fase 3: Capacitação Base da Liderança',
    action: 'Nivelamento teológico e estratégico da equipe.',
    guideline:
      'Inscrever os membros do conselho no curso Perspectivas Brasil ou realizar uma Fatia do Perspectivas na igreja para alinhar a base bíblica, histórica, cultural e estratégica antes de iniciar o trabalho.',
  },
  {
    id: 'fase-4',
    number: 4,
    title: 'Fase 4: Planejamento Financeiro (Fundo Missionário)',
    action: 'Definir a política de captação e sustento missionário com a tesouraria.',
    guideline:
      'Estabelecer um percentual fixo do orçamento da igreja e/ou implantar a Oferta de Promessa de Fé (compromisso voluntário mensal exclusivo para missões assumido pelos membros), definindo regras claras de prestação de contas.',
  },
  {
    id: 'fase-5',
    number: 5,
    title: 'Fase 5: Lançamento e Calendário Anual',
    action: 'Culto de posse/apresentação do conselho à igreja.',
    guideline:
      'Integrar as ações missionárias no calendário oficial de todos os departamentos (ministério infantil, jovens, escola bíblica e pequenos grupos).',
  },
];

export const COUNCIL_ROLES: CouncilRole[] = [
  {
    id: 'coordenador',
    title: 'Coordenador / Presidente (ou Promotor de Missões)',
    roleBadge: 'Liderança & Relações',
    iconName: 'coordinator',
    description:
      'Lidera as reuniões mensais do conselho, faz a ponte direta com o pastor titular e mantém o relacionamento institucional com as agências missionárias (como APMT, JMM e JMN).',
  },
  {
    id: 'secretario',
    title: 'Secretário e Comunicação',
    roleBadge: 'Comunicação & Atas',
    iconName: 'secretary',
    description:
      'Mantém as atas de reunião, organiza o arquivo de cartas-oração dos missionários adotados e atualiza o mural físico e digital da igreja com notícias atualizadas do campo.',
  },
  {
    id: 'financeiro',
    title: 'Relator Financeiro / Tesoureiro de Missões',
    roleBadge: 'Gestão Financeira',
    iconName: 'financial',
    description:
      'Acompanha o Fundo Missionário em conjunto com a tesouraria da igreja, controla a pontualidade dos envios mensais aos projetos e apresenta relatórios periódicos de transparência para a congregação.',
  },
  {
    id: 'intercessao',
    title: 'Coordenador de Intercessão',
    roleBadge: 'Oração & Clamor',
    iconName: 'intercession',
    description:
      'Transforma os pedidos das cartas dos missionários em boletins semanais de oração, coordena o "Minuto Missionário" nos cultos (3 a 5 minutos) e abastece os pequenos grupos com motivos específicos de clamor.',
  },
  {
    id: 'cuidado',
    title: 'Coordenador de Cuidado Integral e Vocacionados',
    roleBadge: 'Pastoreio & Vocação',
    iconName: 'care',
    description:
      'Acompanha quem demonstra chamado missionário na igreja local (indicando leituras, cursos como o Perspectivas e agências) e cuida pastoralmente dos missionários já enviados (aniversários, férias ministeriais, saúde emocional e recepção).',
  },
];

export const CADENCE_ITEMS: CadenceItem[] = [
  {
    id: 'semanal',
    period: 'Cadência Semanal',
    cadenceBadge: 'Todo Domingo',
    title: 'Minuto Missionário no Culto',
    frequency: 'Todo Domingo nos cultos públicos',
    description:
      'Reservar 3 minutos fixos na liturgia do culto para conscientizar toda a igreja de forma consistente.',
    actionItem:
      'Exibir 1 foto, relatar 1 desafio atual do campo e fazer 1 oração objetiva por um missionário apoiado ou povo não alcançado.',
  },
  {
    id: 'mensal',
    period: 'Cadência Mensal',
    cadenceBadge: 'Mensal',
    title: 'Pequenos Grupos / Escola Bíblica',
    frequency: 'Reuniões mensais de grupos',
    description:
      'Descentralizar a mobilização para que cada congregação ou pequeno grupo crie laços diretos com quem está no campo.',
    actionItem:
      'Cada pequeno grupo ou classe "adota" um missionário apoiado pela igreja, comprometendo-se a enviar mensagens de encorajamento (WhatsApp/e-mail) e orar especificamente por aquela família durante o mês.',
  },
  {
    id: 'semestral',
    period: 'Cadência Semestral',
    cadenceBadge: 'Semestral',
    title: 'Educação Missiológica e Infantil',
    frequency: 'A cada 6 meses',
    description:
      'Capacitar novas lideranças e engajar as crianças com dinâmicas visuais e didáticas que despertam compaixão.',
    actionItem:
      'Promover uma Fatia do Perspectivas, oficina de missões ou clube de leitura missionária para jovens/adultos. No ministério infantil, aplicar os roteiros práticos como o Sapato Missionário ou Cofrinho Missionário (disponibilizados pela JMM/JMN).',
  },
  {
    id: 'anual',
    period: 'Cadência Anual',
    cadenceBadge: 'Anual',
    title: 'Conferência ou Campanha Missionária',
    frequency: 'Uma vez por ano',
    description:
      'O momento auge do calendário missionário local para colheita, consagração e renovação dos compromissos de sustento.',
    actionItem:
      'Organizar um final de semana ou mês temático utilizando os kits de mídia oficiais (JMM, JMN ou APMT), com preletores convidados, feira de nações organizada pelos grupos da igreja e renovação dos alvos financeiros (Promessa de Fé).',
  },
];

export const MATERIAL_CATEGORIES: MaterialCategory[] = [
  'Todos',
  'Gestão e Estatuto',
  'Mobilização e Mídia',
  'Capacitação',
  'Infantil e Jovens',
];

export const REFERENCE_INSTITUTIONS: ReferenceInstitution[] = [
  {
    id: 'jmm',
    name: 'Junta de Missões Mundiais',
    shortName: 'JMM',
    logoUrl: '/images/institutions/jmm.png',
    categories: ['Gestão e Estatuto', 'Mobilização e Mídia', 'Infantil e Jovens'],
    focus:
      'Mobilização global e transcultural (materiais abertos e adaptáveis para qualquer denominação).',
    resources: [
      {
        title: 'Manual do Promotor / Conselho Missionário (PDF)',
        description: 'Guia passo a passo de como organizar e liderar a equipe na igreja local.',
      },
      {
        title: 'Kits Completos de Mídia e Campanha',
        description:
          'Vídeos documentais, cartazes, slides, boletins e música oficial para conferências missionárias.',
      },
      {
        title: 'Roteiros Infantis e Dinâmicas de Alvos',
        description:
          'Cultos infantis prontos, revista infantil e dinâmicas práticas de arrecadação (Sapato Missionário e Cofrinho Missionário).',
      },
    ],
    links: [
      {
        label: 'Portal de Mobilização JMM',
        url: 'https://missoesmundiais.com.br/mobilize',
      },
      {
        label: 'Site Oficial JMM',
        url: 'https://missoesmundiais.com.br',
      },
    ],
  },
  {
    id: 'jmn',
    name: 'Junta de Missões Nacionais',
    shortName: 'JMN',
    logoUrl: '/images/institutions/jmn.png',
    categories: ['Mobilização e Mídia', 'Infantil e Jovens', 'Gestão e Estatuto'],
    focus:
      'Evangelização, plantação de igrejas, missões urbanas e projetos de compaixão no Brasil.',
    resources: [
      {
        title: 'Guia do Mobilizador / Promotor de Missões',
        description:
          'Orientações práticas para engajar a igreja em ações missionárias locais e nacionais.',
      },
      {
        title: 'Kits de Acampamentos e Cultos Temáticos',
        description:
          'Roteiros de programação, estudos para pequenos grupos e materiais para mobilização de juventude e impacto evangelístico.',
      },
    ],
    links: [
      {
        label: 'Portal Oficial JMN',
        url: 'https://missoesnacionais.org.br',
      },
    ],
  },
  {
    id: 'apmt',
    name: 'Agência Presbiteriana de Missões Transculturais',
    shortName: 'APMT',
    logoUrl: '/images/institutions/apmt.png',
    categories: ['Gestão e Estatuto', 'Mobilização e Mídia'],
    focus:
      'Estruturação administrativa e pastoral do Conselho Missionário na igreja local, gestão de fundo missionário e cuidado de obreiros.',
    resources: [
      {
        title: 'Guia de Implantação de Conselho Missionário',
        description:
          'Diretrizes práticas de como avaliar projetos, gerir o fundo missionário com transparência e estabelecer parcerias entre igreja local e agência.',
      },
      {
        title: 'Preparo e Acompanhamento de Vocacionados',
        description:
          'Etapas claras para a igreja cuidar de quem sente o chamado até o envio ao campo.',
      },
      {
        title: 'Materiais para Igrejas',
        description: 'Revista Alcance, Podcast Missionando e kits de campanha anual.',
      },
    ],
    links: [
      {
        label: 'Portal Oficial APMT',
        url: 'https://apmt.org.br',
      },
      {
        label: 'Recursos para Igrejas APMT',
        url: 'https://apmt.org.br/igreja',
      },
    ],
  },
  {
    id: 'perspectivas',
    name: 'Perspectivas Brasil',
    shortName: 'Perspectivas Brasil',
    logoUrl: '/images/institutions/perspectivas.png',
    categories: ['Capacitação'],
    focus:
      'Formação da base bíblica, histórica, cultural e estratégica para os membros do Conselho Missionário e liderança da igreja.',
    resources: [
      {
        title: 'Curso Oficial Perspectivas',
        description:
          'Inscrever os membros do Conselho Missionário nas turmas presenciais ou online para nivelar a visão teológica e prática da equipe.',
      },
      {
        title: 'Fatia do Perspectivas',
        description:
          'Solicitar o formato reduzido (uma aula especial ou seminário de final de semana) para despertar toda a igreja local para a missão global.',
      },
    ],
    links: [
      {
        label: 'Portal Oficial Perspectivas Brasil',
        url: 'https://perspectivasbrasil.com',
      },
    ],
  },
];

export const COUNCIL_PLAYLIST: ChurchVideoPlaylist = {
  id: 'como-criar-conselho',
  title: 'Playlist & Curso: Como criar um conselho missionário',
  subtitle:
    'Série de aulas práticas para lideranças, promotores de missões e pastores estruturarem o ministério local.',
  playlistUrl:
    'https://youtube.com/playlist?list=PLx9r8HFZxYktUoAsr5ZiJ_xQdqq1WP03c&si=Ugd84sduFOQdVehT',
  embedUrl:
    'https://www.youtube-nocookie.com/embed/videoseries?list=PLx9r8HFZxYktUoAsr5ZiJ_xQdqq1WP03c',
  thumbnailUrl: '/images/church/playlist-conselho.jpg',
  description:
    'Assista ao curso em vídeo completo com passos objetivos para criar um conselho missionário, formar a equipe, planejar a captação de recursos e manter a congregação engajada na evangelização e no cuidado de missionários.',
  topics: [
    'Fundamentos bíblicos e alinhamento pastoral',
    'Como compor e estruturar a diretoria do conselho',
    'Elaboração de regimento interno e pautas de reunião',
    'Planejamento de orçamento e Ofertas de Promessa de Fé',
    'Ações dinâmicas para engajamento contínuo da congregação',
  ],
};

export const TEMPLATE_REGIMENTO_INTERNO = `REGIMENTO INTERNO DO CONSELHO MISSIONÁRIO
Igreja Local: [Nome da Igreja Local]
Data de Instituição: [Data]

CAPÍTULO I - DA NATUREZA E FINALIDADE
Art. 1º. O Conselho Missionário é um órgão auxiliar do pastorado e da liderança da igreja local, com a finalidade precípua de:
  a) Educar missiologicamente a congregação;
  b) Mobilizar oração, intercessão e apoio contínuo aos obreiros no campo;
  c) Gerir com transparência os recursos destinados ao Fundo Missionário;
  d) Identificar, acolher e orientar vocacionados na congregação;
  e) Cuidar integralmente dos missionários enviados e adotados.

CAPÍTULO II - DA COMPOSIÇÃO E MANDATO
Art. 2º. O Conselho será composto por 4 a 7 membros da igreja em plena comunhão, indicados pela liderança pastoral, exercendo as seguintes funções:
  I. Coordenador Geral (ou Promotor de Missões);
  II. Secretário e Comunicação;
  III. Relator Financeiro / Tesoureiro de Missões;
  IV. Coordenador de Intercessão;
  V. Coordenador de Cuidado Integral e Vocacionados.
§ 1º. O mandato dos membros do Conselho será de 1 (um) a 2 (dois) anos, permitida a recondução.
§ 2º. As reuniões ordinárias ocorrerão mensalmente, lavrando-se em ata todas as deliberações.

CAPÍTULO III - DO FUNDO MISSIONÁRIO E RECURSOS
Art. 3º. O sustento missionário será gerido em parceria com a tesouraria geral da igreja, composto por:
  a) Percentual orçamentário fixo aprovado pela congregação;
  b) Ofertas voluntárias exclusivas de missões e compromissos de Promessa de Fé;
  c) Campanhas e eventos especiais com finalidade específica.
Parágrafo único. A prestação de contas das entradas e envios mensais será apresentada trimestralmente à liderança e anualmente à igreja.

CAPÍTULO IV - DOS CRITÉRIOS DE ADOÇÃO DE PROJETOS E MISSIONÁRIOS
Art. 4º. Para a adoção ou envio de obreiros pelo Conselho, observar-se-ão os seguintes requisitos:
  a) Alinhamento doutrinário com a confissão de fé da igreja local;
  b) Recomendação escrita do pastor titular e idoneidade moral comprovada;
  c) Vinculação formal a uma agência missionária reconhecida (ex.: JMM, JMN, APMT ou conveniada);
  d) Compromisso de envio regular de cartas de oração e prestação de contas das atividades ministeriais.`;

export const TEMPLATE_PAUTA_REUNIAO = `PAUTA PADRÃO DE REUNIÃO MENSAL DO CONSELHO MISSIONÁRIO
Duração Estimada: 60 minutos
Periodicidade: Mensal

1. DEVOCIONAL E ALINHAMENTO MISSIOLÓGICO (10 MIN)
   - Leitura de um texto bíblico sobre a Grande Comissão ou trecho do curso Perspectivas.
   - Oração de consagração da reunião.

2. LEITURA DAS CARTAS DO CAMPO E INTERCESSÃO (15 MIN)
   - Atualização das notícias, vitórias e desafios recebidos nas cartas dos missionários adotados.
   - Momento de oração específica por cada família missionária e povo assistido.
   - Seleção dos motivos que irão para o boletim da igreja e o Minuto Missionário.

3. ANÁLISE FINANCEIRA E FUNDO MISSIONÁRIO (10 MIN)
   - Verificação das entradas do mês (orçamento e Ofertas de Promessa de Fé).
   - Confirmação do envio pontual de sustento e ofertas adicionais a cada projeto.
   - Planejamento de eventuais demandas emergenciais do campo.

4. ACOMPANHAMENTO DE VOCACIONADOS (10 MIN)
   - Acompanhamento dos membros da congregação em processo de discernimento ou preparo vocacional.
   - Encaminhamentos de mentoria, sugestões de leitura e inscrição em seminários/cursos.

5. AGENDA DE MOBILIZAÇÃO DO PRÓXIMO MÊS (15 MIN)
   - Escala dos responsáveis pelo Minuto Missionário nos cultos de domingo.
   - Envio de motivos de oração para a Escola Bíblica e Pequenos Grupos.
   - Atualização do mural (físico/digital) e alinhamento com o ministério infantil/juventude.
   - Oração final e encerramento.`;

export const COPYABLE_TEMPLATES: CopyableTemplate[] = [
  {
    id: 'regimento-interno',
    title: 'Template 1: Modelo Simplificado de Regimento Interno',
    subtitle: 'Diretrizes estatutárias e organizacionais para formalizar o conselho na igreja.',
    content: TEMPLATE_REGIMENTO_INTERNO,
  },
  {
    id: 'pauta-reuniao',
    title: 'Template 2: Pauta Padrão de Reunião Mensal (60 min)',
    subtitle: 'Roteiro prático com tempos cronometrados para reuniões dinâmicas e resolutivas.',
    content: TEMPLATE_PAUTA_REUNIAO,
  },
];
