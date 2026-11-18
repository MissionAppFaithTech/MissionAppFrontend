import type { Post } from '@/schemas/post.schema';
export const POST_ID = '019a0000-0000-7000-8000-000000000001';
export const MISSIONARY_ID = '019a0000-0000-7000-8000-000000000002';
export const IMAGE_ID = '019a0000-0000-7000-8000-000000000003';
export const postFixture: Post = {
  id: POST_ID,
  missionaryId: MISSIONARY_ID,
  content: 'Notícias do campo',
  highlightLink: null,
  slug: 'noticias',
  createdAt: '2026-11-15T12:00:00Z',
  images: [],
};
