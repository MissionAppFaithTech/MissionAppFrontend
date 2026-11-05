import type { MetadataRoute } from 'next';
import { getSiteUrl } from '@/lib/site';

/** Public marketing / entry routes — keep in sync with crawlable pages. */
const publicRoutes: Array<{
  path: string;
  changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency'];
  priority: number;
  images?: string[];
}> = [
  {
    path: '/',
    changeFrequency: 'weekly',
    priority: 1.0,
    images: ['/landing-page/landing-page.png', '/landing-page/background.png'],
  },
  {
    path: '/leve-o-mission-app-para-sua-igreja',
    changeFrequency: 'weekly',
    priority: 0.9,
  },
  {
    path: '/conselho-missionario',
    changeFrequency: 'monthly',
    priority: 0.8,
  },
  {
    path: '/select-role',
    changeFrequency: 'monthly',
    priority: 0.8,
  },
  {
    path: '/register/missionaries',
    changeFrequency: 'monthly',
    priority: 0.8,
  },
  {
    path: '/register/supporters',
    changeFrequency: 'monthly',
    priority: 0.8,
  },
  {
    path: '/login',
    changeFrequency: 'monthly',
    priority: 0.5,
  },
  {
    path: '/forgot-password',
    changeFrequency: 'yearly',
    priority: 0.3,
  },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = getSiteUrl();
  const lastModified = new Date();

  return publicRoutes.map(({ path, changeFrequency, priority, images }) => ({
    url: path === '/' ? baseUrl : `${baseUrl}${path}`,
    lastModified,
    changeFrequency,
    priority,
    images: images ? images.map((img) => `${baseUrl}${img}`) : undefined,
  }));
}
