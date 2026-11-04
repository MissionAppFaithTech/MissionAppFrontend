import { beforeEach, describe, expect, it, vi } from 'vitest';
import { clearRefreshCache } from '@/lib/api/bff';
import {
  ACCESS,
  backendError,
  backendMock,
  mockBackend,
  resetActionHarness,
  setSession,
} from '@/test/actionHarness';
import {
  completeMediaUploadAction,
  getMediaAssetAction,
  requestProfilePictureUploadAction,
} from './media';

vi.mock('next/headers', async () => (await import('@/test/actionHarness')).headersMock);
vi.mock('@/lib/api/backend', async () => (await import('@/test/actionHarness')).backendMock);

const ASSET_ID = '019a0000-0000-7000-8000-0000000000f1';
const ticket = {
  mediaAsset: { id: ASSET_ID, status: 'PENDING_UPLOAD', url: null },
  upload: {
    url: 'https://storage.test/bucket/key?signature=1',
    method: 'PUT',
    headers: { 'Content-Type': 'image/png', 'Content-Length': '2048' },
    expiresAt: '2026-11-04T15:00:00.000Z',
  },
};

beforeEach(() => {
  clearRefreshCache();
  resetActionHarness();
});

describe('requestProfilePictureUploadAction', () => {
  it('reserves a PROFILE_PICTURE upload and returns the presigned URL', async () => {
    mockBackend({ 'POST /media-assets/uploads': () => ({ data: ticket }) });

    await expect(
      requestProfilePictureUploadAction({ mimeType: 'image/png', fileSizeBytes: 2048 })
    ).resolves.toEqual({ ok: true, data: ticket });
    expect(backendMock.backendFetch).toHaveBeenCalledWith('/media-assets/uploads', {
      method: 'POST',
      body: { purpose: 'PROFILE_PICTURE', mimeType: 'image/png', fileSizeBytes: 2048 },
      accessToken: ACCESS,
    });
  });

  it('refuses other types and files over 5 MB before calling the API', async () => {
    await expect(
      requestProfilePictureUploadAction({ mimeType: 'image/gif', fileSizeBytes: 10 })
    ).resolves.toMatchObject({
      ok: false,
      status: 422,
      message: 'Envie uma imagem JPG, PNG ou WebP de até 5 MB',
    });
    await expect(
      requestProfilePictureUploadAction({
        mimeType: 'image/jpeg',
        fileSizeBytes: 5 * 1024 * 1024 + 1,
      })
    ).resolves.toMatchObject({ ok: false, status: 422 });
    expect(backendMock.backendFetch).not.toHaveBeenCalled();
  });

  it('needs a session', async () => {
    setSession();

    await expect(
      requestProfilePictureUploadAction({ mimeType: 'image/png', fileSizeBytes: 10 })
    ).resolves.toMatchObject({ ok: false, status: 401 });
  });
});

describe('completeMediaUploadAction', () => {
  it('confirms the upload of the asset', async () => {
    mockBackend({ [`POST /media-assets/${ASSET_ID}/completion`]: () => ({ data: {} }) });

    await expect(completeMediaUploadAction(ASSET_ID)).resolves.toEqual({
      ok: true,
      data: { id: ASSET_ID },
    });
    expect(backendMock.backendFetch).toHaveBeenCalledWith(`/media-assets/${ASSET_ID}/completion`, {
      method: 'POST',
      body: {},
      accessToken: ACCESS,
    });
  });

  it('rejects an id that is not a UUID (no path injection)', async () => {
    await expect(completeMediaUploadAction('../auth/logout')).resolves.toMatchObject({
      ok: false,
      status: 422,
    });
    expect(backendMock.backendFetch).not.toHaveBeenCalled();
  });

  it('passes the backend error through (upload already confirmed)', async () => {
    mockBackend({
      [`POST /media-assets/${ASSET_ID}/completion`]: () => {
        throw backendError(409, {
          message: 'Upload já confirmado',
          code: 'E_MEDIA_ASSET_INVALID_STATUS',
        });
      },
    });

    await expect(completeMediaUploadAction(ASSET_ID)).resolves.toMatchObject({
      ok: false,
      status: 409,
      message: 'Upload já confirmado',
    });
  });
});

describe('getMediaAssetAction', () => {
  it('returns the processing state and the public URL once READY', async () => {
    mockBackend({
      [`GET /media-assets/${ASSET_ID}`]: () => ({
        data: {
          mediaAsset: {
            id: ASSET_ID,
            status: 'READY',
            url: 'https://cdn.test/p.optimized.webp',
            fileKey: 'users/profile-pictures/x.optimized.webp',
          },
        },
      }),
    });

    await expect(getMediaAssetAction(ASSET_ID)).resolves.toEqual({
      ok: true,
      data: { id: ASSET_ID, status: 'READY', url: 'https://cdn.test/p.optimized.webp' },
    });
    expect(backendMock.backendFetch).toHaveBeenCalledWith(`/media-assets/${ASSET_ID}`, {
      accessToken: ACCESS,
    });
  });

  it('keeps url null while the worker still processes the image', async () => {
    mockBackend({
      [`GET /media-assets/${ASSET_ID}`]: () => ({
        data: { mediaAsset: { id: ASSET_ID, status: 'PROCESSING' } },
      }),
    });

    await expect(getMediaAssetAction(ASSET_ID)).resolves.toEqual({
      ok: true,
      data: { id: ASSET_ID, status: 'PROCESSING', url: null },
    });
  });

  it('rejects an id that is not a UUID (no path injection)', async () => {
    await expect(getMediaAssetAction('../account/profile')).resolves.toMatchObject({
      ok: false,
      status: 422,
      message: 'Arquivo inválido',
    });
    expect(backendMock.backendFetch).not.toHaveBeenCalled();
  });

  it('passes the backend error through (asset of another user)', async () => {
    mockBackend({
      [`GET /media-assets/${ASSET_ID}`]: () => {
        throw backendError(403, { message: 'Você não tem permissão para acessar este arquivo' });
      },
    });

    await expect(getMediaAssetAction(ASSET_ID)).resolves.toMatchObject({
      ok: false,
      status: 403,
    });
  });

  it('answers a pt-BR message and logs the tag when the call fails unexpectedly', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    mockBackend({
      [`GET /media-assets/${ASSET_ID}`]: () => {
        throw new TypeError('fetch failed');
      },
    });

    await expect(getMediaAssetAction(ASSET_ID)).resolves.toEqual({
      ok: false,
      status: 502,
      message: 'Não foi possível verificar o processamento da foto',
    });
    expect(consoleError).toHaveBeenCalledWith('[actions/media-asset]', expect.any(TypeError));
    consoleError.mockRestore();
  });

  it('needs a session', async () => {
    setSession();

    await expect(getMediaAssetAction(ASSET_ID)).resolves.toMatchObject({ ok: false, status: 401 });
  });
});
