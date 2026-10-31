import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import AdminComingSoon from './AdminComingSoon';
import { useFeedbackStore } from '@/stores/feedbackStore';
import { useSessionStore } from '@/stores/sessionStore';

const replace = vi.fn();
vi.mock('next/navigation', () => ({
  usePathname: () => '/admin',
  useRouter: () => ({ replace, push: vi.fn(), refresh: vi.fn(), prefetch: vi.fn() }),
}));

const logout = vi.fn();

describe('AdminComingSoon', () => {
  beforeEach(() => {
    replace.mockClear();
    logout.mockReset();
    useFeedbackStore.setState({ current: null });
    useSessionStore.setState({
      status: 'authenticated',
      role: 'ADMIN',
      logout,
      loadSession: vi.fn(async () => 'authenticated' as const),
    });
  });

  it('tells an admin the panel is coming, inside a single main landmark', async () => {
    render(<AdminComingSoon />);

    expect(
      await screen.findByRole('heading', { level: 1, name: 'Painel administrativo em breve' })
    ).toBeInTheDocument();
    expect(screen.getByRole('main')).toHaveAttribute('id', 'main-content');
  });

  it('logs out and goes to login', async () => {
    const user = userEvent.setup();
    logout.mockResolvedValue(undefined);
    render(<AdminComingSoon />);

    await user.click(await screen.findByRole('button', { name: 'Sair da conta' }));

    await waitFor(() => expect(replace).toHaveBeenCalledWith('/login'));
    expect(logout).toHaveBeenCalledTimes(1);
  });

  it('stays and explains when logout fails', async () => {
    const user = userEvent.setup();
    logout.mockRejectedValue(new Error('offline'));
    render(<AdminComingSoon />);

    await user.click(await screen.findByRole('button', { name: 'Sair da conta' }));

    await waitFor(() => expect(useFeedbackStore.getState().current?.severity).toBe('error'));
    expect(replace).not.toHaveBeenCalled();
    expect(screen.getByRole('button', { name: 'Sair da conta' })).toBeEnabled();
  });
});
