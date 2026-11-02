import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import ProfileAccountMenu from './ProfileAccountMenu';
import { useFeedbackStore } from '@/stores/feedbackStore';
import { useSessionStore } from '@/stores/sessionStore';

const replace = vi.fn();
const router = { replace, push: vi.fn(), refresh: vi.fn(), prefetch: vi.fn() };
vi.mock('next/navigation', () => ({ useRouter: () => router }));

const profile = { username: 'samuel', displayName: 'Samuel' };

async function openMenu(role?: 'missionary' | 'supporter') {
  const user = userEvent.setup();
  render(<ProfileAccountMenu profile={profile} role={role} />);
  await user.click(screen.getByRole('button', { name: /abrir menu do perfil/i }));
  return user;
}

describe('ProfileAccountMenu', () => {
  const logout = vi.fn();

  beforeEach(() => {
    logout.mockReset();
    replace.mockClear();
    useSessionStore.setState({ logout });
    useFeedbackStore.setState({ current: null });
  });

  it('shows the account and a "Sair da conta" action', async () => {
    await openMenu();

    expect(screen.getByText('@samuel')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /editar perfil/i })).toHaveAttribute(
      'href',
      '/profile/edit-profile'
    );
    expect(screen.getByRole('button', { name: /sair da conta/i })).toBeInTheDocument();
  });

  it('offers a quick light/dark appearance switch', async () => {
    await openMenu();

    const appearance = screen.getByRole('group', { name: 'Aparência' });
    expect(appearance).toContainElement(screen.getByRole('button', { name: 'Claro' }));
    expect(appearance).toContainElement(screen.getByRole('button', { name: 'Escuro' }));
  });

  it('gives a missionary only links into the missionary area', async () => {
    await openMenu('missionary');

    expect(screen.getByRole('link', { name: 'Perfil Missionário' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Configurações Financeiras' })).toHaveAttribute(
      'href',
      '/profile/financeiro'
    );
    expect(screen.queryByRole('link', { name: 'Perfil Apoiador' })).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: /configurações de conta/i })).toHaveAttribute(
      'href',
      '/profile/configuracoes'
    );
  });

  it('gives a supporter only links into the supporter area', async () => {
    await openMenu('supporter');

    expect(screen.getByRole('link', { name: 'Perfil Apoiador' })).toHaveAttribute(
      'href',
      '/profile/supporter/missionarios'
    );
    expect(screen.queryByRole('link', { name: 'Perfil Missionário' })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /financeiras/i })).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: /editar perfil/i })).toHaveAttribute(
      'href',
      '/profile/supporter/edit-profile'
    );
    expect(screen.getByRole('link', { name: /configurações de conta/i })).toHaveAttribute(
      'href',
      '/profile/supporter/configuracoes'
    );
  });

  it('logs out and goes to the login page', async () => {
    logout.mockResolvedValue(undefined);
    const user = await openMenu();

    await user.click(screen.getByRole('button', { name: /sair da conta/i }));

    await waitFor(() => expect(replace).toHaveBeenCalledWith('/login'));
    expect(logout).toHaveBeenCalledTimes(1);
  });

  it('stays on the page and explains when logout fails', async () => {
    logout.mockRejectedValue(new Error('offline'));
    const user = await openMenu();

    await user.click(screen.getByRole('button', { name: /sair da conta/i }));

    await waitFor(() => expect(useFeedbackStore.getState().current?.severity).toBe('error'));
    expect(replace).not.toHaveBeenCalled();
  });
});
