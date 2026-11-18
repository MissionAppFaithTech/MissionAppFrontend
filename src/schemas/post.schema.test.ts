import { describe, expect, it } from 'vitest';
import {
  createPostSchema,
  updatePostSchema,
  postUploadSchema,
  postListSchema,
  postIdSchema,
} from './post.schema';
import { IMAGE_ID, POST_ID, MISSIONARY_ID } from '@/test/posts';

describe('post contract', () => {
  it('requires UUID v7 for post, missionary and image identifiers, as the backend does', () => {
    const v4 = '019a0000-0000-4000-8000-000000000003';
    expect(postIdSchema.safeParse(POST_ID).success).toBe(true);
    expect(postIdSchema.safeParse(v4).success).toBe(false);
    expect(postListSchema.safeParse({ missionaryId: v4 }).success).toBe(false);
    expect(createPostSchema.safeParse({ content: 'ok', imageAssetIds: [v4] }).success).toBe(false);
    expect(updatePostSchema.safeParse({ imageAssetIds: [v4] }).success).toBe(false);
  });
  it('requires a trimmed caption, allows 5000 and rejects 5001 characters', () => {
    for (const content of ['', '   ', 'a'.repeat(5001)])
      expect(createPostSchema.safeParse({ content }).success).toBe(false);
    expect(createPostSchema.parse({ content: ' a ' }).content).toBe('a');
    expect(createPostSchema.safeParse({ content: 'a'.repeat(5000) }).success).toBe(true);
  });
  it('allows 0–3 distinct UUIDs, never 4, duplicates or forged owner fields', () => {
    const ids = [IMAGE_ID, POST_ID, MISSIONARY_ID];
    expect(createPostSchema.safeParse({ content: 'ok', imageAssetIds: ids }).success).toBe(true);
    for (const imageAssetIds of [
      [...ids, '019a0000-0000-7000-8000-000000000004'],
      [IMAGE_ID, IMAGE_ID],
      ['x'],
    ])
      expect(createPostSchema.safeParse({ content: 'ok', imageAssetIds }).success).toBe(false);
    expect(createPostSchema.safeParse({ content: 'ok', missionaryId: MISSIONARY_ID }).success).toBe(
      false
    );
    expect(updatePostSchema.parse({ imageAssetIds: [], highlightLink: null })).toEqual({
      imageAssetIds: [],
      highlightLink: null,
    });
    expect(createPostSchema.safeParse({ content: 'ok', highlightLink: null }).success).toBe(false);
  });
  it('rejects dangerous URLs, credentials and overlong URLs', () => {
    for (const highlightLink of [
      'javascript:alert(1)',
      'data:text/html,hi',
      'https://user:secret@example.org',
      `https://example.org/${'x'.repeat(250)}`,
    ])
      expect(createPostSchema.safeParse({ content: 'ok', highlightLink }).success).toBe(false);
  });
  it('accepts JPG/PNG/WebP up to 10 MB, rejects invalid and empty media', () => {
    for (const mimeType of ['image/jpeg', 'image/png', 'image/webp'])
      expect(
        postUploadSchema.safeParse({ mimeType, fileSizeBytes: 10 * 1024 * 1024 }).success
      ).toBe(true);
    for (const [mimeType, fileSizeBytes] of [
      ['image/svg+xml', 1],
      ['image/gif', 1],
      ['image/png', 0],
      ['image/png', 10485761],
    ])
      expect(postUploadSchema.safeParse({ mimeType, fileSizeBytes }).success).toBe(false);
    expect(postListSchema.safeParse({ limit: 21 }).success).toBe(false);
  });
});
