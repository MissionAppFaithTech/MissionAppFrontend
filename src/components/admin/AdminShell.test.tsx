import { screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { authenticatedSession, renderWithSession } from '@/test/session';
import AdminShell from './AdminShell';

const replace = vi.fn();
vi.mock('next/navigation', () => ({
  usePathname: () => '/admin',
  useRouter: () => ({ replace, push: vi.fn(), refresh: vi.fn(), prefetch: vi.fn() }),
}));

describe('AdminShell', () => {
  it('renders the authorized content inside one main landmark', async () => {
    await renderWithSession(
      <AdminShell>
        <h1>Missionários cadastrados</h1>
      </AdminShell>,
      authenticatedSession('ADMIN')
    );
    expect(screen.getAllByRole('main')).toHaveLength(1);
    expect(screen.getByRole('main')).toHaveAttribute('id', 'main-content');
    expect(screen.getByRole('heading', { name: 'Missionários cadastrados' })).toBeInTheDocument();
  });
  it('keeps a supporter out of the administrative content', async () => {
    await renderWithSession(
      <AdminShell>
        <h1>Missionários cadastrados</h1>
      </AdminShell>,
      authenticatedSession('SUPPORTER')
    );
    expect(
      screen.queryByRole('heading', { name: 'Missionários cadastrados' })
    ).not.toBeInTheDocument();
    expect(replace).toHaveBeenCalledWith('/profile/supporter');
  });
});
