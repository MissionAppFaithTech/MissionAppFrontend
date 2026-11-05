import { screen, waitFor, within } from '@testing-library/react';
import { renderWithQuery } from '@/test/query';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, it, expect, vi } from 'vitest';
import ProfileEditForm, { buildPayloads } from '@/components/profile/ProfileEditForm';
import { ApiError } from '@/lib/api/client';
import { emptyProfile } from '@/services/profile.service';
import { useFeedbackStore } from '@/stores/feedbackStore';
import { saveProfileEdits } from '@/services/profileSave.service';
import type { ProfileData } from '@/types/profile';

const push = vi.fn();
const refresh = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push, replace: vi.fn(), refresh, prefetch: vi.fn() }),
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

vi.mock('@/services/profileSave.service', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/services/profileSave.service')>()),
  saveProfileEdits: vi.fn(),
}));

const saveHeader = vi.mocked(saveProfileEdits);
const SAVED = { picture: 'unchanged' as const };
const png = () => new File(['photo'], 'foto.png', { type: 'image/png' });
const toast = () => useFeedbackStore.getState().current;

describe('ProfileEditForm', () => {
  beforeEach(() => {
    push.mockClear();
    refresh.mockClear();
    saveHeader.mockReset();
    useFeedbackStore.setState({ current: null });
    vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:preview');
    vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {});
  });

  it('renders the header fields with the current values and no private contact data', () => {
    renderWithQuery(<ProfileEditForm profile={profile} />);

    expect(screen.getByRole('heading', { name: /editar perfil/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/nome completo/i)).toHaveValue('Samuel Mendonça');
    expect(screen.getByLabelText(/nome de usuário/i)).toHaveValue('samuel_missionary');
    expect(screen.getByLabelText(/minibiografia/i)).toHaveValue('Missionário na África do Sul');
    expect(screen.getByText('28/70 caracteres')).toBeInTheDocument();
    // The private login e-mail is never prefilled as a public contact.
    expect(screen.getByLabelText(/^e-mail:$/i)).toHaveValue('');
    expect(screen.queryByRole('checkbox')).not.toBeInTheDocument();
    expect(screen.getByLabelText(/adicionar foto de perfil/i)).toBeInTheDocument();
    expect(screen.getByText(/jpg, png ou webp de até 5 mb/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cancelar' })).toBeInTheDocument();
    // "Voltar" at the top and next to the actions.
    const back = screen.getAllByRole('link', { name: 'Voltar para o perfil' });
    expect(back).toHaveLength(2);
    for (const link of back) expect(link).toHaveAttribute('href', '/profile/sobre');
  });

  it('limits the mini-bio to 70 characters', async () => {
    const user = userEvent.setup();
    renderWithQuery(<ProfileEditForm profile={profile} />);

    const bio = screen.getByLabelText(/minibiografia/i);
    await user.clear(bio);
    await user.type(bio, 'a'.repeat(80));

    expect((bio as HTMLTextAreaElement).value).toHaveLength(70);
    expect(screen.getByText('70/70 caracteres')).toBeInTheDocument();
  });

  it('fills the public e-mail from the sign-up e-mail only on explicit request', async () => {
    const user = userEvent.setup();
    renderWithQuery(<ProfileEditForm profile={profile} />);

    await user.click(screen.getByRole('button', { name: /usar meu e-mail de cadastro/i }));

    expect(screen.getByLabelText(/^e-mail:$/i)).toHaveValue('samuel@privado.com');
  });

  it('sends only changed fields, clears an emptied bio with null and stays after success', async () => {
    const user = userEvent.setup();
    saveHeader.mockResolvedValue(SAVED);
    renderWithQuery(<ProfileEditForm profile={profile} />);

    await user.clear(screen.getByLabelText(/nome completo/i));
    await user.type(screen.getByLabelText(/nome completo/i), 'Samuel M.');
    await user.clear(screen.getByLabelText(/minibiografia/i));
    await user.click(screen.getByRole('button', { name: /salvar/i }));

    await waitFor(() => expect(saveHeader).toHaveBeenCalledTimes(1));
    expect(saveHeader).toHaveBeenCalledWith(
      expect.objectContaining({
        header: { fullName: 'Samuel M.', biography: null },
        contacts: {},
        picture: undefined,
      })
    );
    await waitFor(() =>
      expect(toast()).toMatchObject({
        message: 'Perfil atualizado com sucesso.',
        severity: 'success',
      })
    );
    // Stays on the page, with the saved values and no pending changes.
    expect(push).not.toHaveBeenCalled();
    expect(refresh).toHaveBeenCalledTimes(1);
    expect(screen.getByLabelText(/nome completo/i)).toHaveValue('Samuel M.');
    expect(screen.getAllByRole('link', { name: 'Voltar para o perfil' })).toHaveLength(2);
  });

  it('does not report success before the save resolves', async () => {
    const user = userEvent.setup();
    let resolveSave: () => void = () => {};
    saveHeader.mockReturnValue(new Promise((resolve) => (resolveSave = () => resolve(SAVED))));
    renderWithQuery(<ProfileEditForm profile={profile} />);

    await user.type(screen.getByLabelText(/nome completo/i), '!');
    await user.click(screen.getByRole('button', { name: /salvar/i }));

    await waitFor(() => expect(saveHeader).toHaveBeenCalled());
    expect(toast()).toBeNull();
    expect(screen.getByRole('button', { name: 'Cancelar' })).toBeDisabled();

    resolveSave();
    await waitFor(() => expect(toast()?.severity).toBe('success'));
    expect(push).not.toHaveBeenCalled();
  });

  it('shows a backend field error on the matching input and stays on the page', async () => {
    const user = userEvent.setup();
    saveHeader.mockRejectedValue(
      new ApiError('Revise os campos', 422, { username: 'Nome de usuário já está em uso' })
    );
    renderWithQuery(<ProfileEditForm profile={profile} />);

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
    renderWithQuery(<ProfileEditForm profile={profile} />);

    await user.type(screen.getByLabelText(/nome completo/i), '!');
    await user.click(screen.getByRole('button', { name: /salvar/i }));

    const message = await screen.findByText('Não foi possível salvar o perfil');
    expect(message.closest('[role="alert"]')).not.toBeNull();
    expect(toast()).toMatchObject({
      message: 'Não foi possível salvar o perfil',
      severity: 'error',
    });
    expect(push).not.toHaveBeenCalled();
  });

  it('does not touch an unchanged phone even though the phone input emits the country code', async () => {
    const user = userEvent.setup();
    saveHeader.mockResolvedValue(SAVED);
    renderWithQuery(<ProfileEditForm profile={profile} />);

    await user.type(screen.getByLabelText(/nome completo/i), '!');
    await user.click(screen.getByRole('button', { name: /salvar/i }));

    await waitFor(() => expect(saveHeader).toHaveBeenCalled());
    expect(saveHeader.mock.calls[0][0]!.contacts).toEqual({});
  });

  it('validates the username format like the backend', async () => {
    const user = userEvent.setup();
    renderWithQuery(<ProfileEditForm profile={profile} />);

    const username = screen.getByLabelText(/nome de usuário/i);
    await user.clear(username);
    await user.type(username, 'nome com espaço');
    await user.click(screen.getByRole('button', { name: /salvar/i }));

    expect(await screen.findByText(/use apenas letras minúsculas/i)).toBeInTheDocument();
    expect(saveHeader).not.toHaveBeenCalled();
  });

  it('rejects an invalid public e-mail', async () => {
    const user = userEvent.setup();
    renderWithQuery(<ProfileEditForm profile={profile} />);

    await user.type(screen.getByLabelText(/^e-mail:$/i), 'sem-arroba');
    await user.click(screen.getByRole('button', { name: /salvar/i }));

    expect(await screen.findByText(/informe um e-mail válido/i)).toBeInTheDocument();
    expect(saveHeader).not.toHaveBeenCalled();
  });

  it('blocks save when the typed username is already taken', async () => {
    const user = userEvent.setup();
    renderWithQuery(<ProfileEditForm profile={profile} />);

    const username = screen.getByLabelText(/nome de usuário/i);
    await user.clear(username);
    await user.type(username, 'nome_usado');
    expect(await screen.findByText(/este nome de usuário já está em uso/i)).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /salvar/i }));
    expect(saveHeader).not.toHaveBeenCalled();
  });

  it('asks whether the public phone is WhatsApp only after a phone is typed', async () => {
    const user = userEvent.setup();
    saveHeader.mockResolvedValue(SAVED);
    renderWithQuery(<ProfileEditForm profile={profile} />);

    const whatsappName = /este número é um número de whatsapp/i;
    expect(screen.queryByRole('checkbox', { name: whatsappName })).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /usar meu telefone de cadastro/i }));
    const whatsapp = screen.getByRole('checkbox', { name: whatsappName });
    expect(whatsapp).not.toBeChecked();
    expect(whatsapp).toHaveAccessibleDescription(/o botão de whatsapp não aparece no seu perfil/i);

    await user.click(whatsapp);
    await user.click(screen.getByRole('button', { name: /salvar/i }));

    await waitFor(() => expect(saveHeader).toHaveBeenCalledTimes(1));
    expect(saveHeader).toHaveBeenCalledWith(
      expect.objectContaining({
        header: {},
        contacts: { publicPhone: '+5521987654321', publicPhoneIsWhatsapp: true },
      })
    );
  });
});

describe('ProfileEditForm – photo, Cancelar and Voltar', () => {
  beforeEach(() => {
    push.mockClear();
    refresh.mockClear();
    saveHeader.mockReset();
    useFeedbackStore.setState({ current: null });
    vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:preview');
    vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {});
  });

  const withPhoto = { ...profile, avatarUrl: 'https://cdn.test/old.webp' };
  const avatar = () => screen.queryByRole('img', { name: /foto de perfil de/i });

  it('only saves a chosen photo on "Salvar", with a green toast, and stays', async () => {
    const user = userEvent.setup();
    saveHeader.mockResolvedValue({ picture: 'added' });
    renderWithQuery(<ProfileEditForm profile={profile} />);

    const file = png();
    await user.upload(screen.getByLabelText(/adicionar foto de perfil/i), file);
    expect(saveHeader).not.toHaveBeenCalled();
    expect(avatar()).toHaveAttribute('src', 'blob:preview');

    await user.click(screen.getByRole('button', { name: 'Salvar' }));

    await waitFor(() => expect(saveHeader).toHaveBeenCalledTimes(1));
    expect(saveHeader).toHaveBeenCalledWith(
      expect.objectContaining({
        header: {},
        contacts: {},
        picture: { kind: 'replace', file },
        hadPicture: false,
      })
    );
    await waitFor(() =>
      expect(toast()).toMatchObject({
        message: 'Foto de perfil adicionada com sucesso.',
        severity: 'success',
      })
    );
    expect(push).not.toHaveBeenCalled();
    expect(refresh).toHaveBeenCalledTimes(1);
  });

  it('removes the photo only on "Salvar"', async () => {
    const user = userEvent.setup();
    saveHeader.mockResolvedValue({ picture: 'removed' });
    renderWithQuery(<ProfileEditForm profile={withPhoto} />);

    await user.click(screen.getByRole('button', { name: 'Remover foto' }));
    expect(saveHeader).not.toHaveBeenCalled();
    expect(avatar()).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Salvar' }));

    await waitFor(() =>
      expect(saveHeader).toHaveBeenCalledWith(
        expect.objectContaining({ picture: { kind: 'remove' }, hadPicture: true })
      )
    );
    await waitFor(() =>
      expect(toast()).toMatchObject({
        message: 'Foto de perfil removida com sucesso.',
        severity: 'success',
      })
    );
  });

  it('tells the fields and the photo were saved together', async () => {
    const user = userEvent.setup();
    saveHeader.mockResolvedValue({ picture: 'replaced' });
    renderWithQuery(<ProfileEditForm profile={withPhoto} />);

    await user.type(screen.getByLabelText(/nome completo/i), '!');
    await user.upload(screen.getByLabelText(/alterar foto de perfil/i), png());
    await user.click(screen.getByRole('button', { name: 'Salvar' }));

    await waitFor(() =>
      expect(toast()).toMatchObject({
        message: 'Perfil atualizado com sucesso. Foto de perfil atualizada.',
        severity: 'success',
      })
    );
  });

  it('announces the processing of the new photo while saving', async () => {
    const user = userEvent.setup();
    saveHeader.mockImplementation(async (input) => {
      input.onProcessing?.();
      return new Promise(() => {});
    });
    renderWithQuery(<ProfileEditForm profile={profile} />);

    await user.upload(screen.getByLabelText(/adicionar foto de perfil/i), png());
    await user.click(screen.getByRole('button', { name: 'Salvar' }));

    expect(
      await screen.findByText('Processando a foto de perfil...', { selector: '[role="status"]' })
    ).toBeInTheDocument();
  });

  it('reports a photo the backend could not process in a red toast', async () => {
    const user = userEvent.setup();
    saveHeader.mockResolvedValue({ picture: 'failed' });
    renderWithQuery(<ProfileEditForm profile={profile} />);

    await user.upload(screen.getByLabelText(/adicionar foto de perfil/i), png());
    await user.click(screen.getByRole('button', { name: 'Salvar' }));

    await waitFor(() =>
      expect(toast()).toMatchObject({
        message: 'Não foi possível processar a imagem. Tente enviar outra foto.',
        severity: 'error',
      })
    );
  });

  it('keeps the chosen photo to try again when the save fails', async () => {
    const user = userEvent.setup();
    saveHeader.mockRejectedValue(new ApiError('Não foi possível enviar a foto.', 0));
    renderWithQuery(<ProfileEditForm profile={profile} />);

    await user.upload(screen.getByLabelText(/adicionar foto de perfil/i), png());
    await user.click(screen.getByRole('button', { name: 'Salvar' }));

    await waitFor(() => expect(toast()?.severity).toBe('error'));
    expect(avatar()).toHaveAttribute('src', 'blob:preview');
  });

  it('"Salvar" without changes says so in a blue toast and stays', async () => {
    const user = userEvent.setup();
    renderWithQuery(<ProfileEditForm profile={profile} />);

    await user.click(screen.getByRole('button', { name: 'Salvar' }));

    await waitFor(() =>
      expect(toast()).toMatchObject({ message: 'Nenhuma alteração para salvar.', severity: 'info' })
    );
    expect(saveHeader).not.toHaveBeenCalled();
    expect(push).not.toHaveBeenCalled();
  });

  it('"Cancelar" undoes the fields and the photo, with a blue toast, and stays', async () => {
    const user = userEvent.setup();
    renderWithQuery(<ProfileEditForm profile={withPhoto} />);

    await user.type(screen.getByLabelText(/nome completo/i), ' Jr.');
    await user.click(screen.getByRole('button', { name: 'Remover foto' }));
    await user.click(screen.getByRole('button', { name: 'Cancelar' }));

    expect(screen.getByLabelText(/nome completo/i)).toHaveValue('Samuel Mendonça');
    expect(avatar()).toHaveAttribute('src', 'https://cdn.test/old.webp');
    expect(toast()).toMatchObject({ message: 'Alterações descartadas.', severity: 'info' });
    expect(saveHeader).not.toHaveBeenCalled();
    expect(push).not.toHaveBeenCalled();
    // Nothing pending: "Voltar" is a plain link again.
    expect(screen.getAllByRole('link', { name: 'Voltar para o perfil' })).toHaveLength(2);
  });

  it('"Cancelar" without changes says there is nothing to discard', async () => {
    const user = userEvent.setup();
    renderWithQuery(<ProfileEditForm profile={profile} />);

    await user.click(screen.getByRole('button', { name: 'Cancelar' }));

    expect(toast()).toMatchObject({
      message: 'Nenhuma alteração para descartar.',
      severity: 'info',
    });
  });

  it('"Voltar" with unsaved changes asks first and keeps editing on request', async () => {
    const user = userEvent.setup();
    renderWithQuery(<ProfileEditForm profile={profile} />);

    await user.type(screen.getByLabelText(/nome completo/i), '!');
    const [topBack] = screen.getAllByRole('button', { name: 'Voltar para o perfil' });
    await user.click(topBack);

    const dialog = screen.getByRole('dialog', { name: 'Descartar alterações não salvas?' });
    expect(dialog).toHaveAccessibleDescription(/se voltar agora, elas serão perdidas/i);
    expect(within(dialog).getByRole('button', { name: 'Continuar editando' })).toHaveFocus();

    await user.click(within(dialog).getByRole('button', { name: 'Continuar editando' }));

    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(screen.getByLabelText(/nome completo/i)).toHaveValue('Samuel Mendonça!');
    expect(push).not.toHaveBeenCalled();
  });

  it('"Descartar e voltar" drops the changes and goes to the profile', async () => {
    const user = userEvent.setup();
    renderWithQuery(<ProfileEditForm profile={profile} />);

    await user.upload(screen.getByLabelText(/adicionar foto de perfil/i), png());
    const backButtons = screen.getAllByRole('button', { name: 'Voltar para o perfil' });
    await user.click(backButtons[backButtons.length - 1]);
    await user.click(screen.getByRole('button', { name: 'Descartar e voltar' }));

    expect(push).toHaveBeenCalledWith('/profile/sobre');
    expect(toast()).toMatchObject({ message: 'Alterações descartadas.', severity: 'info' });
    expect(saveHeader).not.toHaveBeenCalled();
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  });
});

describe('buildPayloads – WhatsApp', () => {
  const base = {
    displayName: 'Samuel',
    username: 'samuel',
    bio: '',
    publicEmail: '',
    publicPhone: '+5521987654321',
    allowWhatsappContact: true,
  };

  it('sends nothing when the WhatsApp answer did not change', () => {
    expect(buildPayloads(base, base, {}).contacts).toEqual({});
  });

  it('turns WhatsApp off when the answer changes to no', () => {
    const { contacts } = buildPayloads({ ...base, allowWhatsappContact: false }, base, {});
    expect(contacts).toEqual({ publicPhoneIsWhatsapp: false });
  });

  it('turns WhatsApp off when the phone is removed, even if still checked', () => {
    const { contacts } = buildPayloads({ ...base, publicPhone: '+55' }, base, {});
    expect(contacts).toEqual({ publicPhone: null, publicPhoneIsWhatsapp: false });
  });

  it('ignores a checked answer without a phone', () => {
    const empty = { ...base, publicPhone: '', allowWhatsappContact: false };
    const { contacts } = buildPayloads({ ...empty, allowWhatsappContact: true }, empty, {});
    expect(contacts).toEqual({});
  });
});
