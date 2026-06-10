import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import { DM_Sans } from "next/font/google";
import { Providers } from "./providers";

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-dm-sans",
});

export const metadata: Metadata = {
  title: "Mission App",
  description:
    "Plataforma que conecta missionários, apoiadores e projetos sociais.",
  icons: {
    icon: "/logos/favicon_mission.png",
    apple: "/logos/favicon_mission.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="pt-BR" suppressHydrationWarning className={dmSans.variable}>
      <body className={dmSans.className}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
