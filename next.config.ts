import type { NextConfig } from 'next';
import path from 'path';

const isDev = process.env.NODE_ENV === 'development';

const nextConfig: NextConfig = {
  // Server-first rendering (ADR-0005): `use cache` + `cacheLife` replace the
  // route segment configs (`revalidate`, `dynamic`).
  cacheComponents: true,
  // A `<Link>` prefetches the route's shared App Shell (static + cached parts);
  // URL-specific content streams in after navigation. No `prefetch={true}`
  // links needed migrating (2026-11-03).
  partialPrefetching: true,
  cacheLife: {
    // Public pages shared by every visitor (ADR-0004): same 300 s window the
    // routes used with `revalidate = 300`, refreshed at once by `updateTag`.
    public: {
      stale: 300,
      revalidate: 300,
      expire: 60 * 60 * 24,
    },
  },
  turbopack: {
    root: path.resolve(__dirname),
  },
  images: {
    // Avoid serving stale optimized images after replacing files in public/
    minimumCacheTTL: isDev ? 0 : 14400,
  },
  async redirects() {
    return [
      {
        source: '/profile',
        destination: '/profile/sobre',
        permanent: false,
      },
      {
        source: '/profile/supporter',
        destination: '/profile/supporter/missionarios',
        permanent: false,
      },
    ];
  },
  ...(isDev && {
    async headers() {
      const noStore = [{ key: 'Cache-Control', value: 'no-store, must-revalidate' }];
      return [
        { source: '/landing-page/:path*', headers: noStore },
        { source: '/icons/:path*', headers: noStore },
        { source: '/images/:path*', headers: noStore },
        { source: '/logos/:path*', headers: noStore },
      ];
    },
  }),
};

export default nextConfig;
