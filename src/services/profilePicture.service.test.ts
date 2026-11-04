import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { updateAccountProfileAction } from '@/app/actions/account';
import { completeMediaUploadAction, requestProfilePictureUploadAction } from '@/app/actions/media';
import {
  PROFILE_PICTURE_ACCEPT,
  profilePictureError,
  removeProfilePicture,
  uploadProfilePicture,
} from './profilePicture.service';

vi.mock('@/app/actions/account', () => ({ updateAccountProfileAction: vi.fn() }));
vi.mock('@/app/actions/media', () => ({
  requestProfilePictureUploadAction: vi.fn(),
  completeMediaUploadAction: vi.fn(),
}));

const ASSET_ID = '019a0000-0000-7000-8000-0000000000f1';
const UPLOAD_URL = 'https://storage.test/bucket/key?signature=1';
const photo = (type = 'image/png', size = 2048) =>
  new File([new Uint8Array(size)], 'foto', { type });

const fetchMock = vi.fn();

beforeEach(() => {
  vi.clearAllMocks();
  vi.stubGlobal('fetch', fetchMock);
  fetchMock.mockResolvedValue(new Response(null, { status: 200 }));
  vi.mocked(requestProfilePictureUploadAction).mockResolvedValue({
    ok: true,
    data: {
      mediaAsset: { id: ASSET_ID },
      upload: {
        url: UPLOAD_URL,
        method: 'PUT',
        headers: { 'Content-Type': 'image/png', 'Content-Length': '2048' },
      },
    },
  });
  vi.mocked(completeMediaUploadAction).mockResolvedValue({ ok: true, data: { id: ASSET_ID } });
  vi.mocked(updateAccountProfileAction).mockResolvedValue({
    ok: true,
    data: { user: { profilePictureUrl: null } as never },
  });
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('profilePictureError', () => {
  it('accepts JPG, PNG and WebP up to 5 MB', () => {
    expect(PROFILE_PICTURE_ACCEPT).toBe('image/jpeg,image/png,image/webp');
    expect(profilePictureError(photo('image/jpeg'))).toBeNull();
    expect(profilePictureError(photo('image/webp', 5 * 1024 * 1024))).toBeNull();
  });

  it('explains in Portuguese why a file is refused', () => {
    expect(profilePictureError(photo('image/gif'))).toMatch(/jpg, png ou webp/i);
    expect(profilePictureError(photo('image/png', 5 * 1024 * 1024 + 1))).toMatch(/5 mb/i);
    expect(profilePictureError(photo('image/png', 0))).toMatch(/vazio/i);
  });
});

describe('uploadProfilePicture', () => {
  it('reserves the upload, PUTs the file, confirms it and links it to the account', async () => {
    const file = photo();

    await expect(uploadProfilePicture(file)).resolves.toEqual({ url: null });

    expect(requestProfilePictureUploadAction).toHaveBeenCalledWith({
      mimeType: 'image/png',
      fileSizeBytes: 2048,
    });
    // Content-Length is set by the browser from the File itself.
    expect(fetchMock).toHaveBeenCalledWith(UPLOAD_URL, {
      method: 'PUT',
      headers: { 'Content-Type': 'image/png' },
      body: file,
    });
    expect(completeMediaUploadAction).toHaveBeenCalledWith(ASSET_ID);
    expect(updateAccountProfileAction).toHaveBeenCalledWith({ profilePictureId: ASSET_ID });
    const order = [
      vi.mocked(requestProfilePictureUploadAction),
      fetchMock,
      vi.mocked(completeMediaUploadAction),
      vi.mocked(updateAccountProfileAction),
    ].map((fn) => fn.mock.invocationCallOrder[0]);
    expect(order).toEqual([...order].sort((a, b) => a - b));
  });

  it('returns the public URL when the image is already processed', async () => {
    vi.mocked(updateAccountProfileAction).mockResolvedValue({
      ok: true,
      data: { user: { profilePictureUrl: 'https://cdn.test/p.webp' } as never },
    });

    await expect(uploadProfilePicture(photo())).resolves.toEqual({
      url: 'https://cdn.test/p.webp',
    });
  });

  it('refuses an invalid file without reserving an upload', async () => {
    await expect(uploadProfilePicture(photo('application/pdf'))).rejects.toMatchObject({
      status: 422,
    });
    expect(requestProfilePictureUploadAction).not.toHaveBeenCalled();
  });

  it('stops before confirming when the storage rejects the PUT', async () => {
    fetchMock.mockResolvedValue(new Response(null, { status: 403 }));

    await expect(uploadProfilePicture(photo())).rejects.toThrow(/não foi possível enviar a foto/i);
    expect(completeMediaUploadAction).not.toHaveBeenCalled();
    expect(updateAccountProfileAction).not.toHaveBeenCalled();
  });

  it('reports a network failure of the PUT in Portuguese', async () => {
    fetchMock.mockRejectedValue(new TypeError('Failed to fetch'));

    await expect(uploadProfilePicture(photo())).rejects.toMatchObject({ status: 0 });
  });

  it('surfaces the action error (e.g. expired session) as ApiError', async () => {
    vi.mocked(requestProfilePictureUploadAction).mockResolvedValue({
      ok: false,
      status: 422,
      message: 'Envie uma imagem JPG, PNG ou WebP de até 5 MB',
    });

    await expect(uploadProfilePicture(photo())).rejects.toThrow('JPG, PNG ou WebP');
    expect(fetchMock).not.toHaveBeenCalled();
  });
});

describe('removeProfilePicture', () => {
  it('clears the photo with profilePictureId null', async () => {
    await removeProfilePicture();

    expect(updateAccountProfileAction).toHaveBeenCalledWith({ profilePictureId: null });
  });
});
