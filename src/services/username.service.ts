export type UsernameAvailability = {
  available: boolean;
  username: string;
  suggestions: string[];
};

/**
 * Consulta disponibilidade no BFF local (`/api/accounts/username-availability`),
 * que chama o Adonis em `API_URL` (localhost:3333 em dev).
 */
export async function checkUsernameAvailability(username: string): Promise<UsernameAvailability> {
  const response = await fetch(
    `/api/accounts/username-availability?username=${encodeURIComponent(username)}`,
    { method: 'GET', headers: { Accept: 'application/json' }, cache: 'no-store' }
  );

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    const message =
      typeof payload?.message === 'string'
        ? payload.message
        : 'Não foi possível verificar o nome de usuário';
    throw new Error(message);
  }

  const data = payload?.data ?? payload;
  if (typeof data?.available !== 'boolean' || typeof data?.username !== 'string') {
    throw new Error('Não foi possível verificar o nome de usuário');
  }

  return {
    available: data.available,
    username: data.username,
    suggestions: Array.isArray(data.suggestions) ? data.suggestions : [],
  };
}
