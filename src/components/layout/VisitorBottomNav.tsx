'use client';

import MobileNavigationBar from './MobileNavigationBar';

export type VisitorBottomNavProps = {
  searchHref?: string;
  searchLabel?: string;
  isAuthenticated?: boolean;
};

/**
 * VisitorBottomNav displays the minimalist mobile navigation bar.
 * Defaults to visitor mode with fewer elements (Explorar, Pesquisar, Campanhas, Entrar).
 * When authenticated, displays richer elements (Feed, Navegar, Projetos, Campanhas, Perfil).
 */
export default function VisitorBottomNav({
  searchHref = '/#buscar',
  searchLabel = 'Pesquisar',
  isAuthenticated = false,
}: VisitorBottomNavProps) {
  return (
    <MobileNavigationBar
      isAuthenticated={isAuthenticated}
      searchHref={searchHref}
      searchLabel={searchLabel}
    />
  );
}
