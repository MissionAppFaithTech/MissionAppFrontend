import getYouTubeId from 'get-youtube-id';

/** Captions on by default, in Portuguese when available (deaf and hard-of-hearing users). */
export const YOUTUBE_CAPTION_PARAMS = 'cc_load_policy=1&cc_lang_pref=pt&hl=pt-BR';

/** Privacy-enhanced embed URL with captions enabled, or null for a non-YouTube URL. */
export function getYouTubeEmbedUrl(url?: string): string | null {
  if (!url) return null;
  const videoId = getYouTubeId(url.trim());
  return videoId
    ? `https://www.youtube-nocookie.com/embed/${videoId}?${YOUTUBE_CAPTION_PARAMS}`
    : null;
}

const VIMEO_ID = /^(?:https?:\/\/)?(?:www\.)?(?:player\.)?vimeo\.com\/(?:.*\/)?(?:video\/)?(\d+)/i;

/** Embed URL of a Vimeo link (page or player URL), or null for anything else. */
export function getVimeoEmbedUrl(url?: string): string | null {
  const id = url?.trim().match(VIMEO_ID)?.[1];
  return id ? `https://player.vimeo.com/video/${id}` : null;
}

/** Embed URL for the providers the backend accepts (YouTube or Vimeo), else null. */
export function getVideoEmbedUrl(url?: string | null): string | null {
  if (!url) return null;
  return getYouTubeEmbedUrl(url) ?? getVimeoEmbedUrl(url);
}
