import type { ReactElement } from 'react';
import { getSiteUrl, siteConfig } from '@/lib/site';
import type { ProfileData } from '@/types/profile';

type JsonLdProps = {
  data: Record<string, unknown> | Array<Record<string, unknown>>;
};

/**
 * Injeta dados estruturados (Schema.org JSON-LD) de forma segura para motores de busca e IAs.
 */
export default function JsonLd({ data }: JsonLdProps): ReactElement {
  return (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />
  );
}

/**
 * Gera Schema JSON-LD da Organização Mission App e Website.
 */
export function generateOrganizationAndWebsiteSchema(): Array<Record<string, unknown>> {
  const baseUrl = getSiteUrl();

  return [
    {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      '@id': `${baseUrl}/#organization`,
      name: siteConfig.name,
      alternateName: 'MissionApp FaithTech',
      url: baseUrl,
      logo: {
        '@type': 'ImageObject',
        url: `${baseUrl}/logos/favicon_mission.png`,
        width: 512,
        height: 512,
      },
      description: siteConfig.description,
      sameAs: ['https://github.com/MissionAppFaithTech'],
      founder: {
        '@type': 'Organization',
        name: 'FaithTech',
      },
      knowsAbout: [
        'Missões Cristãs',
        'Projetos Sociais',
        'Apoio a Missionários',
        'Doações para Missões',
        'Intercessão e Oração',
      ],
    },
    {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      '@id': `${baseUrl}/#website`,
      url: baseUrl,
      name: siteConfig.name,
      description: siteConfig.description,
      publisher: {
        '@id': `${baseUrl}/#organization`,
      },
      inLanguage: 'pt-BR',
    },
  ];
}

/**
 * Gera Schema JSON-LD detalhado para a página pública de perfil do missionário.
 */
export function generateProfilePageSchema(
  profile: ProfileData,
  pageUrl: string
): Array<Record<string, unknown>> {
  const baseUrl = getSiteUrl();
  const absolutePageUrl = pageUrl.startsWith('http') ? pageUrl : `${baseUrl}${pageUrl}`;

  const personSchema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    '@id': `${absolutePageUrl}/#person`,
    name: profile.displayName,
    alternateName: profile.username,
    identifier: profile.username,
    jobTitle: profile.roleDescription,
    description: profile.about.introduction,
    url: absolutePageUrl,
    homeLocation: {
      '@type': 'Place',
      name: profile.about.originLocation,
    },
    workLocation: {
      '@type': 'Place',
      name: profile.about.currentLocation,
    },
  };

  if (profile.about.missionaryAgency) {
    personSchema.affiliation = {
      '@type': 'Organization',
      name: profile.about.missionaryAgency,
    };
  }

  if (profile.about.faithCommunity) {
    personSchema.memberOf = {
      '@type': 'Organization',
      name: profile.about.faithCommunity,
    };
  }

  if (profile.contact?.publicEmail) {
    personSchema.email = profile.contact.publicEmail;
  }

  if (profile.contact?.publicPhone) {
    personSchema.telephone = profile.contact.publicPhone;
  }

  const profilePageSchema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'ProfilePage',
    '@id': absolutePageUrl,
    url: absolutePageUrl,
    name: `${profile.displayName} (@${profile.username}) | Mission App`,
    description: `Perfil público e projetos de impacto de ${profile.displayName} no Mission App.`,
    mainEntity: {
      '@id': `${absolutePageUrl}/#person`,
    },
    inLanguage: 'pt-BR',
    isPartOf: {
      '@id': `${baseUrl}/#website`,
    },
  };

  const schemas: Array<Record<string, unknown>> = [profilePageSchema, personSchema];

  // Adiciona Schema de Projeto de Impacto e Vídeo se disponível
  if (profile.impactProject) {
    const project = profile.impactProject;
    const projectSchema: Record<string, unknown> = {
      '@context': 'https://schema.org',
      '@type': 'Project',
      '@id': `${absolutePageUrl}/#impact-project`,
      name: project.title,
      description: project.description,
      image: project.bannerUrl || project.imageUrl,
      funder: {
        '@id': `${absolutePageUrl}/#person`,
      },
      potentialAction: {
        '@type': 'DonateAction',
        target: absolutePageUrl,
        name: `Ofertar no projeto ${project.title}`,
        description: `Doação e apoio financeiro para o projeto de impacto de ${profile.displayName}`,
      },
    };

    if (project.videoUrl) {
      projectSchema.video = {
        '@type': 'VideoObject',
        name: `Vídeo de apresentação: ${project.title}`,
        description: project.description.slice(0, 150),
        thumbnailUrl: project.bannerUrl || project.imageUrl,
        embedUrl: project.videoUrl,
        uploadDate: '2026-01-01T00:00:00Z',
      };
    }

    schemas.push(projectSchema);
  }

  return schemas;
}
