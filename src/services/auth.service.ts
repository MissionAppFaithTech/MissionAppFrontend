import {
  findMockUserByEmail,
  getMockResetTokenStatus,
  issueMockResetToken,
  mockDelay,
  RESET_PASSWORD_TOKEN_TTL_MINUTES,
  USE_AUTH_MOCKS,
} from '@/mocks/auth';
import type { AuthUser } from '@/lib/api/auth-response';
import { bffRequest } from '@/lib/api/client';

export { USE_AUTH_MOCKS, RESET_PASSWORD_TOKEN_TTL_MINUTES };

export type LoginPayload = {
  login: string;
  password: string;
};

export async function login(data: LoginPayload): Promise<{ user: AuthUser }> {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      login: data.login.trim().toLowerCase(),
      password: data.password,
    }),
  });

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    const message =
      typeof payload?.message === 'string' ? payload.message : 'E-mail ou senha inválidos';
    throw new Error(message);
  }

  return { user: payload.data.user as AuthUser };
}

export type ForgotPasswordResult = {
  found: boolean;
  message: string;
  resetPath?: string;
};

export async function requestPasswordReset(data: { login: string }): Promise<ForgotPasswordResult> {
  if (USE_AUTH_MOCKS) {
    await mockDelay();
    const user = findMockUserByEmail(data.login);

    if (!user) {
      return {
        found: false,
        message: 'Não encontramos uma conta com este e-mail.',
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

  const response = await fetch('/api/auth/forgot-password', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    const message =
      typeof payload?.message === 'string'
        ? payload.message
        : 'Não foi possível enviar o link de redefinição';
    throw new Error(message);
  }

  return {
    found: Boolean(payload?.found ?? true),
    message:
      typeof payload?.message === 'string'
        ? payload.message
        : 'Enviamos um link para redefinir sua senha.',
  };
}

export type ResetPasswordResult = {
  message: string;
};

export type ResetTokenStatus = 'valid' | 'expired' | 'invalid' | 'unknown';

/** No mock valida no cliente; com back real só o submit confirma. */
export function getResetTokenStatus(token: string | null): ResetTokenStatus {
  if (!token) return 'invalid';
  if (!USE_AUTH_MOCKS) return 'unknown';
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

    if (status === 'expired') {
      throw new Error('Este link expirou. Solicite uma nova redefinição de senha.');
    }

    if (status === 'invalid') {
      throw new Error('Link inválido. Solicite uma nova redefinição de senha.');
    }

    if (data.password !== data.passwordConfirmation) {
      throw new Error('As senhas não coincidem');
    }

    return { message: 'Senha redefinida com sucesso.' };
  }

  const response = await fetch('/api/auth/reset-password', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    const message =
      typeof payload?.message === 'string' ? payload.message : 'Não foi possível redefinir a senha';
    throw new Error(message);
  }

  return {
    message:
      typeof payload?.message === 'string' ? payload.message : 'Senha redefinida com sucesso.',
  };
}

export async function terminateAllSessions(): Promise<{ message: string }> {
  const response = await fetch('/api/auth/sessions', {
    method: 'DELETE',
    headers: {
      Accept: 'application/json',
    },
  });

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    const message =
      typeof payload?.message === 'string'
        ? payload.message
        : 'Não foi possível encerrar as sessões';
    throw new Error(message);
  }

  return {
    message:
      typeof payload?.message === 'string' ? payload.message : 'Sessões encerradas com sucesso.',
  };
}

export type ActiveSession = {
  id: string;
  deviceType: 'web' | 'mobile';
  deviceName: string | null;
  ipAddress: string | null;
  lastUsedAt: string | null;
  createdAt: string;
  current: boolean;
};

export async function listActiveSessions(): Promise<ActiveSession[]> {
  const { data } = await bffRequest<{ data: ActiveSession[] }>('/api/auth/sessions', {
    fallbackMessage: 'Não foi possível carregar as sessões',
  });
  return data;
}
