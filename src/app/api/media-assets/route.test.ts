import { beforeEach, describe, expect, it, vi } from 'vitest';
import { POST as complete } from './[id]/completion/route';
import { POST as reserve } from './uploads/route';
import { backendMock, resetActionHarness } from '@/test/actionHarness';
import { clearRefreshCache } from '@/lib/api/bff';

vi.mock('next/headers', async () => (await import('@/test/actionHarness')).headersMock);
vi.mock('@/lib/api/backend', async () => (await import('@/test/actionHarness')).backendMock);
const backendFetch = backendMock.backendFetch;

const ID = '018f0000-0000-7000-8000-000000000002';
const post = (body: unknown) =>
  reserve(
    new Request('http://localhost:3000/api/media-assets/uploads', {
      method: 'POST',
      body: JSON.stringify(body),
    })
  );
const completion = (id: string) =>
  complete(new Request('http://localhost:3000/x', { method: 'POST' }), {
    params: Promise.resolve({ id }),
  });

beforeEach(() => {
  resetActionHarness();
  clearRefreshCache();
});

describe('POST /api/media-assets/uploads', () => {
  it('reserves a cover upload and returns the presigned instructions', async () => {
    const data = { mediaAsset: { id: ID }, upload: { url: 'https://s.test/put', headers: {} } };
    vi.mocked(backendFetch).mockResolvedValue({ data });

    const res = await post({
      purpose: 'IMPACT_PROJECT_COVER',
      mimeType: 'image/jpeg',
      fileSizeBytes: 204800,
    });

    expect(await res.json()).toEqual({ data });
    expect(vi.mocked(backendFetch).mock.calls[0][0]).toBe('/media-assets/uploads');
  });

  it.each([
    { mimeType: 'image/gif', fileSizeBytes: 10 },
    { mimeType: 'image/png', fileSizeBytes: 10 * 1024 * 1024 + 1 },
  ])('rejects %o before reaching the backend', async (file) => {
    const res = await post({ purpose: 'IMPACT_PROJECT_COVER', ...file });
    expect(res.status).toBe(422);
    expect(backendFetch).not.toHaveBeenCalled();
  });
});

describe('POST /api/media-assets/[id]/completion', () => {
  it('confirms the upload and answers 202', async () => {
    vi.mocked(backendFetch).mockResolvedValue({ data: { mediaAsset: { id: ID } } });
    const res = await completion(ID);
    expect(res.status).toBe(202);
    expect(vi.mocked(backendFetch).mock.calls[0][0]).toBe(`/media-assets/${ID}/completion`);
  });

  it('rejects an id that is not a uuid', async () => {
    expect((await completion('nope')).status).toBe(422);
  });
});
