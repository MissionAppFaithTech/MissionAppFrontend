import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import LoginForm from './LoginForm';

const mockPush = vi.fn();
const mockRefresh = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    refresh: mockRefresh,
  }),
}));

vi.mock('@/services/auth.service', () => ({
  login: vi.fn().mockResolvedValue({
    user: { id: '1', fullName: 'Teste', email: 'teste@missionapp.com' },
  }),
}));

vi.mock('@/services/profile.service', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/services/profile.service')>();
  return {
    ...actual,
    fetchAccountProfile: vi.fn().mockResolvedValue({
      user: { id: '1', fullName: 'Teste', username: 'teste' },
      missionary: null,
    }),
  };
});

describe('LoginForm component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders email and password inputs with submit button', () => {
    render(<LoginForm />);

    expect(screen.getByPlaceholderText('seu@email.com')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Sua senha')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Entrar' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /esqueceu sua senha\?/i })).toBeInTheDocument();
  });

  it('does not show required errors until submit', async () => {
    const user = userEvent.setup();
    render(<LoginForm />);

    await user.click(screen.getByPlaceholderText('seu@email.com'));
    await user.tab();
    await user.click(screen.getByPlaceholderText('Sua senha'));
    await user.tab();

    expect(screen.queryByText(/informe seu e-mail/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/informe sua senha/i)).not.toBeInTheDocument();
  });

  it('shows the @ error while typing an email without it', async () => {
    const user = userEvent.setup();
    render(<LoginForm />);

    await user.type(screen.getByPlaceholderText('seu@email.com'), 'email-sem-arroba');

    expect(await screen.findByText(/inclua um @ no e-mail/i)).toBeInTheDocument();
    expect(screen.queryByText(/informe sua senha/i)).not.toBeInTheDocument();
  });

  it('displays field validation errors when submitting empty fields', async () => {
    const user = userEvent.setup();
    render(<LoginForm />);

    await user.click(screen.getByRole('button', { name: 'Entrar' }));

    expect(await screen.findByText(/informe seu e-mail/i)).toBeInTheDocument();
    expect(await screen.findByText(/informe sua senha/i)).toBeInTheDocument();
    expect(mockPush).not.toHaveBeenCalled();
  });

  it('submits form with credentials and triggers redirection', async () => {
    const user = userEvent.setup();
    render(<LoginForm />);

    await user.type(screen.getByPlaceholderText('seu@email.com'), 'teste@missionapp.com');
    await user.type(screen.getByPlaceholderText('Sua senha'), 'SenhaForte123!');

    await user.click(screen.getByRole('button', { name: 'Entrar' }));

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/profile');
    });
  });

  it('toggles password visibility', async () => {
    const user = userEvent.setup();
    render(<LoginForm />);

    const toggleButton = screen.getByRole('button', { name: /mostrar senha/i });
    expect(toggleButton).toBeInTheDocument();

    await user.click(toggleButton);
    expect(screen.getByRole('button', { name: /ocultar senha/i })).toBeInTheDocument();
  });

  it('renders modern, informative Portuguese error alert when login fails with invalid credentials', async () => {
    const { login } = await import('@/services/auth.service');
    vi.mocked(login).mockRejectedValueOnce(new Error('Invalid user credentials'));

    const user = userEvent.setup();
    render(<LoginForm />);

    await user.type(screen.getByPlaceholderText('seu@email.com'), 'usuario@errado.com');
    await user.type(screen.getByPlaceholderText('Sua senha'), 'SenhaErrada123!');
    await user.click(screen.getByRole('button', { name: 'Entrar' }));

    const alert = await screen.findByRole('alert');
    expect(alert).toBeInTheDocument();
    expect(screen.getByText('E-mail ou senha incorretos')).toBeInTheDocument();
    expect(
      screen.getByText(
        /verifique os dados digitados e tente novamente\. se você esqueceu sua senha/i
      )
    ).toBeInTheDocument();
    expect(screen.queryByText('Invalid user credentials')).not.toBeInTheDocument();
  });
});
