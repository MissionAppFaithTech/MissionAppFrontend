import { catalogSearchRoute } from '@/lib/server/catalogSearchRoute';

/** Public search (backend ADR-0041): no session needed, so sign-up can use it. */
export const GET = catalogSearchRoute(
  'missionaryAgencies',
  'Não foi possível buscar as agências missionárias'
);
