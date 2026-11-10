import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  completeMediaUploadAction,
  getMediaAssetAction,
  requestProfilePictureUploadAction,
} from '@/app/actions/media';
import { ApiError } from '@/lib/api/client';
import { updateHeader } from '@/services/profile.service';
import {
  changeProfilePicture,
  isSessionExpired,
  PICTURE_MAX_SIDE_PX,
  PICTURE_PROCESSING_FAILED_CODE,
  PictureFileError,
  pictureErrorScreen,
  pictureFileProblem,
  preparePictureFile,
  PROFILE_PICTURE_ACCEPT,
  profilePictureError,
  removeProfilePicture,
  uploadPictureFile,
  PROCESSING_POLL_DELAYS_MS,
  waitForProcessedPicture,
  type PictureSendProgress,
} from './profilePicture.service';

vi.mock('@/services/profile.service', () => ({
  updateHeader: vi.fn(async () => ({})),
}));

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

describe('uploadPictureFile', () => {
  it('reserves the upload, PUTs the file and confirms it, without linking it', async () => {
    const file = photo();

    await expect(uploadPictureFile(file)).resolves.toBe(ASSET_ID);

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
    const order = [
      vi.mocked(requestProfilePictureUploadAction),
      fetchMock,
      vi.mocked(completeMediaUploadAction),
    ].map((fn) => fn.mock.invocationCallOrder[0]);
    expect(order).toEqual([...order].sort((a, b) => a - b));
    expect(getMediaAssetAction).not.toHaveBeenCalled();
  });

  it('sends the signed headers except Content-Length, and PUTs by default', async () => {
    vi.mocked(requestProfilePictureUploadAction).mockResolvedValueOnce({
      ok: true,
      data: {
        mediaAsset: { id: ASSET_ID },
        upload: {
          url: UPLOAD_URL,
          headers: { 'Content-Length': '2048', 'x-amz-acl': 'public-read' },
        } as never,
      },
    });
    const file = photo();

    await uploadPictureFile(file);

    expect(fetchMock).toHaveBeenCalledWith(UPLOAD_URL, {
      method: 'PUT',
      headers: { 'Content-Type': 'image/png', 'x-amz-acl': 'public-read' },
      body: file,
    });
  });

  it('PUTs without signed headers when the ticket has none', async () => {
    vi.mocked(requestProfilePictureUploadAction).mockResolvedValueOnce({
      ok: true,
      data: { mediaAsset: { id: ASSET_ID }, upload: { url: UPLOAD_URL } as never },
    });

    await expect(uploadPictureFile(photo())).resolves.toBe(ASSET_ID);
    expect(fetchMock.mock.calls[0][1]).toMatchObject({
      method: 'PUT',
      headers: { 'Content-Type': 'image/png' },
    });
  });

  it('refuses an invalid file without reserving an upload', async () => {
    await expect(uploadPictureFile(photo('application/pdf'))).rejects.toMatchObject({
      status: 422,
    });
    expect(requestProfilePictureUploadAction).not.toHaveBeenCalled();
  });

  it('stops before confirming when the storage rejects the PUT', async () => {
    fetchMock.mockResolvedValue(new Response(null, { status: 403 }));

    await expect(uploadPictureFile(photo())).rejects.toThrow(/não foi possível enviar a foto/i);
    expect(completeMediaUploadAction).not.toHaveBeenCalled();
  });

  it('reports a network failure of the PUT in Portuguese', async () => {
    fetchMock.mockRejectedValue(new TypeError('Failed to fetch'));

    await expect(uploadPictureFile(photo())).rejects.toMatchObject({ status: 0 });
  });

  it('surfaces the action error (e.g. expired session) as ApiError', async () => {
    vi.mocked(requestProfilePictureUploadAction).mockResolvedValue({
      ok: false,
      status: 422,
      message: 'Envie uma imagem JPG, PNG ou WebP de até 5 MB',
    });

    await expect(uploadPictureFile(photo())).rejects.toThrow('JPG, PNG ou WebP');
    expect(fetchMock).not.toHaveBeenCalled();
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

describe('preparePictureFile', () => {
  const bitmap = (width: number, height: number) => ({ width, height, close: vi.fn() });
  const context = { fillStyle: '', fillRect: vi.fn(), drawImage: vi.fn() };
  let canvases: HTMLCanvasElement[];
  let encoded: Blob | null;

  beforeEach(() => {
    canvases = [];
    encoded = new Blob([new Uint8Array(900)], { type: 'image/jpeg' });
    context.fillRect.mockClear();
    context.drawImage.mockClear();
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockImplementation(function (
      this: HTMLCanvasElement
    ) {
      canvases.push(this);
      return context as unknown as CanvasRenderingContext2D;
    } as never);
    vi.spyOn(HTMLCanvasElement.prototype, 'toBlob').mockImplementation((callback) =>
      callback(encoded)
    );
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('refuses another file type or an empty file before opening it', async () => {
    const decode = vi.fn();
    vi.stubGlobal('createImageBitmap', decode);

    await expect(preparePictureFile(photo('application/pdf'))).rejects.toMatchObject({
      name: 'PictureFileError',
      problem: 'invalid-file',
    });
    await expect(preparePictureFile(photo('image/png', 0))).rejects.toMatchObject({
      problem: 'invalid-file',
    });
    expect(decode).not.toHaveBeenCalled();
    expect(pictureFileProblem(photo('image/webp'))).toBeNull();
  });

  it('sends a photo already small in pixels and bytes as it is', async () => {
    const small = bitmap(PICTURE_MAX_SIDE_PX, 900);
    vi.stubGlobal('createImageBitmap', vi.fn().mockResolvedValue(small));
    const file = photo('image/png', 1024 * 1024);

    await expect(preparePictureFile(file)).resolves.toBe(file);
    expect(small.close).toHaveBeenCalledTimes(1);
    expect(canvases).toHaveLength(0);
  });

  it('shrinks a large phone photo to a JPEG, keeping its orientation and proportions', async () => {
    const decode = vi.fn().mockResolvedValue(bitmap(4000, 3000));
    vi.stubGlobal('createImageBitmap', decode);
    const file = new File([new Uint8Array(8 * 1024 * 1024)], 'IMG_0001.png', {
      type: 'image/png',
    });

    const prepared = await preparePictureFile(file);

    expect(decode).toHaveBeenCalledWith(file, { imageOrientation: 'from-image' });
    expect(canvases[0].width).toBe(1600);
    expect(canvases[0].height).toBe(1200);
    // White behind the photo: JPEG has no transparency.
    expect(context.fillRect).toHaveBeenCalledWith(0, 0, 1600, 1200);
    expect(context.drawImage).toHaveBeenCalledWith(expect.anything(), 0, 0, 1600, 1200);
    expect(HTMLCanvasElement.prototype.toBlob).toHaveBeenCalledWith(
      expect.any(Function),
      'image/jpeg',
      0.85
    );
    expect(prepared).not.toBe(file);
    expect(prepared.type).toBe('image/jpeg');
    expect(prepared.name).toBe('IMG_0001.jpg');
    expect(prepared.size).toBe(900);
  });

  it('re-encodes a photo heavy in bytes without enlarging it', async () => {
    vi.stubGlobal('createImageBitmap', vi.fn().mockResolvedValue(bitmap(800, 600)));

    const prepared = await preparePictureFile(photo('image/png', 1024 * 1024 + 1));

    expect(canvases[0].width).toBe(800);
    expect(canvases[0].height).toBe(600);
    expect(prepared.type).toBe('image/jpeg');
    expect(prepared.name).toBe('foto.jpg');
  });

  it('keeps the original when the re-encoded photo is not smaller', async () => {
    vi.stubGlobal('createImageBitmap', vi.fn().mockResolvedValue(bitmap(3000, 3000)));
    const file = photo('image/jpeg', 900);

    await expect(preparePictureFile(file)).resolves.toBe(file);

    encoded = null;
    await expect(preparePictureFile(file)).resolves.toBe(file);
  });

  it('refuses an image the browser cannot open', async () => {
    vi.stubGlobal('createImageBitmap', vi.fn().mockRejectedValue(new Error('decode')));

    await expect(preparePictureFile(photo())).rejects.toMatchObject({ problem: 'unreadable' });
  });

  it('refuses the image when the browser gives no canvas', async () => {
    const large = bitmap(4000, 3000);
    vi.stubGlobal('createImageBitmap', vi.fn().mockResolvedValue(large));
    vi.mocked(HTMLCanvasElement.prototype.getContext).mockReturnValue(null);

    await expect(preparePictureFile(photo())).rejects.toMatchObject({ problem: 'unreadable' });
    expect(large.close).toHaveBeenCalledTimes(1);
  });

  it('refuses a photo still above 5 MB after shrinking', async () => {
    vi.stubGlobal('createImageBitmap', vi.fn().mockResolvedValue(bitmap(4000, 3000)));
    encoded = new Blob([new Uint8Array(5 * 1024 * 1024 + 1)]);

    await expect(preparePictureFile(photo('image/jpeg', 6 * 1024 * 1024))).rejects.toMatchObject({
      problem: 'too-large',
    });
  });

  it('sends the file as it is where the browser cannot shrink it, up to 5 MB', async () => {
    vi.stubGlobal('createImageBitmap', undefined);
    const file = photo('image/jpeg', 5 * 1024 * 1024);

    await expect(preparePictureFile(file)).resolves.toBe(file);
    await expect(
      preparePictureFile(photo('image/jpeg', 5 * 1024 * 1024 + 1))
    ).rejects.toMatchObject({ problem: 'too-large' });
  });
});

describe('changeProfilePicture', () => {
  const send = (progress?: PictureSendProgress, onStage = vi.fn()) => {
    const promise = changeProfilePicture({ file: photo(), progress, onStage });
    promise.catch(() => {});
    return { promise, onStage };
  };

  beforeEach(() => {
    vi.useFakeTimers();
    vi.stubGlobal('createImageBitmap', undefined);
    vi.mocked(updateHeader).mockResolvedValue({ profilePictureUrl: READY_URL });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('shrinks, uploads, waits for the processing and only then links the photo', async () => {
    const order: string[] = [];
    fetchMock.mockImplementation(async () => {
      order.push('upload');
      return new Response(null, { status: 200 });
    });
    vi.mocked(getMediaAssetAction).mockImplementation(async () => {
      order.push('processed');
      return assetState('READY', READY_URL);
    });
    vi.mocked(updateHeader).mockImplementation(async () => {
      order.push('link');
      return { profilePictureUrl: READY_URL };
    });

    const { promise, onStage } = send();
    await vi.runAllTimersAsync();

    await expect(promise).resolves.toEqual({ url: READY_URL });
    expect(order).toEqual(['upload', 'processed', 'link']);
    expect(updateHeader).toHaveBeenCalledWith({ profilePictureId: ASSET_ID });
    expect(onStage.mock.calls.map(([stage]) => stage)).toEqual([
      'preparing',
      'uploading',
      'finishing',
    ]);
  });

  it('uses the processed URL when the account answer has none', async () => {
    vi.mocked(updateHeader).mockResolvedValue({});

    const { promise } = send();
    await vi.runAllTimersAsync();

    await expect(promise).resolves.toEqual({ url: READY_URL });
  });

  it('links a photo still processing after the wait and reports no URL yet', async () => {
    vi.mocked(getMediaAssetAction).mockResolvedValue(assetState('PROCESSING'));
    vi.mocked(updateHeader).mockResolvedValue({ profilePictureUrl: null });

    const { promise } = send();
    await vi.runAllTimersAsync();

    await expect(promise).resolves.toEqual({ url: null });
    expect(updateHeader).toHaveBeenCalledWith({ profilePictureId: ASSET_ID });
  });

  it('links nothing when the upload fails, and tries the upload again', async () => {
    fetchMock.mockRejectedValueOnce(new TypeError('offline'));
    const progress: PictureSendProgress = {};

    const first = send(progress);
    await vi.runAllTimersAsync();
    await expect(first.promise).rejects.toMatchObject({ status: 0 });
    expect(updateHeader).not.toHaveBeenCalled();
    expect(progress.assetId).toBeUndefined();

    const second = send(progress);
    await vi.runAllTimersAsync();
    await expect(second.promise).resolves.toEqual({ url: READY_URL });
    expect(second.onStage.mock.calls.map(([stage]) => stage)).toEqual(['uploading', 'finishing']);
  });

  it('keeps the previous photo and drops the asset when the backend cannot process it', async () => {
    vi.mocked(getMediaAssetAction).mockResolvedValue(assetState('FAILED'));
    const progress: PictureSendProgress = {};

    const { promise } = send(progress);
    await vi.runAllTimersAsync();

    await expect(promise).rejects.toMatchObject({ code: PICTURE_PROCESSING_FAILED_CODE });
    expect(updateHeader).not.toHaveBeenCalled();
    expect(progress.assetId).toBeUndefined();
  });

  it('resumes from the link without uploading again when only the link failed', async () => {
    vi.mocked(updateHeader).mockRejectedValueOnce(new ApiError('fora do ar', 502));
    const progress: PictureSendProgress = {};

    const first = send(progress);
    await vi.runAllTimersAsync();
    await expect(first.promise).rejects.toMatchObject({ status: 502 });
    expect(progress).toMatchObject({ assetId: ASSET_ID, processedUrl: READY_URL });

    const second = send(progress);
    await vi.runAllTimersAsync();
    await expect(second.promise).resolves.toEqual({ url: READY_URL });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(getMediaAssetAction).toHaveBeenCalledTimes(1);
    expect(updateHeader).toHaveBeenCalledTimes(2);
    expect(second.onStage.mock.calls.map(([stage]) => stage)).toEqual(['finishing']);
  });

  it.each([404, 422])(
    'uploads again when the backend no longer takes the asset (%i)',
    async (status) => {
      vi.mocked(updateHeader).mockRejectedValueOnce(new ApiError('Imagem não existe', status));
      const progress: PictureSendProgress = {};

      const first = send(progress);
      await vi.runAllTimersAsync();
      await expect(first.promise).rejects.toMatchObject({ status });
      expect(progress.assetId).toBeUndefined();
      expect(progress.processedUrl).toBeUndefined();
      expect(progress.prepared).toBeDefined();

      const second = send(progress);
      await vi.runAllTimersAsync();
      await expect(second.promise).resolves.toEqual({ url: READY_URL });
      expect(fetchMock).toHaveBeenCalledTimes(2);
    }
  );

  it('keeps the asset when the link fails for another reason than an ApiError', async () => {
    vi.mocked(updateHeader).mockRejectedValueOnce(new Error('inesperado'));
    const progress: PictureSendProgress = {};

    const { promise } = send(progress);
    await vi.runAllTimersAsync();

    await expect(promise).rejects.toThrow('inesperado');
    expect(progress.assetId).toBe(ASSET_ID);
  });

  it('works without a progress object or a stage listener', async () => {
    const promise = changeProfilePicture({ file: photo() });
    await vi.runAllTimersAsync();

    await expect(promise).resolves.toEqual({ url: READY_URL });
  });
});

describe('removeProfilePicture', () => {
  it('unlinks the photo with profilePictureId null', async () => {
    await removeProfilePicture();

    expect(updateHeader).toHaveBeenCalledWith({ profilePictureId: null });
  });
});

describe('pictureErrorScreen', () => {
  const online = (value: boolean) =>
    vi.spyOn(window.navigator, 'onLine', 'get').mockReturnValue(value);

  beforeEach(() => {
    online(true);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('asks for another file when the chosen one cannot be used', () => {
    expect(pictureErrorScreen(new PictureFileError('invalid-file'))).toEqual({
      kind: 'invalid-file',
      title: 'Não dá para usar este arquivo',
      message: 'Escolha uma foto em JPG, PNG ou WebP.',
      canRetry: false,
      canPickAnother: true,
    });
    expect(pictureErrorScreen(new PictureFileError('unreadable'))).toEqual({
      kind: 'unreadable',
      title: 'Não conseguimos abrir esta imagem',
      message: 'Escolha outra foto.',
      canRetry: false,
      canPickAnother: true,
    });
    expect(pictureErrorScreen(new PictureFileError('too-large'))).toEqual({
      kind: 'too-large',
      title: 'Esta foto é grande demais',
      message: 'Escolha uma foto menor.',
      canRetry: false,
      canPickAnother: true,
    });
  });

  it('blames the connection when the request never left or the device is offline', () => {
    const offline = {
      kind: 'offline',
      title: 'Sem conexão com a internet',
      message: 'Verifique seu Wi‑Fi ou seus dados móveis e tente de novo.',
      canRetry: true,
      canPickAnother: false,
    };
    expect(pictureErrorScreen(new ApiError('rede', 0))).toEqual(offline);

    online(false);
    expect(pictureErrorScreen(new ApiError('fora do ar', 502))).toEqual(offline);
    // The file itself is still the problem, even offline.
    expect(pictureErrorScreen(new PictureFileError('unreadable')).kind).toBe('unreadable');
  });

  it('offers to try again or pick another photo when the send fails', () => {
    const failed = {
      kind: 'send-failed',
      title: 'Não foi possível enviar a foto',
      message: 'Tente novamente em instantes.',
      canRetry: true,
      canPickAnother: true,
    };
    expect(pictureErrorScreen(new ApiError('fora do ar', 502))).toEqual(failed);
    expect(pictureErrorScreen(new ApiError('recusado', 403))).toEqual(failed);
    expect(pictureErrorScreen(new Error('inesperado'))).toEqual(failed);
    expect(pictureErrorScreen(undefined)).toEqual(failed);
  });

  it('asks to wait after too many attempts', () => {
    expect(pictureErrorScreen(new ApiError('calma', 429))).toEqual({
      kind: 'rate-limited',
      title: 'Muitas tentativas seguidas',
      message: 'Aguarde um minuto e tente de novo.',
      canRetry: true,
      canPickAnother: false,
    });
  });

  it('asks for another photo when the backend could not process the image', () => {
    expect(
      pictureErrorScreen(new ApiError('falhou', 422, {}, PICTURE_PROCESSING_FAILED_CODE))
    ).toEqual({
      kind: 'processing-failed',
      title: 'Não conseguimos usar esta imagem',
      message: 'Escolha outra foto.',
      canRetry: false,
      canPickAnother: true,
    });
  });

  it('tells an expired session apart from a failed send', () => {
    expect(isSessionExpired(new ApiError('sessão', 401))).toBe(true);
    expect(isSessionExpired(new ApiError('fora do ar', 502))).toBe(false);
    expect(isSessionExpired(new Error('401'))).toBe(false);
  });
});
