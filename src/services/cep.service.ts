import { cepDigits, maskCep } from '@/lib/masks';

export type CepAddress = {
  zipCode: string;
  address1: string;
  city: string;
  state: string;
  country: string;
};

export class CepLookupError extends Error {
  constructor(
    message: string,
    public status: number
  ) {
    super(message);
    this.name = 'CepLookupError';
  }
}

export async function lookupCep(value: string): Promise<CepAddress> {
  const cep = cepDigits(value);
  const response = await fetch(`/api/cep?cep=${encodeURIComponent(cep)}`, {
    method: 'GET',
    headers: { Accept: 'application/json' },
    cache: 'no-store',
  });

  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    const message =
      payload && typeof payload === 'object' && 'message' in payload
        ? String((payload as { message: unknown }).message)
        : 'Não foi possível buscar o CEP';
    throw new CepLookupError(message, response.status);
  }

  const data =
    payload && typeof payload === 'object' && 'data' in payload
      ? (payload as { data: CepAddress }).data
      : null;

  if (!data?.city || !data.state) {
    throw new CepLookupError('Resposta de CEP inválida', 502);
  }

  return {
    zipCode: maskCep(data.zipCode || cep),
    address1: data.address1?.trim() ?? '',
    city: data.city.trim(),
    state: data.state.trim(),
    country: data.country?.trim() || 'Brasil',
  };
}
