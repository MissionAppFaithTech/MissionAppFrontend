import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import JsonLd, {
  generateOrganizationAndWebsiteSchema,
  generateProfilePageSchema,
} from '@/components/seo/JsonLd';
import { mockProfile } from '@/mocks/profile';

describe('JsonLd Component & Schema Generators', () => {
  it('renders JSON-LD script tag with provided structured data', () => {
    const mockData = { '@context': 'https://schema.org', '@type': 'WebSite', name: 'Test Site' };
    const { container } = render(<JsonLd data={mockData} />);

    const script = container.querySelector('script[type="application/ld+json"]');
    expect(script).toBeInTheDocument();
    expect(script?.textContent).toContain('Test Site');
  });

  it('generates valid Organization and WebSite schema array', () => {
    const schemas = generateOrganizationAndWebsiteSchema();
    expect(schemas).toHaveLength(2);

    const orgSchema = schemas.find((s) => s['@type'] === 'Organization');
    expect(orgSchema).toBeDefined();
    expect(orgSchema?.name).toBe('Mission App');
    expect(orgSchema?.founder).toEqual({ '@type': 'Organization', name: 'FaithTech' });

    const webSiteSchema = schemas.find((s) => s['@type'] === 'WebSite');
    expect(webSiteSchema).toBeDefined();
    expect(webSiteSchema?.inLanguage).toBe('pt-BR');
  });

  it('generates complete ProfilePage, Person, Project, and DonateAction schemas for public user profile', () => {
    const schemas = generateProfilePageSchema(mockProfile, `/_SamiMendonca`);

    const profilePage = schemas.find((s) => s['@type'] === 'ProfilePage');
    expect(profilePage).toBeDefined();

    const person = schemas.find((s) => s['@type'] === 'Person');
    expect(person).toBeDefined();
    expect(person?.name).toBe(mockProfile.displayName);
    expect(person?.identifier).toBe(mockProfile.username);
    expect(person?.email).toBe(mockProfile.contact?.publicEmail);
    expect(person?.telephone).toBe(mockProfile.contact?.publicPhone);

    const project = schemas.find((s) => s['@type'] === 'Project');
    expect(project).toBeDefined();
    expect(project?.name).toBe(mockProfile.impactProject?.title);
    expect(project?.potentialAction).toEqual(
      expect.objectContaining({
        '@type': 'DonateAction',
      })
    );
  });
});
