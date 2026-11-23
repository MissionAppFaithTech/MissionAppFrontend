import { ApiError, bffRequest } from '@/lib/api/client';
import type {
  BackendCursorMeta,
  BackendImpactProject,
  BackendMediaAsset,
  BackendMediaUpload,
} from '@/types/backend';
import type { ImpactProjectData } from '@/types/profile';

export const COVER_ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const;
export const COVER_MAX_BYTES = 10 * 1024 * 1024;

/** pt-BR reason a file cannot be a cover, or `null` when it is acceptable. */
export function validateCoverFile(file: File): string | null {
  if (!(COVER_ACCEPTED_TYPES as readonly string[]).includes(file.type)) {
    return 'Use uma imagem JPG, PNG ou WebP.';
  }
  if (file.size > COVER_MAX_BYTES) return 'A imagem deve ter no máximo 10 MB.';
  return null;
}

export function toImpactProjectData(project: BackendImpactProject): ImpactProjectData {
  const coverUrl = project.coverImage?.url ?? '';
  return {
    id: project.id,
    missionaryId: project.missionaryId,
    title: project.title,
    description: project.description,
    imageUrl: coverUrl,
    bannerUrl: coverUrl || undefined,
    videoUrl: project.videoUrl ?? undefined,
    coverStatus: project.coverImage?.status,
  };
}

/** The missionary has at most one project, so the first list entry is it. */
export async function getMissionaryImpactProject(
  missionaryId: string
): Promise<ImpactProjectData | null> {
  const query = new URLSearchParams({ missionaryId, limit: '1' });
  const { data } = await bffRequest<{ data: BackendImpactProject[]; meta?: BackendCursorMeta }>(
    `/api/impact-projects?${query}`,
    { fallbackMessage: 'Não foi possível carregar o seu projeto de impacto' }
  );
  return data[0] ? toImpactProjectData(data[0]) : null;
}

/**
 * Cover upload in three steps: reserve → PUT straight to storage → confirm.
 * Returns the asset id to attach to the project.
 */
export async function uploadCoverImage(file: File): Promise<string> {
  const reserved = await bffRequest<{
    data: { mediaAsset: BackendMediaAsset; upload: BackendMediaUpload };
  }>('/api/media-assets/uploads', {
    method: 'POST',
    body: { purpose: 'IMPACT_PROJECT_COVER', mimeType: file.type, fileSizeBytes: file.size },
    fallbackMessage: 'Não foi possível preparar o envio da imagem',
  });
  const { mediaAsset, upload } = reserved.data;

  // Content-Type is part of the signature. Content-Length is set by the browser
  // itself (a forbidden header name) and matches the declared size.
  const headers = new Headers({ 'Content-Type': file.type });
  for (const [name, value] of Object.entries(upload.headers ?? {})) {
    if (name.toLowerCase() !== 'content-length') headers.set(name, value);
  }

  let storageResponse: Response;
  try {
    storageResponse = await fetch(upload.url, { method: 'PUT', headers, body: file });
  } catch {
    throw new ApiError('Não foi possível enviar a imagem. Verifique sua internet.', 0);
  }
  if (!storageResponse.ok) {
    throw new ApiError(
      'Não foi possível enviar a imagem. Tente novamente.',
      storageResponse.status
    );
  }

  await bffRequest(`/api/media-assets/${mediaAsset.id}/completion`, {
    method: 'POST',
    fallbackMessage: 'Não foi possível confirmar o envio da imagem',
  });
  return mediaAsset.id;
}

export type CreateImpactProjectInput = {
  title: string;
  description: string;
  coverImageAssetId: string;
  videoUrl?: string;
};

export async function createImpactProject(
  input: CreateImpactProjectInput
): Promise<ImpactProjectData> {
  const { data } = await bffRequest<{ data: { impactProject: BackendImpactProject } }>(
    '/api/impact-projects',
    {
      method: 'POST',
      body: input,
      fallbackMessage: 'Não foi possível criar o projeto de impacto',
    }
  );
  return toImpactProjectData(data.impactProject);
}

export type UpdateImpactProjectInput = {
  title?: string;
  description?: string;
  coverImageAssetId?: string;
  /** `null` removes the video. */
  videoUrl?: string | null;
};

export async function updateImpactProject(
  id: string,
  input: UpdateImpactProjectInput
): Promise<ImpactProjectData> {
  const { data } = await bffRequest<{ data: { impactProject: BackendImpactProject } }>(
    `/api/impact-projects/${id}`,
    {
      method: 'PATCH',
      body: input,
      fallbackMessage: 'Não foi possível salvar o projeto de impacto',
    }
  );
  return toImpactProjectData(data.impactProject);
}

export async function deleteImpactProject(id: string): Promise<void> {
  await bffRequest(`/api/impact-projects/${id}`, {
    method: 'DELETE',
    fallbackMessage: 'Não foi possível excluir o projeto de impacto',
  });
}
