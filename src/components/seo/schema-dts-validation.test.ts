import { describe, it, expect } from 'vitest';
import type { WithContext, Organization, WebSite, ProfilePage, Person, Project } from 'schema-dts';
import {
  generateOrganizationAndWebsiteSchema,
  generateProfilePageSchema,
} from '@/components/seo/JsonLd';
import { mockProfile } from '@/mocks/profile';
import type { ProfileData } from '@/types/profile';

describe('Schema.org / schema-dts Validation Suite', () => {
  it('validates Organization schema matches schema-dts WithContext<Organization> specification', () => {
    const schemas = generateOrganizationAndWebsiteSchema();
    const rawOrg = schemas.find((s) => s['@type'] === 'Organization');
    expect(rawOrg).toBeDefined();

    // Type check against schema-dts Organization
    const orgSchema = rawOrg as unknown as WithContext<Extract<Organization, object>>;
    expect(orgSchema['@context']).toBe('https://schema.org');
    expect(orgSchema['@type']).toBe('Organization');
    expect(orgSchema.name).toBe('Mission App');
    expect(orgSchema.url).toBeTruthy();
    expect(orgSchema.logo).toBeDefined();
    expect(orgSchema.sameAs).toContain('https://github.com/MissionAppFaithTech');
    expect(orgSchema.founder).toBeDefined();
    expect(Array.isArray(orgSchema.knowsAbout)).toBe(true);
  });

  it('validates WebSite schema matches schema-dts WithContext<WebSite> specification', () => {
    const schemas = generateOrganizationAndWebsiteSchema();
    const rawSite = schemas.find((s) => s['@type'] === 'WebSite');
    expect(rawSite).toBeDefined();

    // Type check against schema-dts WebSite
    const siteSchema = rawSite as unknown as WithContext<Extract<WebSite, object>>;
    expect(siteSchema['@context']).toBe('https://schema.org');
    expect(siteSchema['@type']).toBe('WebSite');
    expect(siteSchema.name).toBe('Mission App');
    expect(siteSchema.inLanguage).toBe('pt-BR');
    expect(siteSchema.publisher).toBeDefined();
  });

  it('validates ProfilePage schema matches schema-dts WithContext<ProfilePage> specification', () => {
    const schemas = generateProfilePageSchema(mockProfile, `/user/${mockProfile.username}`);
    const rawProfilePage = schemas.find((s) => s['@type'] === 'ProfilePage');
    expect(rawProfilePage).toBeDefined();

    // Type check against schema-dts ProfilePage
    const profilePageSchema = rawProfilePage as unknown as WithContext<
      Extract<ProfilePage, object>
    >;
    expect(profilePageSchema['@context']).toBe('https://schema.org');
    expect(profilePageSchema['@type']).toBe('ProfilePage');
    expect(profilePageSchema.url).toContain(mockProfile.username);
    expect(profilePageSchema.mainEntity).toBeDefined();
    expect(profilePageSchema.inLanguage).toBe('pt-BR');
    expect(profilePageSchema.isPartOf).toBeDefined();
  });

  it('validates Person schema conforms strictly to schema.org entity fields', () => {
    const schemas = generateProfilePageSchema(mockProfile, `/user/${mockProfile.username}`);
    const rawPerson = schemas.find((s) => s['@type'] === 'Person');
    expect(rawPerson).toBeDefined();

    const personSchema = rawPerson as unknown as Extract<Person, object>;
    expect(rawPerson?.['@type']).toBe('Person');
    expect(personSchema.name).toBe(mockProfile.displayName);
    expect(personSchema.alternateName).toBe(mockProfile.username);
    expect(personSchema.identifier).toBe(mockProfile.username);
    expect(personSchema.jobTitle).toBe(mockProfile.roleDescription);
    expect(personSchema.homeLocation).toBeDefined();
    expect(personSchema.workLocation).toBeDefined();
    expect(personSchema.affiliation).toBeDefined();
    expect(personSchema.memberOf).toBeDefined();
    expect(personSchema.email).toBe(mockProfile.contact?.publicEmail);
    expect(personSchema.telephone).toBe(mockProfile.contact?.publicPhone);
  });

  it('validates Project and DonateAction schema conforms to schema.org Project specification', () => {
    const schemas = generateProfilePageSchema(mockProfile, `/user/${mockProfile.username}`);
    const rawProject = schemas.find((s) => s['@type'] === 'Project');
    expect(rawProject).toBeDefined();

    const projectSchema = rawProject as unknown as Extract<Project, object>;
    expect(rawProject?.['@type']).toBe('Project');
    expect(projectSchema.name).toBe(mockProfile.impactProject?.title);
    expect(projectSchema.description).toBe(mockProfile.impactProject?.description);
    expect(projectSchema.image).toBeDefined();
    expect(projectSchema.funder).toBeDefined();
    expect(projectSchema.potentialAction).toBeDefined();
    expect((rawProject as Record<string, unknown>).video).toBeDefined();
  });

  it('handles profiles without impact project, videos, or contact details gracefully', () => {
    const minimalProfile: ProfileData = {
      username: 'joao_silva',
      displayName: 'João Silva',
      roleDescription: 'Missionário no Sertão',
      about: {
        introduction: 'Atuação evangelística e social no Nordeste.',
        missionHistory: 'Chamado em 2020.',
        originLocation: 'Recife, PE',
        currentLocation: 'Juazeiro do Norte, CE',
        missionaryAgency: 'JOCUM',
        faithCommunity: 'Igreja Batista',
        prayerRequests: 'Saúde e provisão.',
        lifeVerse: 'Romanos 10:14',
      },
    };

    const schemas = generateProfilePageSchema(minimalProfile, '/user/joao_silva');

    expect(schemas).toHaveLength(2); // ProfilePage + Person, no Project
    const personSchema = schemas.find((s) => s['@type'] === 'Person');
    expect(personSchema).toBeDefined();
    expect(personSchema?.email).toBeUndefined();
    expect(personSchema?.telephone).toBeUndefined();

    const projectSchema = schemas.find((s) => s['@type'] === 'Project');
    expect(projectSchema).toBeUndefined();
  });
});
