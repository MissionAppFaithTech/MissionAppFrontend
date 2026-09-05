import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import './globals.css';
import { DM_Sans } from 'next/font/google';
import { Providers } from './providers';
import JsonLd, { generateOrganizationAndWebsiteSchema } from '@/components/seo/JsonLd';
import SkipToContent from '@/components/common/SkipToContent';
import { getSiteUrl, siteConfig } from '@/lib/site';

const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-dm-sans',
});

const siteUrl = getSiteUrl();

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${siteConfig.name} — Conectando Missionários e Apoiadores`,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  applicationName: siteConfig.name,
  keywords: [
    'missão',
    'missionários',
    'apoiadores',
    'sustento missionário',
    'oração',
    'pedidos de oração',
    'projetos sociais',
    'missões transculturais',
    'FaithTech',
    'Mission App',
    'doação para missões',
    'igreja',
  ],
  authors: [{ name: 'FaithTech', url: 'https://github.com/MissionAppFaithTech' }],
  creator: 'FaithTech',
  publisher: siteConfig.name,
  category: 'Community & Faith',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  icons: {
    icon: '/logos/favicon_mission.png',
    shortcut: '/logos/favicon_mission.png',
    apple: '/logos/favicon_mission.png',
  },
  openGraph: {
    type: 'website',
    locale: siteConfig.locale,
    url: siteUrl,
    siteName: siteConfig.name,
    title: `${siteConfig.name} — Conectando Missionários e Apoiadores`,
    description: siteConfig.description,
    images: [
      {
        url: siteConfig.ogImage,
        width: 1200,
        height: 630,
        alt: `${siteConfig.name} — conectamos missionários e apoiadores`,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: `${siteConfig.name} — Conectando Missionários e Apoiadores`,
    description: siteConfig.description,
    images: [siteConfig.ogImage],
  },
  alternates: {
    canonical: '/',
    languages: {
      'pt-BR': '/',
    },
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#F7F9FC' },
    { media: '(prefers-color-scheme: dark)', color: '#081C3A' },
  ],
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: ReactNode }) {
  const orgWebsiteSchema = generateOrganizationAndWebsiteSchema();

  return (
    <html lang="pt-BR" suppressHydrationWarning className={dmSans.variable}>
      <head>
        <JsonLd data={orgWebsiteSchema} />
      </head>
      <body className={dmSans.className}>
        <Providers>
          <SkipToContent />
          {children}
        </Providers>
      </body>
    </html>
  );
}
