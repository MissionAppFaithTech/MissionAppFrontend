import {
  findMockUserByEmail,
  getMockResetTokenStatus,
  issueMockResetToken,
  mockDelay,
  RESET_PASSWORD_TOKEN_TTL_MINUTES,
  USE_AUTH_MOCKS,
} from '@/mocks/auth';
import type { AuthUser } from '@/lib/api/auth-response';
import {
  endAllSessionsAction,
  loginAction,
  requestPasswordResetAction,
  resetPasswordAction,
} from '@/app/actions/auth';
import { callAction } from '@/lib/api/callAction';
import { bffRequest } from '@/lib/api/client';

export { USE_AUTH_MOCKS, RESET_PASSWORD_TOKEN_TTL_MINUTES };

export type LoginPayload = {
  login: string;
  password: string;
};

export async function login(data: LoginPayload): Promise<{ user: AuthUser }> {
  return callAction(() =>
    loginAction({ login: data.login.trim().toLowerCase(), password: data.password })
  );
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

  const { message } = await callAction(() => requestPasswordResetAction(data));
  return { found: true, message };
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

  return callAction(() => resetPasswordAction(data));
}

/** Ends every session, this one included: the caller sends the user to login. */
export async function terminateAllSessions(): Promise<{ message: string }> {
  return callAction(() => endAllSessionsAction());
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
