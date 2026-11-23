import { afterEach, beforeEach, describe, expect, it, vi, type MockInstance } from 'vitest';
import { ApiError } from '@/lib/api/client';
import {
  createImpactProject,
  deleteImpactProject,
  getMissionaryImpactProject,
  toImpactProjectData,
  updateImpactProject,
  uploadCoverImage,
  validateCoverFile,
} from './impactProject.service';

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });

const backendProject = {
  id: 'p-1',
  title: 'Escola',
  description: 'Desc',
  missionaryId: 'm-1',
  coverImageAssetId: 'a-1',
  videoUrl: 'https://www.youtube.com/embed/abc',
  coverImage: { id: 'a-1', status: 'READY', url: 'https://cdn.test/c.webp' },
};

let fetchMock: MockInstance;
beforeEach(() => {
  fetchMock = vi.spyOn(globalThis, 'fetch');
});
afterEach(() => vi.restoreAllMocks());

describe('toImpactProjectData', () => {
  it('maps the cover url and video, leaving an empty cover while processing', () => {
    expect(toImpactProjectData(backendProject as never)).toMatchObject({
      id: 'p-1',
      missionaryId: 'm-1',
      imageUrl: 'https://cdn.test/c.webp',
      videoUrl: 'https://www.youtube.com/embed/abc',
      coverStatus: 'READY',
    });

    const processing = toImpactProjectData({
      ...backendProject,
      videoUrl: null,
      coverImage: { id: 'a-1', status: 'PROCESSING', url: null },
    } as never);
    expect(processing.imageUrl).toBe('');
    expect(processing.bannerUrl).toBeUndefined();
    expect(processing.videoUrl).toBeUndefined();
  });
});

describe('validateCoverFile', () => {
  it('accepts jpeg/png/webp up to 10 MB only', () => {
    const file = (type: string, size: number) => {
      const f = new File(['x'], 'f', { type });
      Object.defineProperty(f, 'size', { value: size });
      return f;
    };
    expect(validateCoverFile(file('image/webp', 100))).toBeNull();
    expect(validateCoverFile(file('image/gif', 100))).toMatch(/JPG, PNG ou WebP/);
    expect(validateCoverFile(file('image/png', 10 * 1024 * 1024 + 1))).toMatch(/10 MB/);
  });
});

describe('getMissionaryImpactProject', () => {
  it('queries by missionary with limit 1 and returns the first project', async () => {
    fetchMock.mockResolvedValue(json({ data: [backendProject], meta: { hasMore: false } }));

    const project = await getMissionaryImpactProject('m-1');

    expect(fetchMock.mock.calls[0][0]).toBe('/api/impact-projects?missionaryId=m-1&limit=1');
    expect(project?.title).toBe('Escola');
  });

  it('returns null when the missionary has no project', async () => {
    fetchMock.mockResolvedValue(json({ data: [], meta: { hasMore: false } }));
    expect(await getMissionaryImpactProject('m-1')).toBeNull();
  });
});

describe('uploadCoverImage', () => {
  const file = new File(['abc'], 'capa.jpg', { type: 'image/jpeg' });
  const reserved = {
    data: {
      mediaAsset: { id: 'asset-1' },
      upload: {
        url: 'https://storage.test/put?sig=1',
        method: 'PUT',
        headers: { 'Content-Type': 'image/jpeg', 'Content-Length': '3' },
      },
    },
  };

  it('reserves, PUTs to storage without Content-Length, then confirms', async () => {
    fetchMock
      .mockResolvedValueOnce(json(reserved))
      .mockResolvedValueOnce(new Response(null, { status: 200 }))
      .mockResolvedValueOnce(json({ data: { mediaAsset: { id: 'asset-1' } } }, 202));

    await expect(uploadCoverImage(file)).resolves.toBe('asset-1');

    const [reserve, put, complete] = fetchMock.mock.calls;
    expect(reserve[0]).toBe('/api/media-assets/uploads');
    expect(JSON.parse(reserve[1].body)).toEqual({
      purpose: 'IMPACT_PROJECT_COVER',
      mimeType: 'image/jpeg',
      fileSizeBytes: 3,
    });
    expect(put[0]).toBe('https://storage.test/put?sig=1');
    expect(put[1].method).toBe('PUT');
    expect(put[1].body).toBe(file);
    expect((put[1].headers as Headers).get('content-type')).toBe('image/jpeg');
    expect((put[1].headers as Headers).has('content-length')).toBe(false);
    expect(complete[0]).toBe('/api/media-assets/asset-1/completion');
  });

  it('does not confirm when the storage rejects the file', async () => {
    fetchMock
      .mockResolvedValueOnce(json(reserved))
      .mockResolvedValueOnce(new Response(null, { status: 403 }));

    await expect(uploadCoverImage(file)).rejects.toMatchObject({ status: 403 });
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('reports a network failure while sending to storage', async () => {
    fetchMock.mockResolvedValueOnce(json(reserved)).mockRejectedValueOnce(new TypeError('net'));
    await expect(uploadCoverImage(file)).rejects.toBeInstanceOf(ApiError);
  });
});

describe('create / update / delete', () => {
  it('creates with the asset id and returns the mapped project', async () => {
    fetchMock.mockResolvedValue(json({ data: { impactProject: backendProject } }, 201));

    const created = await createImpactProject({
      title: 'Escola',
      description: 'Desc',
      coverImageAssetId: 'a-1',
    });

    expect(fetchMock.mock.calls[0][1].method).toBe('POST');
    expect(created.id).toBe('p-1');
  });

  it('patches only the given fields, allowing a null video', async () => {
    fetchMock.mockResolvedValue(json({ data: { impactProject: backendProject } }));

    await updateImpactProject('p-1', { videoUrl: null });

    expect(fetchMock.mock.calls[0][0]).toBe('/api/impact-projects/p-1');
    expect(fetchMock.mock.calls[0][1].method).toBe('PATCH');
    expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toEqual({ videoUrl: null });
  });

  it('deletes by id', async () => {
    fetchMock.mockResolvedValue(json({ message: 'ok' }));
    await deleteImpactProject('p-1');
    expect(fetchMock.mock.calls[0][1].method).toBe('DELETE');
  });

  it('surfaces the backend message when the missionary already has a project', async () => {
    fetchMock.mockResolvedValue(
      json({ message: 'Missionário já possui um projeto de impacto cadastrado' }, 409)
    );
    await expect(
      createImpactProject({ title: 't', description: 'd', coverImageAssetId: 'a' })
    ).rejects.toThrow(/já possui um projeto/);
  });
});
