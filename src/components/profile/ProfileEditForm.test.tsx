import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, it, expect, vi } from 'vitest';
import ProfileEditForm from '@/components/profile/ProfileEditForm';
import { ApiError } from '@/lib/api/client';
import { emptyProfile } from '@/services/profile.service';
import { useFeedbackStore } from '@/stores/feedbackStore';
import { useProfileStore } from '@/stores/profileStore';
import type { ProfileData } from '@/types/profile';

const push = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push, replace: vi.fn(), refresh: vi.fn(), prefetch: vi.fn() }),
  usePathname: () => '/profile/edit-profile',
  useSearchParams: () => new URLSearchParams(),
}));

vi.mock('@/services/username.service', () => ({
  checkUsernameAvailability: vi.fn(async (username: string) => ({
    available: username !== 'nome_usado',
    username,
    suggestions: [],
  })),
}));

const profile: ProfileData = {
  ...emptyProfile,
  userId: 'user-1',
  missionaryId: 'missionary-1',
  username: 'samuel_missionary',
  displayName: 'Samuel Mendonça',
  roleDescription: 'Missionário na África do Sul',
  contact: {
    publicEmail: '',
    publicPhone: '',
    accountEmail: 'samuel@privado.com',
    accountPhone: '+5521987654321',
  },
};

const saveHeader = vi.fn();

describe('ProfileEditForm', () => {
  beforeEach(() => {
    push.mockClear();
    saveHeader.mockReset();
    useProfileStore.setState({ saveHeader });
    useFeedbackStore.setState({ current: null });
  });

  it('renders the header fields with the current values and no private contact data', () => {
    render(<ProfileEditForm profile={profile} />);

    expect(screen.getByRole('heading', { name: /editar perfil/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/nome completo/i)).toHaveValue('Samuel Mendonça');
    expect(screen.getByLabelText(/nome de usuário/i)).toHaveValue('samuel_missionary');
    expect(screen.getByLabelText(/minibiografia/i)).toHaveValue('Missionário na África do Sul');
    expect(screen.getByText('28/200 caracteres')).toBeInTheDocument();
    // The private login e-mail is never prefilled as a public contact.
    expect(screen.getByLabelText(/^e-mail:$/i)).toHaveValue('');
    expect(screen.queryByRole('checkbox')).not.toBeInTheDocument();
    expect(screen.getByText(/envio de foto de perfil em breve/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /cancelar/i })).toHaveAttribute(
      'href',
      '/profile/sobre'
    );
  });

  it('fills the public e-mail from the sign-up e-mail only on explicit request', async () => {
    const user = userEvent.setup();
    render(<ProfileEditForm profile={profile} />);

    await user.click(screen.getByRole('button', { name: /usar meu e-mail de cadastro/i }));

    expect(screen.getByLabelText(/^e-mail:$/i)).toHaveValue('samuel@privado.com');
  });

  it('sends only changed fields, clears an emptied bio with null and navigates after success', async () => {
    const user = userEvent.setup();
    saveHeader.mockResolvedValue(undefined);
    render(<ProfileEditForm profile={profile} />);

    await user.clear(screen.getByLabelText(/nome completo/i));
    await user.type(screen.getByLabelText(/nome completo/i), 'Samuel M.');
    await user.clear(screen.getByLabelText(/minibiografia/i));
    await user.click(screen.getByRole('button', { name: /salvar/i }));

    await waitFor(() => expect(saveHeader).toHaveBeenCalledTimes(1));
    expect(saveHeader).toHaveBeenCalledWith({
      header: { fullName: 'Samuel M.', biography: null },
      contacts: {},
    });
    expect(useFeedbackStore.getState().current?.message).toBe('Perfil atualizado com sucesso.');
    expect(push).toHaveBeenCalledWith('/profile/sobre');
  });

  it('does not report success before the save resolves', async () => {
    const user = userEvent.setup();
    let resolveSave: () => void = () => {};
    saveHeader.mockReturnValue(new Promise<void>((resolve) => (resolveSave = resolve)));
    render(<ProfileEditForm profile={profile} />);

    await user.type(screen.getByLabelText(/nome completo/i), '!');
    await user.click(screen.getByRole('button', { name: /salvar/i }));

    await waitFor(() => expect(saveHeader).toHaveBeenCalled());
    expect(useFeedbackStore.getState().current).toBeNull();
    expect(push).not.toHaveBeenCalled();

    resolveSave();
    await waitFor(() => expect(push).toHaveBeenCalledWith('/profile/sobre'));
  });

  it('shows a backend field error on the matching input and stays on the page', async () => {
    const user = userEvent.setup();
    saveHeader.mockRejectedValue(
      new ApiError('Revise os campos', 422, { username: 'Nome de usuário já está em uso' })
    );
    render(<ProfileEditForm profile={profile} />);

    const username = screen.getByLabelText(/nome de usuário/i);
    await user.clear(username);
    await user.type(username, 'samuel_novo');
    await user.click(screen.getByRole('button', { name: /salvar/i }));

    expect(await screen.findByText('Nome de usuário já está em uso')).toBeInTheDocument();
    expect(username).toHaveAttribute('aria-invalid', 'true');
    expect(push).not.toHaveBeenCalled();
    expect(useFeedbackStore.getState().current).toBeNull();
  });

  it('shows a form-level alert when the save fails without field errors', async () => {
    const user = userEvent.setup();
    saveHeader.mockRejectedValue(new ApiError('Não foi possível salvar o perfil', 502));
    render(<ProfileEditForm profile={profile} />);

    await user.type(screen.getByLabelText(/nome completo/i), '!');
    await user.click(screen.getByRole('button', { name: /salvar/i }));

    const message = await screen.findByText('Não foi possível salvar o perfil');
    expect(message.closest('[role="alert"]')).not.toBeNull();
    expect(push).not.toHaveBeenCalled();
  });

  it('does not touch an unchanged phone even though the phone input emits the country code', async () => {
    const user = userEvent.setup();
    saveHeader.mockResolvedValue(undefined);
    render(<ProfileEditForm profile={profile} />);

    await user.type(screen.getByLabelText(/nome completo/i), '!');
    await user.click(screen.getByRole('button', { name: /salvar/i }));

    await waitFor(() => expect(saveHeader).toHaveBeenCalled());
    expect(saveHeader.mock.calls[0][0].contacts).toEqual({});
  });

  it('validates the username format like the backend', async () => {
    const user = userEvent.setup();
    render(<ProfileEditForm profile={profile} />);

    const username = screen.getByLabelText(/nome de usuário/i);
    await user.clear(username);
    await user.type(username, 'nome com espaço');
    await user.click(screen.getByRole('button', { name: /salvar/i }));

    expect(await screen.findByText(/use apenas letras minúsculas/i)).toBeInTheDocument();
    expect(saveHeader).not.toHaveBeenCalled();
  });

  it('rejects an invalid public e-mail', async () => {
    const user = userEvent.setup();
    render(<ProfileEditForm profile={profile} />);

    await user.type(screen.getByLabelText(/^e-mail:$/i), 'sem-arroba');
    await user.click(screen.getByRole('button', { name: /salvar/i }));

    expect(await screen.findByText(/informe um e-mail válido/i)).toBeInTheDocument();
    expect(saveHeader).not.toHaveBeenCalled();
  });

  it('blocks save when the typed username is already taken', async () => {
    const user = userEvent.setup();
    render(<ProfileEditForm profile={profile} />);

    const username = screen.getByLabelText(/nome de usuário/i);
    await user.clear(username);
    await user.type(username, 'nome_usado');
    expect(await screen.findByText(/este nome de usuário já está em uso/i)).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /salvar/i }));
    expect(saveHeader).not.toHaveBeenCalled();
  });
});
