import { NextResponse } from 'next/server';
import { z } from 'zod';
import { backendFetch } from '@/lib/api/backend';
import { withSession } from '@/lib/api/bff';
import type { BackendMediaAsset } from '@/types/backend';

type RouteContext = { params: Promise<{ id: string }> };

/** Confirms the direct-to-storage upload so the backend validates and compresses it. */
export async function POST(_request: Request, { params }: RouteContext) {
  const { id } = await params;
  if (!z.uuid().safeParse(id).success) {
    return NextResponse.json({ message: 'Arquivo inválido' }, { status: 422 });
  }

  return withSession(
    'api/media-assets/completion',
    'Não foi possível confirmar o envio da imagem',
    async (accessToken) => {
      const result = await backendFetch<{ data: { mediaAsset: BackendMediaAsset } }>(
        `/media-assets/${id}/completion`,
        { method: 'POST', accessToken }
      );
      return NextResponse.json({ data: result.data }, { status: 202 });
    }
  );
}
