import { NextResponse } from 'next/server';
import { cepDigits, maskCep } from '@/lib/masks';

type ViaCepResponse = {
  erro?: boolean;
  cep?: string;
  logradouro?: string;
  localidade?: string;
  uf?: string;
};

export async function GET(request: Request) {
  const cep = cepDigits(new URL(request.url).searchParams.get('cep') ?? '');

  if (cep.length !== 8) {
    return NextResponse.json({ message: 'Informe um CEP brasileiro com 8 dígitos' }, { status: 422 });
  }

  try {
    const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`, {
      headers: { Accept: 'application/json' },
      cache: 'no-store',
      signal: AbortSignal.timeout(6000),
    });

    if (!response.ok) {
      return NextResponse.json({ message: 'Não foi possível consultar o CEP' }, { status: 502 });
    }

    const payload = (await response.json()) as ViaCepResponse;
    if (payload.erro || !payload.localidade || !payload.uf) {
      return NextResponse.json({ message: 'CEP não encontrado' }, { status: 404 });
    }

    return NextResponse.json({
      data: {
        zipCode: maskCep(payload.cep ?? cep),
        address1: payload.logradouro?.trim() ?? '',
        city: payload.localidade.trim(),
        state: payload.uf.trim(),
        country: 'Brasil',
      },
    });
  } catch (error) {
    console.error('[api/cep]', error);
    return NextResponse.json({ message: 'Não foi possível consultar o CEP' }, { status: 502 });
  }
}
