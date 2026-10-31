import { render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import Logo from './Logo';
import { useSessionStore } from '@/stores/sessionStore';

const loadSession = vi.fn();

describe('Logo', () => {
  beforeEach(() => {
    loadSession.mockReset();
    loadSession.mockResolvedValue('anonymous');
    useSessionStore.setState({ status: 'unknown', role: null, loadSession });
  });

  const link = () => screen.getByRole('link', { name: 'Mission App' });

  it('sends visitors to the landing page and checks the session once', async () => {
    render(<Logo />);

    expect(link()).toHaveAttribute('href', '/');
    await waitFor(() => expect(loadSession).toHaveBeenCalledTimes(1));
  });

  it.each([
    ['MISSIONARY', '/profile'],
    ['SUPPORTER', '/profile/supporter'],
    ['ADMIN', '/admin'],
  ] as const)('sends a logged-in %s to its home', (role, home) => {
    useSessionStore.setState({ status: 'authenticated', role });
    render(<Logo />);

    expect(link()).toHaveAttribute('href', home);
    expect(loadSession).not.toHaveBeenCalled();
  });

  it('does not ask again once the visitor is known to be logged out', () => {
    useSessionStore.setState({ status: 'anonymous', role: null });
    render(<Logo />);

    expect(link()).toHaveAttribute('href', '/');
    expect(loadSession).not.toHaveBeenCalled();
  });

  it('keeps an explicit destination', () => {
    useSessionStore.setState({ status: 'authenticated', role: 'SUPPORTER' });
    render(<Logo href="/navegacao" />);

    expect(link()).toHaveAttribute('href', '/navegacao');
  });

  it('falls back to the landing page while the session is unknown, even with a stale role', () => {
    useSessionStore.setState({ status: 'unknown', role: 'MISSIONARY' });
    render(<Logo />);

    expect(link()).toHaveAttribute('href', '/');
  });
});
