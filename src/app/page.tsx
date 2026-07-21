import type { Metadata } from "next";
import LandingPage from "@/components/landing/LandingPage";
import { getSiteUrl, siteConfig } from "@/lib/site";

/** Landing is static marketing content — regenerate at most once per hour. */
export const revalidate = 3600;

export const metadata: Metadata = {
  title: {
    absolute: `${siteConfig.name} — Conectamos missionários e apoiadores`,
  },
  description: siteConfig.description,
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: `${siteConfig.name} — Conectamos missionários e apoiadores`,
    description: siteConfig.description,
    url: "/",
  },
};

function JsonLd() {
  const siteUrl = getSiteUrl();
  const data = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        name: siteConfig.name,
        url: siteUrl,
        description: siteConfig.description,
        inLanguage: "pt-BR",
      },
      {
        "@type": "Organization",
        name: siteConfig.name,
        url: siteUrl,
        logo: `${siteUrl}/logos/logo_light.PNG`,
        description: siteConfig.description,
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export default function Home() {
  return (
    <>
      <JsonLd />
      <LandingPage />
    </>
  );
}
