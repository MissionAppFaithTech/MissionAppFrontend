import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { useSession } from './SessionProvider';
import { authenticatedSession, renderWithSession } from '@/test/session';

function SessionLabel() {
  const session = useSession();
  return (
    <p>{session.status === 'authenticated' ? `${session.role}:${session.userId}` : 'visitante'}</p>
  );
}

describe('SessionProvider / useSession', () => {
  it('reads the session the server streamed in', async () => {
    await renderWithSession(<SessionLabel />, authenticatedSession('MISSIONARY', 'user-9'));

    expect(await screen.findByText('MISSIONARY:user-9')).toBeInTheDocument();
  });

  it('is anonymous outside a provider', () => {
    render(<SessionLabel />);

    expect(screen.getByText('visitante')).toBeInTheDocument();
  });
});
