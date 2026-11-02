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
  const secret = process.env.BFF_SHARED_SECRET;
  if (!secret) return {};

  let incoming: Awaited<ReturnType<typeof headers>>;
  try {
    incoming = await headers();
  } catch {
    // Outside a request (build, scripts): nothing to forward.
    return {};
  }

  const ip =
    incoming.get('x-real-ip')?.trim() || incoming.get('x-forwarded-for')?.split(',')[0]?.trim();
  if (!ip) return {};

  return { [BFF_SECRET_HEADER]: secret, [CLIENT_IP_HEADER]: ip };
}
