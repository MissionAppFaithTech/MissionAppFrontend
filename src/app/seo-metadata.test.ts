import { describe, it, expect, vi } from 'vitest';
import * as cheerio from 'cheerio';
import { metadata as rootMetadata } from '@/app/layout';
import { generateMetadata as generateUserMetadata } from '@/app/user/[username]/page';
import { siteConfig } from '@/lib/site';
import { getPublicProfile } from '@/lib/server/publicProfile';
import { mockProfile } from '@/mocks/profile';
import { publicProfileFixture } from '@/test/publicProfile';

vi.mock('@/lib/server/publicProfile', () => ({ getPublicProfile: vi.fn() }));

describe('SEO Metadata & OpenGraph Specifications', () => {
  describe('Root Layout Metadata', () => {
    it('defines accurate title template, description, and canonical URL', () => {
      expect(rootMetadata.title).toEqual({
        default: `${siteConfig.name} — Campanhas Missionárias Recorrentes`,
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
    it('generates metadata from the public profile of the backend', async () => {
      vi.mocked(getPublicProfile).mockResolvedValue(publicProfileFixture);
      const metadata = await generateUserMetadata({
        params: Promise.resolve({ username: 'samuel_missionary' }),
      });

      expect(metadata.title).toBe('Samuel Mendonça (@samuel_missionary)');
      expect(metadata.description).toContain(publicProfileFixture.about.introduction);
      expect(metadata.alternates?.canonical).toBe('/user/samuel_missionary');
      expect((metadata.openGraph as Record<string, unknown>)?.type).toBe('profile');
      expect(metadata.openGraph?.title).toContain('Samuel Mendonça');
      expect((metadata.twitter as Record<string, unknown>)?.card).toBe('summary_large_image');
    });

    it('falls back to the mini-bio and keeps the description short', async () => {
      vi.mocked(getPublicProfile).mockResolvedValue({
        ...publicProfileFixture,
        about: { ...publicProfileFixture.about, introduction: '' },
      });
      const withBio = await generateUserMetadata({
        params: Promise.resolve({ username: 'samuel_missionary' }),
      });
      expect(withBio.description).toBe('Samuel Mendonça: Missionário na África do Sul');

      vi.mocked(getPublicProfile).mockResolvedValue({
        ...publicProfileFixture,
        about: { ...publicProfileFixture.about, introduction: 'a'.repeat(200) },
      });
      const long = await generateUserMetadata({
        params: Promise.resolve({ username: 'samuel_missionary' }),
      });
      expect(long.description).toBe(`Samuel Mendonça: ${'a'.repeat(150)}…`);

      vi.mocked(getPublicProfile).mockResolvedValue({
        ...publicProfileFixture,
        roleDescription: '',
        about: { ...publicProfileFixture.about, introduction: '' },
      });
      const empty = await generateUserMetadata({
        params: Promise.resolve({ username: 'samuel_missionary' }),
      });
      expect(empty.description).toContain('Perfil público de Samuel Mendonça');
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
