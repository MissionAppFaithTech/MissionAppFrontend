import { beforeEach, describe, expect, it, vi } from 'vitest';
import { GET } from './route';

describe('GET /api/cep', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('returns 422 when the CEP does not have 8 digits', async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);

    const response = await GET(new Request('http://localhost:3000/api/cep?cep=01310'));
    expect(response.status).toBe(422);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('keeps the ViaCEP request on the fixed host when the query contains extra characters', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          cep: '01310-100',
          logradouro: 'Avenida Paulista',
          localidade: 'São Paulo',
          uf: 'SP',
        }),
      })
    );

    const response = await GET(
      new Request('http://localhost:3000/api/cep?cep=01310-100/../https://evil.example')
    );

    expect(fetch).toHaveBeenCalledWith(
      'https://viacep.com.br/ws/01310100/json/',
      expect.objectContaining({ headers: { Accept: 'application/json' } })
    );
    expect(response.status).toBe(200);
  });

  it('maps a ViaCEP payload to address fields', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          cep: '01310-100',
          logradouro: 'Avenida Paulista',
          localidade: 'São Paulo',
          uf: 'SP',
        }),
      })
    );

    const response = await GET(new Request('http://localhost:3000/api/cep?cep=01310100'));
    expect(fetch).toHaveBeenCalledWith(
      'https://viacep.com.br/ws/01310100/json/',
      expect.objectContaining({
        headers: { Accept: 'application/json' },
        cache: 'no-store',
      })
    );
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      data: {
        zipCode: '01310-100',
        address1: 'Avenida Paulista',
        city: 'São Paulo',
        state: 'SP',
        country: 'Brasil',
      },
    });
  });

  it('returns 404 when ViaCEP marks the CEP as missing', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ erro: true }),
      })
    );

    const response = await GET(new Request('http://localhost:3000/api/cep?cep=00000000'));
    expect(fetch).toHaveBeenCalledWith(
      'https://viacep.com.br/ws/00000000/json/',
      expect.objectContaining({ headers: { Accept: 'application/json' } })
    );
    expect(response.status).toBe(404);
  });
});
