import { beforeEach, describe, expect, it, vi } from 'vitest';
import { clearRefreshCache } from '@/lib/api/bff';
import {
  ACCESS,
  backendMock,
  cacheMock,
  mockBackend,
  resetActionHarness,
  setSession,
} from '@/test/actionHarness';
import {
  createFaithCommunityAction,
  createMissionaryAgencyAction,
  updateFaithCommunityAction,
} from './catalog';

vi.mock('next/headers', async () => (await import('@/test/actionHarness')).headersMock);
vi.mock('next/cache', async () => (await import('@/test/actionHarness')).cacheMock);
vi.mock('@/lib/api/backend', async () => (await import('@/test/actionHarness')).backendMock);

beforeEach(() => {
  clearRefreshCache();
  resetActionHarness();
});

describe('catalog actions', () => {
  it('creates an agency and returns the new item', async () => {
    mockBackend({
      'POST /missionary-agencies': () => ({
        data: { missionaryAgency: { id: 'ag-1', name: 'JMN', city: 'Rio' } },
      }),
    });

    await expect(createMissionaryAgencyAction({ name: ' JMN ', city: 'Rio' })).resolves.toEqual({
      ok: true,
      data: { id: 'ag-1', name: 'JMN' },
    });
    expect(backendMock.backendFetch).toHaveBeenCalledWith('/missionary-agencies', {
      method: 'POST',
      body: { name: 'JMN', city: 'Rio' },
      accessToken: ACCESS,
    });
    // The cached BFF searches must list the new agency at once (ADR-0041).
    expect(cacheMock.updateTag.mock.calls).toEqual([['catalog:missionaryAgencies']]);
  });

  it('creates a faith community', async () => {
    mockBackend({
      'POST /faith-communities': () => ({
        data: { faithCommunity: { id: 'fc-1', name: 'Igreja Batista Central' } },
      }),
    });

    await expect(createFaithCommunityAction({ name: 'Igreja Batista Central' })).resolves.toEqual({
      ok: true,
      data: { id: 'fc-1', name: 'Igreja Batista Central' },
    });
    expect(cacheMock.updateTag.mock.calls).toEqual([['catalog:faithCommunities']]);
  });

  it('sends the pastor of a new faith community', async () => {
    mockBackend({
      'POST /faith-communities': () => ({
        data: { faithCommunity: { id: 'fc-2', name: 'Igreja' } },
      }),
    });

    await createFaithCommunityAction({
      name: 'Igreja',
      pastorName: ' Pr. Ana ',
      pastorPhone: '+5521912345678',
    });

    expect(backendMock.backendFetch).toHaveBeenCalledWith('/faith-communities', {
      method: 'POST',
      body: { name: 'Igreja', pastorName: 'Pr. Ana', pastorPhone: '+5521912345678' },
      accessToken: ACCESS,
    });
  });

  it('rejects a pastor phone without the name or outside E.164', async () => {
    await expect(
      createFaithCommunityAction({ name: 'Igreja', pastorPhone: '+5521912345678' })
    ).resolves.toMatchObject({
      ok: false,
      status: 422,
      fieldErrors: { pastorName: 'Informe o nome do pastor junto com o telefone' },
    });
    await expect(
      createFaithCommunityAction({ name: 'Igreja', pastorName: 'Pr. Ana', pastorPhone: '21 9123' })
    ).resolves.toMatchObject({ ok: false, fieldErrors: { pastorPhone: expect.any(String) } });
    expect(backendMock.backendFetch).not.toHaveBeenCalled();
  });

  it('rejects a nameless entry', async () => {
    await expect(createFaithCommunityAction({ name: '  ' })).resolves.toMatchObject({
      ok: false,
      status: 422,
      message: 'Dados da igreja inválidos',
    });
    await expect(createMissionaryAgencyAction({ name: '' })).resolves.toMatchObject({
      message: 'Dados da agência inválidos',
    });
    expect(backendMock.backendFetch).not.toHaveBeenCalled();
  });

  it('answers 502 when the backend answer has no item', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    mockBackend({ 'POST /faith-communities': () => ({ data: {} }) });

    await expect(createFaithCommunityAction({ name: 'Igreja' })).resolves.toEqual({
      ok: false,
      status: 502,
      message: 'Não foi possível cadastrar a igreja',
    });
    expect(cacheMock.updateTag).not.toHaveBeenCalled();
    vi.mocked(console.error).mockRestore();
  });

  it('needs a session', async () => {
    setSession();

    await expect(createMissionaryAgencyAction({ name: 'JMN' })).resolves.toMatchObject({
      ok: false,
      status: 401,
    });
  });

  it('updates an existing faith community and invalidates the catalog cache', async () => {
    const id = '019a0000-0000-7000-9000-00000000c001';
    mockBackend({
      [`PATCH /faith-communities/${id}`]: () => ({
        data: { faithCommunity: { id, name: 'Igreja Batista Renovada' } },
      }),
      'GET /account/profile': () => ({ data: { user: { username: 'samuel_m' } } }),
    });

    await expect(
      updateFaithCommunityAction(id, {
        name: ' Igreja Batista Renovada ',
        city: 'Niterói',
        pastorName: 'Pr. João',
        pastorPhone: '+5521988887777',
      })
    ).resolves.toEqual({
      ok: true,
      data: { id, name: 'Igreja Batista Renovada' },
    });

    expect(backendMock.backendFetch).toHaveBeenCalledWith(`/faith-communities/${id}`, {
      method: 'PATCH',
      body: {
        name: 'Igreja Batista Renovada',
        city: 'Niterói',
        pastorName: 'Pr. João',
        pastorPhone: '+5521988887777',
      },
      accessToken: ACCESS,
    });
    expect(cacheMock.updateTag).toHaveBeenCalledWith('catalog:faithCommunities');
    expect(cacheMock.updateTag).toHaveBeenCalledWith('profile:samuel_m');
  });

  it('rejects updating a faith community with an invalid UUID', async () => {
    await expect(updateFaithCommunityAction('nao-uuid', { name: 'Igreja' })).resolves.toMatchObject(
      {
        ok: false,
        status: 422,
        message: 'Comunidade de fé inválida',
      }
    );
    expect(backendMock.backendFetch).not.toHaveBeenCalled();
  });
});
