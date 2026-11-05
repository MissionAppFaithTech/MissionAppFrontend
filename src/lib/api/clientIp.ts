import { headers } from 'next/headers';

/** Must match the backend (`app/utils/client_ip.ts`, ADR-0032). */
export const CLIENT_IP_HEADER = 'x-missionapp-client-ip';
export const BFF_SECRET_HEADER = 'x-missionapp-bff-secret';

/**
 * The API sees this server's IP for every user, so per-IP rate limits would be
 * shared by everyone. When `BFF_SHARED_SECRET` is set, forward the end user's IP
 * with the secret so the API can trust it. The proxy in front of Next.js must
 * overwrite `x-real-ip`/`x-forwarded-for` (Vercel does), or users could spoof them.
 */
export async function forwardedClientHeaders(): Promise<Record<string, string>> {
  if (!process.env.BFF_SHARED_SECRET) return {};

  let incoming: Awaited<ReturnType<typeof headers>>;
  try {
    incoming = await headers();
  } catch {
    // Outside a request (build, scripts): nothing to forward.
    return {};
  }

  return clientHeadersFrom(incoming);
}

/**
 * The end user's IP from the proxy headers (`x-real-ip`, else the first
 * `x-forwarded-for` hop), or `null` when no proxy set them (local runs).
 */
export function clientIpFrom(incoming: Pick<Headers, 'get'>): string | null {
  return (
    incoming.get('x-real-ip')?.trim() ||
    incoming.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    null
  );
}

/**
 * Same as {@link forwardedClientHeaders} for code that already holds the request
 * headers, such as the proxy, where `next/headers` is not available.
 */
export function clientHeadersFrom(incoming: Pick<Headers, 'get'>): Record<string, string> {
  const secret = process.env.BFF_SHARED_SECRET;
  if (!secret) return {};

  const ip = clientIpFrom(incoming);
  if (!ip) return {};

  return { [BFF_SECRET_HEADER]: secret, [CLIENT_IP_HEADER]: ip };
}
