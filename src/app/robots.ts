import type { MetadataRoute } from 'next';
import { getSiteUrl } from '@/lib/site';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = getSiteUrl();

  return {
    rules: [
      {
        // Padrão para todos os buscadores convencionais
        userAgent: '*',
        allow: '/',
        disallow: ['/profile', '/profile/*', '/api/', '/api/*'],
      },
      {
        // OpenAI / ChatGPT Search & Browsing
        userAgent: ['GPTBot', 'ChatGPT-User', 'OAI-SearchBot'],
        allow: ['/', '/user/*', '/select-role', '/llms.txt', '/llms-full.txt'],
        disallow: ['/profile', '/profile/*', '/api/'],
      },
      {
        // Anthropic / Claude Web Crawlers
        userAgent: ['ClaudeBot', 'anthropic-ai'],
        allow: ['/', '/user/*', '/select-role', '/llms.txt', '/llms-full.txt'],
        disallow: ['/profile', '/profile/*', '/api/'],
      },
      {
        // Perplexity AI Search Engine
        userAgent: ['PerplexityBot'],
        allow: ['/', '/user/*', '/select-role', '/llms.txt', '/llms-full.txt'],
        disallow: ['/profile', '/profile/*', '/api/'],
      },
      {
        // Googlebot & Gemini Extended Discovery
        userAgent: ['Googlebot', 'Google-Extended'],
        allow: '/',
        disallow: ['/profile', '/profile/*', '/api/'],
      },
      {
        // Applebot (Siri & Apple Intelligence)
        userAgent: ['Applebot', 'Applebot-Extended'],
        allow: '/',
        disallow: ['/profile', '/profile/*', '/api/'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}
