import { render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import RoleGate from '@/components/common/RoleGate';
import { ANONYMOUS_SESSION } from '@/lib/auth/session';
import { authenticatedSession, renderWithSession } from '@/test/session';

const replace = vi.fn();
let pathname = '/profile/supporter';
vi.mock('next/navigation', () => ({
  usePathname: () => pathname,
  useRouter: () => ({ replace, push: vi.fn(), refresh: vi.fn(), prefetch: vi.fn() }),
}));

const area = (
  <RoleGate>
    <p>Área protegida</p>
  </RoleGate>
);

describe('RoleGate / useRoleGuard', () => {
  beforeEach(() => {
    replace.mockClear();
    pathname = '/profile/supporter';
  });

  it('shows the area to its own role', async () => {
    await renderWithSession(area, authenticatedSession('SUPPORTER'));

    expect(await screen.findByText('Área protegida')).toBeInTheDocument();
    expect(replace).not.toHaveBeenCalled();
  });

  it('sends another role to its own home without showing the area', async () => {
    await renderWithSession(area, authenticatedSession('MISSIONARY'));

    await waitFor(() => expect(replace).toHaveBeenCalledWith('/profile'));
    expect(screen.queryByText('Área protegida')).not.toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent('Verificando seu acesso…');
  });

  it('sends a visitor to login, keeping where they were going', async () => {
    window.history.replaceState({}, '', '/profile/supporter?aba=1');
    await renderWithSession(area, ANONYMOUS_SESSION);

    await waitFor(() =>
      expect(replace).toHaveBeenCalledWith(
        `/login?next=${encodeURIComponent('/profile/supporter?aba=1')}`
      )
    );
    window.history.replaceState({}, '', '/');
  });

  it('shows an accessible check while it redirects a missing session', () => {
    render(area);
    expect(screen.getByRole('status')).toHaveTextContent('Verificando seu acesso…');
  });
});
