import { render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import RoleGate from '@/components/common/RoleGate';
import { useSessionStore, type SessionStatus } from '@/stores/sessionStore';

const replace = vi.fn();
let pathname = '/profile/supporter';
vi.mock('next/navigation', () => ({
  usePathname: () => pathname,
  useRouter: () => ({ replace, push: vi.fn(), refresh: vi.fn(), prefetch: vi.fn() }),
}));

function session(status: SessionStatus, role: 'MISSIONARY' | 'SUPPORTER' | 'ADMIN' | null = null) {
  useSessionStore.setState({
    loadSession: vi.fn(async () => {
      useSessionStore.setState({ status, role });
      return status;
    }),
  });
}

function renderGate() {
  return render(
    <RoleGate>
      <p>Área protegida</p>
    </RoleGate>
  );
}

describe('RoleGate / useRoleGuard', () => {
  beforeEach(() => {
    replace.mockClear();
    pathname = '/profile/supporter';
  });

  it('shows an accessible check while the session loads, then the area for its role', async () => {
    session('authenticated', 'SUPPORTER');
    renderGate();

    expect(screen.getByRole('status')).toHaveTextContent('Verificando seu acesso…');
    expect(await screen.findByText('Área protegida')).toBeInTheDocument();
    expect(replace).not.toHaveBeenCalled();
  });

  it('sends another role to its own home without showing the area', async () => {
    session('authenticated', 'MISSIONARY');
    renderGate();

    await waitFor(() => expect(replace).toHaveBeenCalledWith('/profile'));
    expect(screen.queryByText('Área protegida')).not.toBeInTheDocument();
  });

  it('sends visitors to login with the current path', async () => {
    pathname = '/admin';
    session('anonymous');
    renderGate();

    await waitFor(() => expect(replace).toHaveBeenCalledWith('/login?next=%2Fadmin'));
    expect(screen.queryByText('Área protegida')).not.toBeInTheDocument();
  });

  it('keeps the page when the session check fails', async () => {
    session('unknown');
    renderGate();

    expect(await screen.findByText('Área protegida')).toBeInTheDocument();
    expect(replace).not.toHaveBeenCalled();
  });

  it('does nothing once the page is gone before the session answers', async () => {
    let answer: (status: SessionStatus) => void = () => {};
    useSessionStore.setState({
      loadSession: vi.fn(
        () =>
          new Promise<SessionStatus>((resolve) => {
            answer = (status) => {
              useSessionStore.setState({ status, role: 'MISSIONARY' });
              resolve(status);
            };
          })
      ),
    });
    const { unmount } = renderGate();
    unmount();

    answer('authenticated');
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(replace).not.toHaveBeenCalled();
  });

  it('checks again when the path changes to another area', async () => {
    session('authenticated', 'SUPPORTER');
    const { rerender } = renderGate();
    expect(await screen.findByText('Área protegida')).toBeInTheDocument();

    pathname = '/profile/financeiro';
    rerender(
      <RoleGate>
        <p>Área protegida</p>
      </RoleGate>
    );

    await waitFor(() => expect(replace).toHaveBeenCalledWith('/profile/supporter'));
  });
});
