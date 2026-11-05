import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Suspense, useState } from 'react';
import { describe, expect, it } from 'vitest';
import AccountScope from './AccountScope';
import { SessionProvider } from './SessionProvider';
import { ANONYMOUS_SESSION, type SessionSnapshot } from '@/lib/auth/session';
import { authenticatedSession } from '@/test/session';

/** Local state that must not survive an account switch. */
function Draft() {
  const [text, setText] = useState('');
  return <input aria-label="Rascunho" value={text} onChange={(e) => setText(e.target.value)} />;
}

const tree = (session: SessionSnapshot) => (
  <SessionProvider session={Promise.resolve(session)}>
    <Suspense fallback={<p>Carregando</p>}>
      <AccountScope>
        <Draft />
      </AccountScope>
    </Suspense>
  </SessionProvider>
);

async function renderTree(session: SessionSnapshot) {
  let result!: ReturnType<typeof render>;
  await act(async () => {
    result = render(tree(session));
  });
  return result;
}

async function switchTo(rerender: (ui: React.ReactElement) => void, session: SessionSnapshot) {
  await act(async () => {
    rerender(tree(session));
  });
}

describe('AccountScope', () => {
  it('keeps the local state while the same account stays logged in', async () => {
    const user = userEvent.setup();
    const { rerender } = await renderTree(authenticatedSession('MISSIONARY', 'user-ana'));
    await user.type(screen.getByLabelText('Rascunho'), 'texto da Ana');

    await switchTo(rerender, authenticatedSession('MISSIONARY', 'user-ana'));

    expect(screen.getByLabelText('Rascunho')).toHaveValue('texto da Ana');
  });

  it('starts from scratch for another account', async () => {
    const user = userEvent.setup();
    const { rerender } = await renderTree(authenticatedSession('MISSIONARY', 'user-ana'));
    await user.type(screen.getByLabelText('Rascunho'), 'texto da Ana');

    await switchTo(rerender, authenticatedSession('SUPPORTER', 'user-bia'));

    expect(screen.getByLabelText('Rascunho')).toHaveValue('');
  });

  it('starts from scratch after logging out', async () => {
    const user = userEvent.setup();
    const { rerender } = await renderTree(authenticatedSession('MISSIONARY', 'user-ana'));
    await user.type(screen.getByLabelText('Rascunho'), 'texto da Ana');

    await switchTo(rerender, ANONYMOUS_SESSION);

    expect(screen.getByLabelText('Rascunho')).toHaveValue('');
  });

  it('starts from scratch when a session without a user id logs out', async () => {
    const user = userEvent.setup();
    const { rerender } = await renderTree({ status: 'authenticated', userId: null, role: null });
    await user.type(screen.getByLabelText('Rascunho'), 'texto');

    await switchTo(rerender, ANONYMOUS_SESSION);

    expect(screen.getByLabelText('Rascunho')).toHaveValue('');
  });
});
