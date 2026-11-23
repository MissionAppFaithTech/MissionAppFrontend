import { describe, expect, it } from 'vitest';
import { getVideoEmbedUrl, getYouTubeEmbedUrl, YOUTUBE_CAPTION_PARAMS } from './youtube';

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

describe('getVideoEmbedUrl', () => {
  it('embeds YouTube and Vimeo links, in page or embed form', () => {
    expect(getVideoEmbedUrl('https://youtu.be/5dsGWM5XGdg')).toContain(
      'youtube-nocookie.com/embed/5dsGWM5XGdg'
    );
    expect(getVideoEmbedUrl('https://www.youtube.com/embed/5dsGWM5XGdg')).toContain('5dsGWM5XGdg');
    expect(getVideoEmbedUrl('https://vimeo.com/76979871')).toBe(
      'https://player.vimeo.com/video/76979871'
    );
    expect(getVideoEmbedUrl('https://player.vimeo.com/video/76979871')).toBe(
      'https://player.vimeo.com/video/76979871'
    );
  });

  it('rejects other providers and empty values', () => {
    expect(getVideoEmbedUrl('https://example.com/video/123')).toBeNull();
    expect(getVideoEmbedUrl('https://notvimeo.com/123')).toBeNull();
    expect(getVideoEmbedUrl('')).toBeNull();
    expect(getVideoEmbedUrl(null)).toBeNull();
  });
});
