import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import AdminComingSoon from './AdminComingSoon';
import { useFeedbackStore } from '@/stores/feedbackStore';
import { logout } from '@/services/session.service';
import { authenticatedSession, renderWithSession } from '@/test/session';

const replace = vi.fn();
const refresh = vi.fn();
vi.mock('next/navigation', () => ({
  usePathname: () => '/admin',
  useRouter: () => ({ replace, push: vi.fn(), refresh, prefetch: vi.fn() }),
}));

vi.mock('@/services/session.service', () => ({ logout: vi.fn() }));

const renderAdmin = () => renderWithSession(<AdminComingSoon />, authenticatedSession('ADMIN'));

describe('AdminComingSoon', () => {
  beforeEach(() => {
    replace.mockClear();
    refresh.mockClear();
    vi.mocked(logout).mockReset();
    useFeedbackStore.setState({ current: null });
  });

  it('tells an admin the panel is coming, inside a single main landmark', async () => {
    await renderAdmin();

    expect(
      await screen.findByRole('heading', { level: 1, name: 'Painel administrativo em breve' })
    ).toBeInTheDocument();
    expect(screen.getByRole('main')).toHaveAttribute('id', 'main-content');
  });

  it('logs out and goes to login', async () => {
    const user = userEvent.setup();
    vi.mocked(logout).mockResolvedValue(undefined);
    await renderAdmin();

    await user.click(await screen.findByRole('button', { name: 'Sair da conta' }));

    await waitFor(() => expect(replace).toHaveBeenCalledWith('/login'));
    expect(logout).toHaveBeenCalledTimes(1);
    // The server reads the now anonymous session again (ADR-0005).
    expect(refresh).toHaveBeenCalled();
  });

  it('stays and explains when logout fails', async () => {
    const user = userEvent.setup();
    vi.mocked(logout).mockRejectedValue(new Error('offline'));
    await renderAdmin();

    await user.click(await screen.findByRole('button', { name: 'Sair da conta' }));

    await waitFor(() => expect(useFeedbackStore.getState().current?.severity).toBe('error'));
    expect(replace).not.toHaveBeenCalled();
    expect(screen.getByRole('button', { name: 'Sair da conta' })).toBeEnabled();
  });
});
