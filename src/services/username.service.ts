import {
  isMockUsernameTaken,
  mockDelay,
  USE_AUTH_MOCKS,
} from "@/mocks/auth";

export type UsernameAvailability = {
  available: boolean;
  username: string;
  suggestions: string[];
};

export async function checkUsernameAvailability(
  username: string,
): Promise<UsernameAvailability> {
  if (USE_AUTH_MOCKS) {
    await mockDelay(300);
    const normalized = username.trim().toLowerCase();
    const available = !isMockUsernameTaken(normalized);

    return {
      available,
      username: normalized,
      suggestions: available
        ? []
        : [`${normalized}_1`, `${normalized}_mission`, `${normalized}${Date.now().toString().slice(-3)}`],
    };
  }

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
