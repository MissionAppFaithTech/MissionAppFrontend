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
