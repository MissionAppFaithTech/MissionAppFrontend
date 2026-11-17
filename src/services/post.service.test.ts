import { beforeEach, describe, expect, it, vi } from 'vitest';
import { completeMediaUploadAction, requestPostImageUploadAction } from '@/app/actions/media';
import { uploadPostImage, type PostUploadProgress } from './post.service';
import { IMAGE_ID } from '@/test/posts';
vi.mock('@/app/actions/media', () => ({
  completeMediaUploadAction: vi.fn(),
  requestPostImageUploadAction: vi.fn(),
}));
vi.mock('@/app/actions/posts', () => ({
  createPostAction: vi.fn(),
  updatePostAction: vi.fn(),
  deletePostAction: vi.fn(),
}));
const file = new File(['png'], 'foto.png', { type: 'image/png' });
beforeEach(() => {
  vi.clearAllMocks();
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true }));
  vi.mocked(requestPostImageUploadAction).mockResolvedValue({
    ok: true,
    data: {
      mediaAsset: { id: IMAGE_ID },
      upload: {
        method: 'PUT',
        url: 'https://storage.test/signed',
        headers: { 'Content-Type': 'image/png', 'Content-Length': '3' },
      },
    },
  });
  vi.mocked(completeMediaUploadAction).mockResolvedValue({ ok: true, data: { id: IMAGE_ID } });
});
describe('post image upload', () => {
  it('sends bytes directly, then confirms, and never resends a confirmed asset', async () => {
    const progress: PostUploadProgress = {};
    expect(await uploadPostImage(file, progress)).toBe(IMAGE_ID);
    expect(fetch).toHaveBeenCalledWith('https://storage.test/signed', {
      method: 'PUT',
      headers: { 'Content-Type': 'image/png' },
      body: file,
      credentials: 'omit',
    });
    expect(completeMediaUploadAction).toHaveBeenCalledWith(IMAGE_ID);
    await uploadPostImage(file, progress);
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(completeMediaUploadAction).toHaveBeenCalledTimes(1);
  });
  it('does not confirm a failed PUT', async () => {
    vi.mocked(fetch).mockResolvedValue(new Response(null, { status: 503 }));
    await expect(uploadPostImage(file, {})).rejects.toMatchObject({ status: 503 });
    expect(completeMediaUploadAction).not.toHaveBeenCalled();
  });
  it('retries completion without re-uploading bytes', async () => {
    const progress = {};
    vi.mocked(completeMediaUploadAction).mockResolvedValueOnce({
      ok: false,
      status: 503,
      message: 'Tente novamente',
    });
    await expect(uploadPostImage(file, progress)).rejects.toThrow('Tente novamente');
    await uploadPostImage(file, progress);
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(completeMediaUploadAction).toHaveBeenCalledTimes(2);
  });
});
