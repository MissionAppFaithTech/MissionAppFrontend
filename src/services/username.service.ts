export type UsernameAvailability = {
  available: boolean;
  username: string;
  suggestions: string[];
};

export async function checkUsernameAvailability(
  username: string,
): Promise<UsernameAvailability> {
  const response = await fetch(
    `/api/accounts/username-availability?username=${encodeURIComponent(username)}`,
    { method: "GET", headers: { Accept: "application/json" }, cache: "no-store" },
  );

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    const message =
      typeof payload?.message === "string"
        ? payload.message
        : "Não foi possível verificar o nome de usuário";
    throw new Error(message);
  }

  return payload.data as UsernameAvailability;
}
