import { beforeEach, describe, expect, it, vi } from 'vitest';
import { GET, POST } from './route';
import { DELETE, GET as GET_ONE, PATCH } from './[id]/route';
import { backendMock, ACCESS, resetActionHarness } from '@/test/actionHarness';
import { clearRefreshCache } from '@/lib/api/bff';

vi.mock('next/headers', async () => (await import('@/test/actionHarness')).headersMock);
vi.mock('@/lib/api/backend', async () => (await import('@/test/actionHarness')).backendMock);
const backendFetch = backendMock.backendFetch;

const ID = '018f0000-0000-7000-8000-000000000001';
const ASSET = '018f0000-0000-7000-8000-000000000002';
const ctx = (id: string) => ({ params: Promise.resolve({ id }) });
const req = (url: string, method: string, body?: unknown) =>
  new Request(`http://localhost:3000${url}`, {
    method,
    body: body === undefined ? undefined : JSON.stringify(body),
  });

beforeEach(() => {
  resetActionHarness();
  clearRefreshCache();
});

describe('GET /api/impact-projects', () => {
  it('forwards only the supported filters and returns data with cursor meta', async () => {
    vi.mocked(backendFetch).mockResolvedValue({
      data: { impactProjects: [{ id: ID }] },
      meta: { nextCursor: null, hasMore: false },
    });

    const res = await GET(req('/api/impact-projects?missionaryId=m1&limit=1&evil=1', 'GET'));

    expect(vi.mocked(backendFetch).mock.calls[0][0]).toBe(
      '/impact-projects?missionaryId=m1&limit=1'
    );
    expect(vi.mocked(backendFetch).mock.calls[0][1]).toMatchObject({ accessToken: ACCESS });
    expect(await res.json()).toEqual({
      data: [{ id: ID }],
      meta: { nextCursor: null, hasMore: false },
    });
  });
});

describe('POST /api/impact-projects', () => {
  it('creates the project with the cover asset', async () => {
    vi.mocked(backendFetch).mockResolvedValue({ data: { impactProject: { id: ID } } });

    const res = await POST(
      req('/api/impact-projects', 'POST', {
        title: ' Escola ',
        description: 'Desc',
        coverImageAssetId: ASSET,
        videoUrl: 'https://youtu.be/dQw4w9WgXcQ',
      })
    );

    expect(res.status).toBe(201);
    expect(vi.mocked(backendFetch).mock.calls[0][1]).toMatchObject({
      method: 'POST',
      body: {
        title: 'Escola',
        description: 'Desc',
        coverImageAssetId: ASSET,
        videoUrl: 'https://youtu.be/dQw4w9WgXcQ',
      },
    });
  });

  it('rejects a missing cover with field errors and never calls the backend', async () => {
    const res = await POST(
      req('/api/impact-projects', 'POST', { title: 'Escola', description: 'Desc' })
    );

    expect(res.status).toBe(422);
    expect((await res.json()).fieldErrors).toHaveProperty('coverImageAssetId');
    expect(backendFetch).not.toHaveBeenCalled();
  });
});

describe('/api/impact-projects/[id]', () => {
  it('rejects an id that is not a uuid', async () => {
    expect((await GET_ONE(req('/x', 'GET'), ctx('abc'))).status).toBe(422);
    expect((await DELETE(req('/x', 'DELETE'), ctx('../etc'))).status).toBe(422);
    expect(backendFetch).not.toHaveBeenCalled();
  });

  it('patches with a null video to remove it', async () => {
    vi.mocked(backendFetch).mockResolvedValue({ data: { impactProject: { id: ID } } });

    const res = await PATCH(req('/x', 'PATCH', { videoUrl: null }), ctx(ID));

    expect(res.status).toBe(200);
    expect(vi.mocked(backendFetch).mock.calls[0]).toEqual([
      `/impact-projects/${ID}`,
      { method: 'PATCH', body: { videoUrl: null }, accessToken: ACCESS },
    ]);
  });

  it('deletes the project', async () => {
    vi.mocked(backendFetch).mockResolvedValue({ message: 'ok' });
    const res = await DELETE(req('/x', 'DELETE'), ctx(ID));
    expect(res.status).toBe(200);
    expect(vi.mocked(backendFetch).mock.calls[0][0]).toBe(`/impact-projects/${ID}`);
  });
});
