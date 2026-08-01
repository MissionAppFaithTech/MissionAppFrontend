/**
 * Base URL do Adonis (sem /api/v1).
 * Preferir API_URL no servidor; NEXT_PUBLIC_API_URL só como fallback de dev.
 */
export function getBackendOrigin(): string {
  const fromEnv =
    process.env.API_URL?.replace(/\/$/, '') || process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '');

  if (fromEnv) {
    return fromEnv.replace(/\/api\/v1\/?$/, '');
  }

  return 'http://localhost:3333';
}

export function getBackendApiBase(): string {
  return `${getBackendOrigin()}/api/v1`;
}
