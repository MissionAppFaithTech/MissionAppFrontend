import { NextResponse } from 'next/server';
import { bffErrorResponse } from '@/lib/api/bff';
import {
  CATALOG_SEARCH_LIMIT,
  CATALOG_SEARCH_MAX_LENGTH,
  CATALOG_SEARCH_MIN_LENGTH,
  normalizeCatalogTerm,
} from '@/lib/catalog/search';
import { searchCatalogCached } from '@/lib/server/catalogSearch';
import { clientIpFrom } from '@/lib/api/clientIp';
import { consumeRateLimit } from '@/lib/server/rateLimit';
import type { CatalogKind } from '@/lib/query/keys';

/** Searches per IP per catalog per minute that this instance lets through. */
export const CATALOG_SEARCH_IP_LIMIT = 30;

/** `CATALOG_SEARCH_IP_LIMIT` env (e.g. the e2e suite, one IP for every test), else the default. */
function ipLimit(): number {
  const value = Number(process.env.CATALOG_SEARCH_IP_LIMIT);
  return Number.isInteger(value) && value > 0 ? value : CATALOG_SEARCH_IP_LIMIT;
}
const WINDOW_MS = 60_000;
const MAX_LIMIT = 20;

function pageSize(raw: string | null): number {
  const value = Number(raw);
  return Number.isInteger(value) && value >= 1 ? Math.min(value, MAX_LIMIT) : CATALOG_SEARCH_LIMIT;
}

/**
 * `GET` of a public catalog search (`?search=…&limit=…`), for the autocomplete:
 * no session needed, so sign-up can search before the account exists.
 *
 * - The term is normalized here (accents, case, spaces) and is the cache key of
 *   {@link searchCatalogCached}, shared by every visitor.
 * - Each IP (from the proxy, like ADR-0032) is limited before the cached
 *   search, so nobody exhausts the BFF's backend budget with random terms.
 * - Shorter terms answer an empty page without calling the backend.
 */
export function catalogSearchRoute(kind: CatalogKind, fallbackMessage: string) {
  return async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const term = normalizeCatalogTerm(searchParams.get('search') ?? '').slice(
      0,
      CATALOG_SEARCH_MAX_LENGTH
    );
    if (term.length < CATALOG_SEARCH_MIN_LENGTH) {
      return NextResponse.json({ data: [], meta: { hasMore: false } });
    }

    // NOTE: without a proxy IP (local runs) a visitor cannot be told apart; the
    // backend's BFF budget (600/min per catalog) still caps the instance.
    const ip = clientIpFrom(request.headers);
    const budget = ip
      ? consumeRateLimit(`catalog-search:${kind}:${ip}`, ipLimit(), WINDOW_MS)
      : { allowed: true, retryAfterSeconds: 0 };
    if (!budget.allowed) {
      return NextResponse.json(
        {
          message: 'Muitas buscas seguidas. Aguarde alguns segundos e tente de novo.',
          code: 'E_TOO_MANY_REQUESTS',
          retryAfterSeconds: budget.retryAfterSeconds,
        },
        { status: 429, headers: { 'Retry-After': String(budget.retryAfterSeconds) } }
      );
    }

    try {
      const result = await searchCatalogCached(kind, term, pageSize(searchParams.get('limit')));
      return NextResponse.json({ data: result.items, meta: { hasMore: result.hasMore } });
    } catch (error) {
      return bffErrorResponse(error, fallbackMessage, `api/${kind} GET`);
    }
  };
}
