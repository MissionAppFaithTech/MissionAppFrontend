'use client';

import { Suspense } from 'react';
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
 *
 * The bar reads `usePathname()`: on routes with dynamic params that value only
 * exists at request time, so it streams in inside `<Suspense>` while the rest of
 * the page stays prerendered (Cache Components, ADR-0005).
 */
export default function VisitorBottomNav({
  searchHref = '/#buscar',
  searchLabel = 'Pesquisar',
  isAuthenticated = false,
}: VisitorBottomNavProps) {
  return (
    <Suspense fallback={null}>
      <MobileNavigationBar
        isAuthenticated={isAuthenticated}
        searchHref={searchHref}
        searchLabel={searchLabel}
      />
    </Suspense>
  );
}
