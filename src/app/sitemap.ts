import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/site";

/** Public marketing / entry routes — keep in sync with crawlable pages. */
const publicRoutes: Array<{
  path: string;
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
  priority: number;
}> = [
  { path: "/", changeFrequency: "weekly", priority: 1 },
  { path: "/select-role", changeFrequency: "monthly", priority: 0.8 },
  { path: "/login", changeFrequency: "monthly", priority: 0.7 },
  { path: "/register/missionaries", changeFrequency: "monthly", priority: 0.7 },
  { path: "/register/supporters", changeFrequency: "monthly", priority: 0.7 },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = getSiteUrl();
  const lastModified = new Date();

  return publicRoutes.map(({ path, changeFrequency, priority }) => ({
    url: path === "/" ? baseUrl : `${baseUrl}${path}`,
    lastModified,
    changeFrequency,
    priority,
  }));
}
