import type { MetadataRoute } from 'next';
import { siteConfig } from '@/lib/site';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: siteConfig.name,
    short_name: siteConfig.shortName,
    description: siteConfig.description,
    start_url: '/',
    display: 'standalone',
    background_color: '#081C3A',
    theme_color: '#0D2B5C',
    lang: 'pt-BR',
    icons: [
      {
        src: '/logos/favicon_mission.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/logos/favicon_mission.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  };
}
