import axios from "@/lib/axios";
import {
  findMockUserByEmail,
  getMockResetTokenStatus,
  issueMockResetToken,
  mockDelay,
  RESET_PASSWORD_TOKEN_TTL_MINUTES,
  USE_AUTH_MOCKS,
} from "@/mocks/auth";

export { USE_AUTH_MOCKS, RESET_PASSWORD_TOKEN_TTL_MINUTES };

export async function login(data: unknown) {
  if (USE_AUTH_MOCKS) {
    await mockDelay();
    const payload = data as { login?: string; email?: string; password?: string };
    const email = (payload.login ?? payload.email ?? "").trim().toLowerCase();
    const user = findMockUserByEmail(email);

    if (!user || !payload.password) {
      throw new Error("E-mail ou senha inválidos");
    }

    return {
      data: {
        data: {
          user: {
            id: "mock-user-id",
            fullName: user.fullName,
            email: user.email,
          },
          accessToken: "mock-access-token",
          refreshToken: "mock-refresh-token",
        },
      },
    };
  }

  return axios.post("/login", data);
}

export type ForgotPasswordResult = {
  found: boolean;
  message: string;
  resetPath?: string;
};

export async function requestPasswordReset(data: {
  login: string;
}): Promise<ForgotPasswordResult> {
  if (USE_AUTH_MOCKS) {
    await mockDelay();
    const user = findMockUserByEmail(data.login);

    if (!user) {
      return {
        found: false,
        message: "Não encontramos uma conta com este e-mail.",
      };
    }

    const issued = issueMockResetToken();

    return {
      found: true,
      message: `Enviamos um link para redefinir sua senha. O link expira em ${RESET_PASSWORD_TOKEN_TTL_MINUTES} minutos.`,
      /** Só em mock: link local para abrir a tela sem e-mail. */
      resetPath: `/reset-password?token=${issued.token}`,
    };
  }

  const response = await fetch("/api/auth/forgot-password", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    const message =
      typeof payload?.message === "string"
        ? payload.message
        : "Não foi possível enviar o link de redefinição";
    throw new Error(message);
  }

  return {
    found: Boolean(payload?.found ?? true),
    message:
      typeof payload?.message === "string"
        ? payload.message
        : "Enviamos um link para redefinir sua senha.",
  };
}

export type ResetPasswordResult = {
  message: string;
};

export type ResetTokenStatus = "valid" | "expired" | "invalid" | "unknown";

/** No mock valida no cliente; com back real só o submit confirma. */
export function getResetTokenStatus(token: string | null): ResetTokenStatus {
  if (!token) return "invalid";
  if (!USE_AUTH_MOCKS) return "unknown";
  return getMockResetTokenStatus(token);
}

export async function resetPassword(data: {
  token: string;
  password: string;
  passwordConfirmation: string;
}): Promise<ResetPasswordResult> {
  if (USE_AUTH_MOCKS) {
    await mockDelay();
    const status = getMockResetTokenStatus(data.token);

    if (status === "expired") {
      throw new Error("Este link expirou. Solicite uma nova redefinição de senha.");
    }

    if (status === "invalid") {
      throw new Error("Link inválido. Solicite uma nova redefinição de senha.");
    }

    if (data.password !== data.passwordConfirmation) {
      throw new Error("As senhas não coincidem");
    }

    return { message: "Senha redefinida com sucesso." };
  }

  const response = await fetch("/api/auth/reset-password", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    const message =
      typeof payload?.message === "string"
        ? payload.message
        : "Não foi possível redefinir a senha";
    throw new Error(message);
  }

  return {
    message:
      typeof payload?.message === "string"
        ? payload.message
        : "Senha redefinida com sucesso.",
  };
}
