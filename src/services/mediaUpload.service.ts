import { ApiError } from '@/lib/api/client';
import type { MediaUploadTicket } from '@/types/backend';

/** Shared direct-to-storage transport. Only metadata passes through the BFF. */
export async function uploadMediaFile(file: File, ticket: MediaUploadTicket): Promise<void> {
  const headers = Object.fromEntries(
    Object.entries(ticket.upload.headers ?? {}).filter(
      ([name]) => name.toLowerCase() !== 'content-length'
    )
  );
  let response: Response;
  try {
    response = await fetch(ticket.upload.url, {
      method: ticket.upload.method ?? 'PUT',
      headers: { 'Content-Type': file.type, ...headers },
      body: file,
      credentials: 'omit',
    });
  } catch {
    throw new ApiError(
      'Não foi possível enviar a foto. Verifique sua conexão e tente novamente.',
      0
    );
  }
  if (!response.ok)
    throw new ApiError(
      'Não foi possível enviar a foto. Verifique sua conexão e tente novamente.',
      response.status
    );
}
