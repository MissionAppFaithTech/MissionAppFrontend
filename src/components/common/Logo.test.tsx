import { act, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import Logo from './Logo';
import { SessionProvider as SessionProviderForTest } from '@/components/auth/SessionProvider';
import { authenticatedSession, renderWithSession } from '@/test/session';

const link = () => screen.getByRole('link', { name: 'Mission App' });
const expectHref = (href: string) => waitFor(() => expect(link()).toHaveAttribute('href', href));

describe('Logo', () => {
  it('sends visitors to the landing page', async () => {
    await renderWithSession(<Logo />);
    await expectHref('/');
  });

  it.each([
    ['MISSIONARY', '/profile'],
    ['SUPPORTER', '/profile/supporter'],
    ['ADMIN', '/admin'],
  ] as const)('sends a logged-in %s to its home', async (role, home) => {
    await renderWithSession(<Logo />, authenticatedSession(role));
    await expectHref(home);
  });

  it('keeps an explicit destination without waiting for the session', async () => {
    await renderWithSession(<Logo href="/navegacao" />, authenticatedSession('SUPPORTER'));
    expect(screen.getByRole('link', { name: 'Mission App' })).toHaveAttribute('href', '/navegacao');
  });

  it('links to the landing page while the session is still streaming', () => {
    const pending = new Promise<never>(() => {});
    render(
      <SessionProviderForTest session={pending}>
        <Logo />
      </SessionProviderForTest>
    );
    expect(screen.getByRole('link', { name: 'Mission App' })).toHaveAttribute('href', '/');
  });

  it('works without a session provider (visitor)', async () => {
    await act(async () => {
      render(<Logo />);
    });
    await expectHref('/');
  });
});
