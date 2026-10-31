import { describe, expect, it } from 'vitest';
import { getYouTubeEmbedUrl, YOUTUBE_CAPTION_PARAMS } from './youtube';

describe('getYouTubeEmbedUrl', () => {
  it('builds a privacy-enhanced embed with captions on, ignoring surrounding spaces', () => {
    expect(getYouTubeEmbedUrl('  https://youtu.be/5dsGWM5XGdg  ')).toBe(
      `https://www.youtube-nocookie.com/embed/5dsGWM5XGdg?${YOUTUBE_CAPTION_PARAMS}`
    );
    expect(YOUTUBE_CAPTION_PARAMS).toContain('cc_load_policy=1');
  });

  it('returns null for empty or non-YouTube URLs', () => {
    expect(getYouTubeEmbedUrl()).toBeNull();
    expect(getYouTubeEmbedUrl('https://vimeo.com/123')).toBeNull();
  });
});
