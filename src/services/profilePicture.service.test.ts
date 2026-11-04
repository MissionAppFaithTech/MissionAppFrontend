import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { updateAccountProfileAction } from '@/app/actions/account';
import {
  completeMediaUploadAction,
  getMediaAssetAction,
  requestProfilePictureUploadAction,
} from '@/app/actions/media';
import {
  PROFILE_PICTURE_ACCEPT,
  profilePictureError,
  removeProfilePicture,
  uploadProfilePicture,
  PROCESSING_POLL_DELAYS_MS,
  waitForProcessedPicture,
} from './profilePicture.service';

vi.mock('@/app/actions/account', () => ({ updateAccountProfileAction: vi.fn() }));
vi.mock('@/app/actions/media', () => ({
  requestProfilePictureUploadAction: vi.fn(),
  completeMediaUploadAction: vi.fn(),
  getMediaAssetAction: vi.fn(),
}));

const ASSET_ID = '019a0000-0000-7000-8000-0000000000f1';
const UPLOAD_URL = 'https://storage.test/bucket/key?signature=1';
const READY_URL = 'https://cdn.test/p.optimized.webp';
const assetState = (status: 'PROCESSING' | 'READY' | 'FAILED', url: string | null = null) => ({
  ok: true as const,
  data: { id: ASSET_ID, status, url },
});
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
  vi.mocked(getMediaAssetAction).mockResolvedValue(assetState('READY', READY_URL));
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
    const onProcessing = vi.fn();

    await expect(uploadProfilePicture(file, { onProcessing })).resolves.toEqual({
      url: READY_URL,
    });

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
    // The backend still compresses the image: wait for the worker to finish.
    expect(onProcessing).toHaveBeenCalledTimes(1);
    expect(getMediaAssetAction).toHaveBeenCalledWith(ASSET_ID);
    const order = [
      vi.mocked(requestProfilePictureUploadAction),
      fetchMock,
      vi.mocked(completeMediaUploadAction),
      vi.mocked(updateAccountProfileAction),
      vi.mocked(getMediaAssetAction),
    ].map((fn) => fn.mock.invocationCallOrder[0]);
    expect(order).toEqual([...order].sort((a, b) => a - b));
  });

  it('waits for the worker without an onProcessing callback', async () => {
    await expect(uploadProfilePicture(photo())).resolves.toEqual({ url: READY_URL });
    expect(getMediaAssetAction).toHaveBeenCalledWith(ASSET_ID);
  });

  it('returns the public URL when the image is already processed', async () => {
    vi.mocked(updateAccountProfileAction).mockResolvedValue({
      ok: true,
      data: { user: { profilePictureUrl: 'https://cdn.test/p.webp' } as never },
    });

    const onProcessing = vi.fn();

    await expect(uploadProfilePicture(photo(), { onProcessing })).resolves.toEqual({
      url: 'https://cdn.test/p.webp',
    });
    expect(onProcessing).not.toHaveBeenCalled();
    expect(getMediaAssetAction).not.toHaveBeenCalled();
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

describe('waitForProcessedPicture', () => {
  it('polls until the worker marks the image READY and returns its URL', async () => {
    vi.mocked(getMediaAssetAction)
      .mockResolvedValueOnce(assetState('PROCESSING'))
      .mockResolvedValueOnce(assetState('PROCESSING'))
      .mockResolvedValueOnce(assetState('READY', READY_URL));

    await expect(waitForProcessedPicture(ASSET_ID, [0, 0, 0, 0])).resolves.toBe(READY_URL);
    expect(getMediaAssetAction).toHaveBeenCalledTimes(3);
  });

  it('only takes the URL of a READY asset', async () => {
    vi.mocked(getMediaAssetAction)
      .mockResolvedValueOnce(assetState('PROCESSING', 'https://cdn.test/original.png'))
      .mockResolvedValueOnce(assetState('READY', null))
      .mockResolvedValueOnce(assetState('READY', READY_URL));

    await expect(waitForProcessedPicture(ASSET_ID, [0, 0, 0])).resolves.toBe(READY_URL);
    expect(getMediaAssetAction).toHaveBeenCalledTimes(3);
  });

  it('waits each delay before checking again', async () => {
    vi.useFakeTimers();
    try {
      vi.mocked(getMediaAssetAction).mockResolvedValue(assetState('PROCESSING'));
      const result = waitForProcessedPicture(ASSET_ID, [1000, 2000]);

      await vi.advanceTimersByTimeAsync(999);
      expect(getMediaAssetAction).not.toHaveBeenCalled();
      await vi.advanceTimersByTimeAsync(1);
      expect(getMediaAssetAction).toHaveBeenCalledTimes(1);
      await vi.advanceTimersByTimeAsync(1999);
      expect(getMediaAssetAction).toHaveBeenCalledTimes(1);
      await vi.advanceTimersByTimeAsync(1);
      await expect(result).resolves.toBeNull();
      expect(getMediaAssetAction).toHaveBeenCalledTimes(2);
    } finally {
      vi.useRealTimers();
    }
  });

  it('gives up with null when the image is still processing after the last check', async () => {
    vi.mocked(getMediaAssetAction).mockResolvedValue(assetState('PROCESSING'));

    await expect(waitForProcessedPicture(ASSET_ID, [0, 0])).resolves.toBeNull();
    expect(getMediaAssetAction).toHaveBeenCalledTimes(2);
  });

  it('reports in Portuguese when the backend could not process the image', async () => {
    vi.mocked(getMediaAssetAction).mockResolvedValue(assetState('FAILED'));

    await expect(waitForProcessedPicture(ASSET_ID, [0, 0])).rejects.toMatchObject({
      status: 422,
      message: expect.stringMatching(/não foi possível processar a imagem/i),
    });
    expect(getMediaAssetAction).toHaveBeenCalledTimes(1);
  });

  it('keeps the saved upload (null) when a status check fails', async () => {
    vi.mocked(getMediaAssetAction).mockResolvedValue({
      ok: false,
      status: 503,
      message: 'Não foi possível verificar o processamento da foto',
    });

    await expect(waitForProcessedPicture(ASSET_ID, [0, 0])).resolves.toBeNull();
    expect(getMediaAssetAction).toHaveBeenCalledTimes(1);
  });

  it('waits about 30 seconds in total by default', () => {
    const total = PROCESSING_POLL_DELAYS_MS.reduce((sum, ms) => sum + ms, 0);
    expect(total).toBe(30000);
  });
});
