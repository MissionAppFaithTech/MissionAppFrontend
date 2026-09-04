import { test, expect } from '@playwright/test';
import { mockProfile } from '../src/mocks/profile';

test.describe('SEO & GEO (Generative Engine Optimization) End-to-End Verification', () => {
  test('validates Landing Page HTML metadata and Schema.org JSON-LD structured data', async ({
    page,
  }) => {
    await page.goto('/');

    // Validate page title and meta description
    await expect(page).toHaveTitle(/Mission App/);
    const metaDesc = page.locator('meta[name="description"]');
    await expect(metaDesc).toHaveAttribute('content', /Plataforma que conecta missionários/);

    // Validate OpenGraph and Twitter tags
    const ogTitle = page.locator('meta[property="og:title"]');
    await expect(ogTitle).toHaveAttribute('content', /Mission App/);

    const twitterCard = page.locator('meta[name="twitter:card"]');
    await expect(twitterCard).toHaveAttribute('content', 'summary_large_image');

    // Validate Canonical Link
    const canonical = page.locator('link[rel="canonical"]');
    await expect(canonical).toHaveAttribute('href', /http/);

    // Validate JSON-LD script for Organization & WebSite
    const jsonLdScript = page.locator('script[type="application/ld+json"]').first();
    await expect(jsonLdScript).toBeAttached();

    const jsonLdContent = await jsonLdScript.textContent();
    expect(jsonLdContent).toBeTruthy();
    const parsed = JSON.parse(jsonLdContent!);
    const schemas = Array.isArray(parsed) ? parsed : parsed['@graph'] || [parsed];

    const org = schemas.find((s: Record<string, unknown>) => s['@type'] === 'Organization');
    expect(org).toBeDefined();
    expect(org?.name).toBe('Mission App');

    const website = schemas.find((s: Record<string, unknown>) => s['@type'] === 'WebSite');
    expect(website).toBeDefined();
  });

  test('validates Public Missionary Profile Page dynamic SEO, OpenGraph and JSON-LD entities', async ({
    page,
  }) => {
    await page.goto(`/user/${mockProfile.username}`);

    // Title & OpenGraph
    await expect(page).toHaveTitle(new RegExp(mockProfile.displayName));
    const ogType = page.locator('meta[property="og:type"]');
    await expect(ogType).toHaveAttribute('content', 'profile');

    // Dynamic JSON-LD structured data extraction
    const jsonLdScripts = page.locator('script[type="application/ld+json"]');
    const count = await jsonLdScripts.count();
    expect(count).toBeGreaterThan(0);

    let foundProfilePage = false;
    let foundPerson = false;
    let foundProject = false;

    for (let i = 0; i < count; i++) {
      const content = await jsonLdScripts.nth(i).textContent();
      if (!content) continue;
      const parsed = JSON.parse(content);
      const items = Array.isArray(parsed) ? parsed : parsed['@graph'] || [parsed];

      for (const item of items) {
        if (item['@type'] === 'ProfilePage') foundProfilePage = true;
        if (item['@type'] === 'Person') foundPerson = true;
        if (item['@type'] === 'Project') foundProject = true;
      }
    }

    expect(foundProfilePage).toBe(true);
    expect(foundPerson).toBe(true);
    expect(foundProject).toBe(true);
  });

  test('validates robots.txt endpoint serves rules for default crawlers and AI search engines', async ({
    request,
  }) => {
    const response = await request.get('/robots.txt');
    expect(response.status()).toBe(200);

    const text = await response.text();
    expect(text).toContain('User-Agent: *');
    expect(text).toContain('Disallow: /profile');
    expect(text).toContain('Disallow: /api/');
    expect(text).toContain('Sitemap:');

    // AI Bots user agents
    expect(text).toContain('GPTBot');
    expect(text).toContain('ClaudeBot');
    expect(text).toContain('PerplexityBot');
    expect(text).toContain('Google-Extended');
    expect(text).toContain('Applebot-Extended');
  });

  test('validates sitemap.xml endpoint serves valid XML structure with public routes', async ({
    request,
  }) => {
    const response = await request.get('/sitemap.xml');
    expect(response.status()).toBe(200);

    const text = await response.text();
    expect(text).toContain('<?xml');
    expect(text).toContain('<urlset');
    expect(text).toContain('<loc>');
    expect(text).toContain('/user/');
    expect(text).toContain('/select-role');
  });

  test('validates Web App Manifest endpoint serves valid PWA metadata', async ({ request }) => {
    const response = await request.get('/manifest.webmanifest');
    expect(response.status()).toBe(200);

    const json = await response.json();
    expect(json.name).toBe('Mission App');
    expect(json.short_name).toBe('Mission App');
    expect(json.start_url).toBe('/');
    expect(json.display).toBe('standalone');
    expect(json.icons.length).toBeGreaterThan(0);
  });

  test('validates llms.txt and llms-full.txt serve LLM discoverability context', async ({
    request,
  }) => {
    const llmsRes = await request.get('/llms.txt');
    expect(llmsRes.status()).toBe(200);
    const llmsText = await llmsRes.text();
    expect(llmsText).toContain('# Mission App');
    expect(llmsText).toContain('/llms-full.txt');

    const fullRes = await request.get('/llms-full.txt');
    expect(fullRes.status()).toBe(200);
    const fullText = await fullRes.text();
    expect(fullText).toContain(
      '# Mission App — Documento de Conhecimento Estruturado para Modelos de IA (LLMs)'
    );
    expect(fullText).toContain('ProfilePage');
  });
});
