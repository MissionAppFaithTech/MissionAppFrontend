import { safeWebUrlSchema } from '@/schemas/post.schema';

/** Exact hosts and video IDs only. Shorts and social networks remain links. */
export function postLink(value: string | null): { href: string; embed: string | null } | null {
  const parsed = safeWebUrlSchema.safeParse(value);
  if (!parsed.success) return null;
  const url = new URL(parsed.data);
  let id: string | null = null;
  if (url.hostname === 'youtu.be') id = url.pathname.slice(1);
  if (['youtube.com', 'www.youtube.com', 'm.youtube.com'].includes(url.hostname)) {
    if (url.pathname === '/watch') id = url.searchParams.get('v');
    else if (url.pathname.startsWith('/embed/')) id = url.pathname.slice(7);
  }
  const embed =
    id && /^[\w-]{11}$/.test(id) ? `https://www.youtube-nocookie.com/embed/${id}` : null;
  return { href: url.href, embed };
}
