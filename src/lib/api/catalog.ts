import type { CatalogItem, CatalogListResponse } from '@/services/catalog.service';

/**
 * Parses the backend catalog payloads (agencies, faith communities). Plain
 * functions, shared by the BFF routes, the Server Actions and the browser.
 */

function catalogItemsFrom(payload: unknown, collectionKey: string): CatalogItem[] {
  const root =
    payload && typeof payload === 'object' && 'data' in payload
      ? (payload as { data: unknown }).data
      : payload;

  const source = Array.isArray(root)
    ? root
    : root && typeof root === 'object' && collectionKey in root
      ? (root as Record<string, unknown>)[collectionKey]
      : [];

  if (!Array.isArray(source)) return [];

  return source.flatMap((item) => {
    if (!item || typeof item !== 'object') return [];
    const id = 'id' in item && typeof item.id === 'string' ? item.id : '';
    const name = 'name' in item && typeof item.name === 'string' ? item.name : '';
    return id && name ? [{ id, name }] : [];
  });
}

export function createdItemFrom(payload: unknown, resourceKey: string): CatalogItem {
  const root =
    payload && typeof payload === 'object' && 'data' in payload
      ? (payload as { data: unknown }).data
      : payload;
  const resource =
    root && typeof root === 'object' && resourceKey in root
      ? (root as Record<string, unknown>)[resourceKey]
      : root;

  const id =
    resource && typeof resource === 'object' && 'id' in resource && typeof resource.id === 'string'
      ? resource.id
      : '';
  const name =
    resource &&
    typeof resource === 'object' &&
    'name' in resource &&
    typeof resource.name === 'string'
      ? resource.name
      : '';

  if (!id || !name) {
    throw new Error('Resposta inválida ao cadastrar o item');
  }

  return { id, name };
}

export function normalizeCatalogList(payload: unknown, collectionKey: string): CatalogListResponse {
  return { data: catalogItemsFrom(payload, collectionKey) };
}
