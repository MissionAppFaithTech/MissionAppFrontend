import { Activity } from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import ForgotPasswordForm from './ForgotPasswordForm';
import { requestPasswordReset } from '@/services/auth.service';

vi.mock('@/services/auth.service', () => ({
  requestPasswordReset: vi.fn(),
  RESET_PASSWORD_TOKEN_TTL_MINUTES: 60,
}));

const EMAIL = 'ana@example.com';

async function submit(user: ReturnType<typeof userEvent.setup>, email = EMAIL) {
  await user.type(screen.getByRole('textbox', { name: 'E-mail' }), email);
  await user.click(screen.getByRole('button', { name: /enviar link/i }));
}

describe('ForgotPasswordForm', () => {
  beforeEach(() => {
    vi.mocked(requestPasswordReset).mockReset();
  });

  describe('after the link is sent', () => {
    beforeEach(() => {
      vi.mocked(requestPasswordReset).mockResolvedValue({ found: true, message: 'ok' });
    });

    it('offers "Voltar" to the login page', async () => {
      const user = userEvent.setup();
      render(<ForgotPasswordForm />);

      await submit(user);

      expect(await screen.findByText(/enviamos um link/i)).toHaveTextContent(EMAIL);
      expect(screen.getByRole('link', { name: 'Voltar' })).toHaveAttribute('href', '/login');
    });

    it('"Enviar para outro e-mail" goes back to an empty form', async () => {
      const user = userEvent.setup();
      render(<ForgotPasswordForm />);

      await submit(user);
      await user.click(await screen.findByRole('button', { name: 'Enviar para outro e-mail' }));

      expect(screen.getByRole('textbox', { name: 'E-mail' })).toHaveValue('');
      expect(screen.getByRole('button', { name: /enviar link/i })).toBeEnabled();
    });

    it('shows the form again when the page comes back from the cache (Activity)', async () => {
      const user = userEvent.setup();
      const { rerender } = render(
        <Activity mode="visible">
          <ForgotPasswordForm />
        </Activity>
      );

      await submit(user);
      expect(await screen.findByText(/enviamos um link/i)).toBeInTheDocument();

      // Navigating away hides the page; coming back shows it again.
      rerender(
        <Activity mode="hidden">
          <ForgotPasswordForm />
        </Activity>
      );
      rerender(
        <Activity mode="visible">
          <ForgotPasswordForm />
        </Activity>
      );

      await waitFor(() =>
        expect(screen.getByRole('button', { name: /enviar link/i })).toBeVisible()
      );
      expect(screen.queryByText(/enviamos um link/i)).not.toBeInTheDocument();
      expect(screen.getByRole('textbox', { name: 'E-mail' })).toHaveValue('');
    });
  });

  it('keeps a half-typed e-mail when the page is hidden before sending', async () => {
    const user = userEvent.setup();
    const { rerender } = render(
      <Activity mode="visible">
        <ForgotPasswordForm />
      </Activity>
    );

    await user.type(screen.getByRole('textbox', { name: 'E-mail' }), 'rascunho@');
    rerender(
      <Activity mode="hidden">
        <ForgotPasswordForm />
      </Activity>
    );
    rerender(
      <Activity mode="visible">
        <ForgotPasswordForm />
      </Activity>
    );

    expect(screen.getByRole('textbox', { name: 'E-mail' })).toHaveValue('rascunho@');
    expect(requestPasswordReset).not.toHaveBeenCalled();
  });

  it('offers "Voltar" and another try when the account is not found', async () => {
    const user = userEvent.setup();
    vi.mocked(requestPasswordReset).mockResolvedValue({ found: false, message: 'nope' });
    render(<ForgotPasswordForm />);

    await submit(user);

    expect(await screen.findByText(/não encontramos essa conta/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Voltar' })).toHaveAttribute('href', '/login');

    await user.click(screen.getByRole('button', { name: 'Tentar outro e-mail' }));
    expect(screen.getByRole('textbox', { name: 'E-mail' })).toHaveValue('');
  });

  it('shows the error and stays on the form when the request fails', async () => {
    const user = userEvent.setup();
    vi.mocked(requestPasswordReset).mockRejectedValue(new Error('Servidor indisponível'));
    render(<ForgotPasswordForm />);

    await submit(user);

    expect(await screen.findByRole('alert')).toHaveTextContent('Servidor indisponível');
    expect(screen.getByRole('textbox', { name: 'E-mail' })).toHaveValue(EMAIL);
  });
});
