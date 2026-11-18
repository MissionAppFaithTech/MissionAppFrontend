import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  ACCESS,
  backendError,
  backendMock,
  mockBackend,
  resetActionHarness,
  setSession,
} from '@/test/actionHarness';
import { clearRefreshCache } from '@/lib/api/bff';
import { POST_ID, IMAGE_ID, postFixture } from '@/test/posts';
import { createPostAction, updatePostAction, deletePostAction } from './posts';
import { requestPostImageUploadAction } from './media';
vi.mock('next/headers', async () => (await import('@/test/actionHarness')).headersMock);
vi.mock('@/lib/api/backend', async () => (await import('@/test/actionHarness')).backendMock);
beforeEach(() => {
  resetActionHarness();
  clearRefreshCache();
});
describe('post Server Actions', () => {
  it('sends authenticated CRUD to the exact endpoints and parses the real envelope', async () => {
    mockBackend({
      'POST /posts': () => ({ data: { post: postFixture } }),
      [`PATCH /posts/${POST_ID}`]: () => ({ data: { post: postFixture } }),
      [`DELETE /posts/${POST_ID}`]: () => ({ message: 'ok' }),
    });
    expect((await createPostAction({ content: 'caption', imageAssetIds: [IMAGE_ID] })).ok).toBe(
      true
    );
    await updatePostAction(POST_ID, { content: 'edited', imageAssetIds: [], highlightLink: null });
    await deletePostAction(POST_ID);
    expect(backendMock.backendFetch).toHaveBeenNthCalledWith(1, '/posts', {
      method: 'POST',
      accessToken: ACCESS,
      body: { content: 'caption', imageAssetIds: [IMAGE_ID] },
    });
    expect(backendMock.backendFetch).toHaveBeenNthCalledWith(2, `/posts/${POST_ID}`, {
      method: 'PATCH',
      accessToken: ACCESS,
      body: { content: 'edited', imageAssetIds: [], highlightLink: null },
    });
    expect(backendMock.backendFetch).toHaveBeenNthCalledWith(3, `/posts/${POST_ID}`, {
      method: 'DELETE',
      accessToken: ACCESS,
    });
  });
  it.each([403, 409, 422])(
    'preserves backend status/code %i without automatic retry',
    async (status) => {
      mockBackend({
        'POST /posts': () => {
          throw backendError(status, {
            code: 'E_POST_IMAGE_LIMIT_REACHED',
            message: 'Limite atingido',
          });
        },
      });
      expect(await createPostAction({ content: 'caption' })).toMatchObject({
        ok: false,
        status,
        code: 'E_POST_IMAGE_LIMIT_REACHED',
      });
      expect(backendMock.backendFetch).toHaveBeenCalledTimes(1);
    }
  );
  it('validates client-forged data server-side before any backend call', async () => {
    for (const input of [
      { content: '' },
      { content: 'x'.repeat(5001) },
      { content: 'ok', imageAssetIds: [IMAGE_ID, IMAGE_ID] },
      { content: 'ok', imageAssetIds: ['019a0000-0000-4000-8000-000000000003'] },
      { content: 'ok', missionaryId: IMAGE_ID },
    ])
      expect(await createPostAction(input)).toMatchObject({ ok: false, status: 422 });
    expect(await updatePostAction('invalid', { content: 'ok' })).toMatchObject({
      ok: false,
      status: 422,
    });
    expect(await deletePostAction('invalid')).toMatchObject({ ok: false, status: 422 });
    expect(backendMock.backendFetch).not.toHaveBeenCalled();
  });
  it('requires a session for all mutations', async () => {
    setSession();
    for (const result of [
      await createPostAction({ content: 'ok' }),
      await updatePostAction(POST_ID, { content: 'ok' }),
      await deletePostAction(POST_ID),
    ])
      expect(result).toMatchObject({ ok: false, status: 401 });
    expect(backendMock.backendFetch).not.toHaveBeenCalled();
  });
  it('reserves POST_IMAGE with its own 10 MB validation', async () => {
    mockBackend({
      'POST /media-assets/uploads': () => ({
        data: {
          mediaAsset: { id: IMAGE_ID },
          upload: { method: 'PUT', url: 'https://storage.test/file', headers: {} },
        },
      }),
    });
    expect(
      await requestPostImageUploadAction({ mimeType: 'image/webp', fileSizeBytes: 10485760 })
    ).toMatchObject({ ok: true });
    expect(backendMock.backendFetch).toHaveBeenCalledWith(
      '/media-assets/uploads',
      expect.objectContaining({
        body: { purpose: 'POST_IMAGE', mimeType: 'image/webp', fileSizeBytes: 10485760 },
      })
    );
    expect(
      await requestPostImageUploadAction({ mimeType: 'image/webp', fileSizeBytes: 10485761 })
    ).toMatchObject({ ok: false, status: 422 });
  });
});
