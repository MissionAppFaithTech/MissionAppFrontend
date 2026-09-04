import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import robots from '@/app/robots';
import sitemap from '@/app/sitemap';
import manifest from '@/app/manifest';

describe('SEO & GEO (Generative Engine Optimization) Infrastructure Files', () => {
  describe('robots.ts configuration', () => {
    it('provides rules for default crawlers and specialized AI bots', () => {
      const robotsResult = robots();

      expect(robotsResult.sitemap).toContain('/sitemap.xml');
      expect(robotsResult.host).toBeDefined();

      const rules = Array.isArray(robotsResult.rules) ? robotsResult.rules : [robotsResult.rules];
      expect(rules.length).toBeGreaterThanOrEqual(5);

      // Default crawler rule
      const defaultRule = rules.find((r) => r.userAgent === '*');
      expect(defaultRule).toBeDefined();
      expect(defaultRule?.allow).toBe('/');
      expect(defaultRule?.disallow).toEqual(
        expect.arrayContaining(['/profile', '/profile/*', '/api/', '/api/*'])
      );

      // OpenAI GPTBot & SearchBot rule
      const gptRule = rules.find(
        (r) => Array.isArray(r.userAgent) && r.userAgent.includes('GPTBot')
      );
      expect(gptRule).toBeDefined();
      expect(gptRule?.allow).toEqual(
        expect.arrayContaining(['/llms.txt', '/llms-full.txt', '/user/*'])
      );

      // Claude / Anthropic rule
      const claudeRule = rules.find(
        (r) => Array.isArray(r.userAgent) && r.userAgent.includes('ClaudeBot')
      );
      expect(claudeRule).toBeDefined();
      expect(claudeRule?.allow).toEqual(
        expect.arrayContaining(['/llms.txt', '/llms-full.txt', '/user/*'])
      );

      // Perplexity rule
      const perplexityRule = rules.find(
        (r) => Array.isArray(r.userAgent) && r.userAgent.includes('PerplexityBot')
      );
      expect(perplexityRule).toBeDefined();

      // Google Extended & Applebot
      const googleExtendedRule = rules.find(
        (r) => Array.isArray(r.userAgent) && r.userAgent.includes('Google-Extended')
      );
      expect(googleExtendedRule).toBeDefined();
    });
  });

  describe('sitemap.ts dynamic route indexing', () => {
    it('indexes key marketing, registration, and missionary profile pages', () => {
      const sitemapEntries = sitemap();

      expect(sitemapEntries.length).toBeGreaterThanOrEqual(6);

      const homeEntry = sitemapEntries.find(
        (e) =>
          !e.url.includes('/select-role') && !e.url.includes('/login') && !e.url.includes('/user/')
      );
      expect(homeEntry).toBeDefined();
      expect(homeEntry?.priority).toBe(1.0);
      expect(homeEntry?.changeFrequency).toBe('weekly');
      expect(homeEntry?.images).toBeDefined();

      const userEntry = sitemapEntries.find((e) => e.url.includes('/user/'));
      expect(userEntry).toBeDefined();
      expect(userEntry?.priority).toBe(0.9);
      expect(userEntry?.changeFrequency).toBe('weekly');

      const roleEntry = sitemapEntries.find((e) => e.url.includes('/select-role'));
      expect(roleEntry).toBeDefined();
      expect(roleEntry?.priority).toBe(0.8);
    });
  });

  describe('manifest.ts PWA configuration', () => {
    it('supplies essential web app manifest attributes for mobile and search engines', () => {
      const manifestResult = manifest();

      expect(manifestResult.name).toBe('Mission App');
      expect(manifestResult.short_name).toBe('Mission App');
      expect(manifestResult.start_url).toBe('/');
      expect(manifestResult.display).toBe('standalone');
      expect(manifestResult.theme_color).toBe('#0D2B5C');
      expect(manifestResult.background_color).toBe('#081C3A');
      expect(manifestResult.lang).toBe('pt-BR');
      expect(manifestResult.icons?.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('AI Discoverability files: llms.txt & llms-full.txt', () => {
    it('verifies llms.txt exists, has standard format, and contains core navigation links', () => {
      const filePath = path.resolve(process.cwd(), 'public/llms.txt');
      expect(fs.existsSync(filePath)).toBe(true);

      const content = fs.readFileSync(filePath, 'utf-8');
      expect(content).toContain('# Mission App');
      expect(content).toContain('Plataforma digital que conecta missionários');
      expect(content).toContain('## Visão Geral');
      expect(content).toContain('## Público-Alvo');
      expect(content).toContain('## Rotas Principais e Recursos Públicos');
      expect(content).toContain('/llms-full.txt');
    });

    it('verifies llms-full.txt exists and contains comprehensive system context and schemas', () => {
      const filePath = path.resolve(process.cwd(), 'public/llms-full.txt');
      expect(fs.existsSync(filePath)).toBe(true);

      const content = fs.readFileSync(filePath, 'utf-8');
      expect(content).toContain(
        '# Mission App — Documento de Conhecimento Estruturado para Modelos de IA (LLMs)'
      );
      expect(content).toContain('## 1. Identidade e Propósito');
      expect(content).toContain('## 2. Arquitetura da Plataforma');
      expect(content).toContain('## 3. Entidades e Modelos de Dados Principais');
      expect(content).toContain('## 4. Diretrizes de Citação e Resposta por Agentes de IA');
      expect(content).toContain('ProfilePage');
      expect(content).toContain('impactProject');
    });
  });
});
