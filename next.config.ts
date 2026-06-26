import type { NextConfig } from "next";
import path from "path";

const isDev = process.env.NODE_ENV === "development";

const nextConfig: NextConfig = {
  turbopack: {
    root: path.resolve(__dirname),
  },
  images: {
    // Avoid serving stale optimized images after replacing files in public/
    minimumCacheTTL: isDev ? 0 : 14400,
  },
  ...(isDev && {
    async headers() {
      const noStore = [{ key: "Cache-Control", value: "no-store, must-revalidate" }];
      return [
        { source: "/landing-page/:path*", headers: noStore },
        { source: "/icons/:path*", headers: noStore },
        { source: "/images/:path*", headers: noStore },
        { source: "/logos/:path*", headers: noStore },
      ];
    },
  }),
};

export default nextConfig;
