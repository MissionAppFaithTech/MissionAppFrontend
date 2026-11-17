import { describe, expect, it } from 'vitest';
import { postLink } from './postLink';
describe('safe post links', () => {
  it('embeds only exact YouTube hosts and a video ID', () => {
    for (const link of [
      'https://youtu.be/abcdefghijk',
      'https://www.youtube.com/watch?v=abcdefghijk',
      'https://youtube.com/embed/abcdefghijk',
    ])
      expect(postLink(link)?.embed).toBe('https://www.youtube-nocookie.com/embed/abcdefghijk');
    for (const link of [
      'https://youtube.com.evil.org/watch?v=abcdefghijk',
      'https://youtube.com/shorts/abcdefghijk',
      'https://instagram.com/reel/123',
      'https://tiktok.com/video/123',
      'https://youtube.com/embed/invalid',
    ])
      expect(postLink(link)?.embed).toBeNull();
  });
  it('rejects arbitrary HTML and unsafe schemes', () => {
    for (const link of [
      null,
      '<iframe src="https://evil.test">',
      'javascript:alert(1)',
      'data:text/html,test',
    ])
      expect(postLink(link)).toBeNull();
  });
});
