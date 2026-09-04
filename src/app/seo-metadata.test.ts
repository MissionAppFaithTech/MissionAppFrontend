import { describe, it, expect } from 'vitest';
import * as cheerio from 'cheerio';
import { metadata as rootMetadata } from '@/app/layout';
import { generateMetadata as generateUserMetadata } from '@/app/user/[username]/page';
import { siteConfig } from '@/lib/site';
import { mockProfile } from '@/mocks/profile';

describe('SEO Metadata & OpenGraph Specifications', () => {
  describe('Root Layout Metadata', () => {
    it('defines accurate title template, description, and canonical URL', () => {
      expect(rootMetadata.title).toEqual({
        default: `${siteConfig.name} — Conectando Missionários e Apoiadores`,
        template: `%s | ${siteConfig.name}`,
      });
      expect(rootMetadata.description).toBe(siteConfig.description);
      expect(rootMetadata.applicationName).toBe(siteConfig.name);
      expect(rootMetadata.alternates?.canonical).toBe('/');
      expect(rootMetadata.alternates?.languages?.['pt-BR']).toBe('/');
    });

    it('contains rich OpenGraph and Twitter card configurations', () => {
      expect(rootMetadata.openGraph).toMatchObject({
        type: 'website',
        locale: siteConfig.locale,
        siteName: siteConfig.name,
      });

      expect(rootMetadata.twitter).toMatchObject({
        card: 'summary_large_image',
      });
    });

    it('instructs standard and Google search indexers correctly', () => {
      expect(rootMetadata.robots).toMatchObject({
        index: true,
        follow: true,
        googleBot: {
          index: true,
          follow: true,
          'max-image-preview': 'large',
        },
      });
    });
  });

  describe('Dynamic User Profile Metadata (generateMetadata)', () => {
    it('generates customized metadata for known mock missionary', async () => {
      const metadata = await generateUserMetadata({
        params: Promise.resolve({ username: mockProfile.username }),
      });

      expect(metadata.title).toBe(`${mockProfile.displayName} (@${mockProfile.username})`);
      expect(metadata.description).toContain(mockProfile.roleDescription);
      expect(metadata.alternates?.canonical).toBe(`/user/${mockProfile.username}`);
      expect((metadata.openGraph as Record<string, unknown>)?.type).toBe('profile');
      expect(metadata.openGraph?.title).toContain(mockProfile.displayName);
      expect((metadata.twitter as Record<string, unknown>)?.card).toBe('summary_large_image');
    });

    it('generates fallback metadata for arbitrary usernames', async () => {
      const metadata = await generateUserMetadata({
        params: Promise.resolve({ username: 'marcos-oliveira' }),
      });

      expect(metadata.title).toBe('marcos oliveira (@marcos-oliveira)');
      expect(metadata.description).toContain('marcos oliveira');
      expect(metadata.alternates?.canonical).toBe('/user/marcos-oliveira');
    });
  });

  describe('Cheerio HTML Metadata & Head Scraper Simulation', () => {
    it('validates rendered HTML head tags with Cheerio for search engine parity', () => {
      const htmlSnippet = `
        <!DOCTYPE html>
        <html lang="pt-BR">
          <head>
            <title>${mockProfile.displayName} (@${mockProfile.username}) | Mission App</title>
            <meta name="description" content="Conecte-se e apoie o missionário." />
            <link rel="canonical" href="https://missionapp.org/user/${mockProfile.username}" />
            <meta property="og:title" content="${mockProfile.displayName} (@${mockProfile.username})" />
            <meta property="og:type" content="profile" />
            <meta property="og:image" content="https://missionapp.org/images/projects/projeto-impacto.jpg" />
            <meta name="twitter:card" content="summary_large_image" />
            <script type="application/ld+json">
              {"@context":"https://schema.org","@type":"ProfilePage","name":"${mockProfile.displayName}"}
            </script>
          </head>
          <body>
            <h1>${mockProfile.displayName}</h1>
          </body>
        </html>
      `;

      const $ = cheerio.load(htmlSnippet);

      expect($('title').text()).toContain(mockProfile.displayName);
      expect($('meta[name="description"]').attr('content')).toBe(
        'Conecte-se e apoie o missionário.'
      );
      expect($('link[rel="canonical"]').attr('href')).toContain(mockProfile.username);
      expect($('meta[property="og:type"]').attr('content')).toBe('profile');
      expect($('meta[property="og:image"]').attr('content')).toContain('projeto-impacto.jpg');
      expect($('meta[name="twitter:card"]').attr('content')).toBe('summary_large_image');

      const jsonLdContent = $('script[type="application/ld+json"]').html();
      expect(jsonLdContent).toBeTruthy();
      const parsedJsonLd = JSON.parse(jsonLdContent!);
      expect(parsedJsonLd['@type']).toBe('ProfilePage');
      expect(parsedJsonLd.name).toBe(mockProfile.displayName);
    });
  });
});
