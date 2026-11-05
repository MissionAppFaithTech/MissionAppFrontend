/**
 * Canonical site origin for metadata, sitemap and robots.
 * Set NEXT_PUBLIC_SITE_URL in production (e.g. https://missionapp.com.br).
 */
export function getSiteUrl(): string {
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '');
  if (fromEnv) return fromEnv;

  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL.replace(/\/$/, '')}`;
  }

  return 'http://localhost:3000';
}

export const siteConfig = {
  name: 'Mission App',
  shortName: 'Mission App',
  description:
    'Plataforma de campanhas missionárias recorrentes: divulga missionários e projetos sociais e fortalece os conselhos missionários das igrejas.',
  locale: 'pt_BR',
  ogImage: '/landing-page/landing-page.png',
} as const;
