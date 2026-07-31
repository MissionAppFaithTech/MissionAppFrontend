/**
 * Contas mock para fluxos de auth enquanto o backend não está ligado.
 * Inclua aqui e-mails de teste usados no front.
 * Troque `USE_AUTH_MOCKS` para `false` quando o back estiver pronto.
 */
export const USE_AUTH_MOCKS = true;

export const mockUsers = [
  {
    email: "allana.c.oliveira96@gmail.com",
    username: "allanaoliveira",
    fullName: "Allana Oliveira",
  },
  {
    email: "admin@missionapp.test",
    username: "admin_seed",
    fullName: "Admin Seed",
  },
  {
    email: "missionary1@missionapp.test",
    username: "missionary_seed_1",
    fullName: "Missionário Seed Um",
  },
  {
    email: "supporter1@missionapp.test",
    username: "supporter_seed_1",
    fullName: "Apoiador Seed Um",
  },
] as const;

export function findMockUserByEmail(email: string) {
  const normalized = email.trim().toLowerCase();
  return mockUsers.find((user) => user.email === normalized) ?? null;
}

export function isMockUsernameTaken(username: string) {
  const normalized = username.trim().toLowerCase();
  return mockUsers.some((user) => user.username.toLowerCase() === normalized);
}

/**
 * Tokens mock do link de e-mail.
 * TTL alinhado ao texto do produto (e ao back quando existir).
 *
 * Atalhos de teste:
 * - /reset-password?token=mock-reset-token  → sempre válido
 * - /reset-password?token=expired-reset-token → sempre expirado
 */
export const RESET_PASSWORD_TOKEN_TTL_MINUTES = 60;
export const RESET_PASSWORD_TOKEN_TTL_MS =
  RESET_PASSWORD_TOKEN_TTL_MINUTES * 60 * 1000;

export const MOCK_RESET_TOKEN = "mock-reset-token";
export const MOCK_EXPIRED_RESET_TOKEN = "expired-reset-token";

export type MockResetTokenStatus = "valid" | "expired" | "invalid";

type IssuedMockToken = {
  token: string;
  expiresAt: number;
};

/** Emite token mock com expiração (padrão: 60 min). */
export function issueMockResetToken(
  ttlMs = RESET_PASSWORD_TOKEN_TTL_MS,
): IssuedMockToken {
  const expiresAt = Date.now() + ttlMs;
  const token = `mock.${expiresAt}.${Math.random().toString(36).slice(2, 10)}`;
  return { token, expiresAt };
}

export function getMockResetTokenStatus(token: string): MockResetTokenStatus {
  if (!token) return "invalid";
  if (token === MOCK_RESET_TOKEN) return "valid";
  if (token === MOCK_EXPIRED_RESET_TOKEN) return "expired";

  const match = /^mock\.(\d+)\.[a-z0-9]+$/i.exec(token);
  if (!match) return "invalid";

  const expiresAt = Number(match[1]);
  if (!Number.isFinite(expiresAt)) return "invalid";
  if (Date.now() > expiresAt) return "expired";
  return "valid";
}

/** Simula latência de rede nos mocks. */
export function mockDelay(ms = 400) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
