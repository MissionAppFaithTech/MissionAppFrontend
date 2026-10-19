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
});
