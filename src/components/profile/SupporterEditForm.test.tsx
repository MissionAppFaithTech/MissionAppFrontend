import { screen, waitFor, within } from '@testing-library/react';
import { renderWithQuery } from '@/test/query';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import SupporterEditForm from '@/components/profile/SupporterEditForm';
import { mockProfile } from '@/mocks/profile';
import { ApiError } from '@/lib/api/client';
import { changeProfilePicture, removeProfilePicture } from '@/services/profilePicture.service';
import { useFeedbackStore } from '@/stores/feedbackStore';

const push = vi.fn();
const refresh = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push, replace: vi.fn(), refresh, prefetch: vi.fn() }),
  usePathname: () => '/profile/supporter/edit-profile',
  useSearchParams: () => new URLSearchParams(),
}));

vi.mock('@/services/profilePicture.service', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/services/profilePicture.service')>()),
  changeProfilePicture: vi.fn(),
  removeProfilePicture: vi.fn(),
}));

const sendPhoto = vi.mocked(changeProfilePicture);
const removePhoto = vi.mocked(removeProfilePicture);
const toast = () => useFeedbackStore.getState().current;

vi.mock('@/services/username.service', () => ({
  checkUsernameAvailability: vi.fn().mockResolvedValue({
    available: false,
    username: 'nome_usado',
    suggestions: ['nome_usado1'],
  }),
}));

describe('SupporterEditForm Component', () => {
  beforeEach(() => {
    useFeedbackStore.setState({ current: null });
    push.mockClear();
    refresh.mockClear();
    sendPhoto.mockReset();
    sendPhoto.mockResolvedValue({ url: 'https://cdn.test/new.webp' });
    removePhoto.mockReset();
    removePhoto.mockResolvedValue(undefined);
    vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:preview');
    vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {});
  });

  it('renders all basic supporter profile information and public contact fields', () => {
    renderWithQuery(<SupporterEditForm profile={mockProfile} />);

    expect(screen.getByRole('heading', { name: /editar perfil de apoiador/i })).toBeInTheDocument();
    expect(screen.getByText(/informações básicas/i)).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /informações de contato/i })).toBeInTheDocument();
    expect(
      screen.getByText(
        /essas informações serão exibidas publicamente para visitantes e apoiadores\./i
      )
    ).toBeInTheDocument();

    // Basic Fields
    expect(screen.getByDisplayValue(mockProfile.username)).toBeInTheDocument();
    expect(screen.getByDisplayValue(mockProfile.displayName)).toBeInTheDocument();
    expect(screen.getByLabelText(/bio \/ papel/i)).toHaveValue(mockProfile.roleDescription);
    expect(screen.queryByRole('button', { name: /desfazer alteração/i })).not.toBeInTheDocument();

    // Contact Fields
    expect(screen.getByLabelText(/^e-mail:$/i)).toHaveValue('samuelhe@gmail.com');
    expect(screen.getByLabelText(/^telefone:$/i)).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: /país do telefone/i })).toBeInTheDocument();
    expect(screen.getByRole('checkbox', { name: /exibir e-mail no meu perfil/i })).toBeChecked();
    expect(screen.getByRole('checkbox', { name: /exibir telefone no meu perfil/i })).toBeChecked();
    expect(
      screen.getByRole('checkbox', { name: /este número é um número de whatsapp/i })
    ).toBeChecked();

    // Action Buttons
    const back = screen.getAllByRole('link', { name: 'Voltar para o perfil' });
    expect(back).toHaveLength(2);
    for (const link of back)
      expect(link).toHaveAttribute('href', '/profile/supporter/missionarios');
    expect(screen.getByRole('button', { name: 'Cancelar' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /salvar/i })).toBeInTheDocument();
  });

  it('saves the changes with a green toast and stays on the page', async () => {
    const user = userEvent.setup();
    renderWithQuery(<SupporterEditForm profile={mockProfile} />);

    await user.type(screen.getByLabelText(/bio \/ papel/i), '!');
    await user.click(screen.getByRole('button', { name: /salvar/i }));

    await waitFor(() =>
      expect(toast()).toMatchObject({
        message: 'Perfil de apoiador atualizado com sucesso!',
        severity: 'success',
      })
    );
    expect(push).not.toHaveBeenCalled();
    expect(sendPhoto).not.toHaveBeenCalled();
  });

  it('saves a confirmed photo right away and keeps showing it', async () => {
    const user = userEvent.setup();
    renderWithQuery(
      <SupporterEditForm profile={{ ...mockProfile, avatarUrl: 'https://cdn.test/a.webp' }} />
    );

    const file = new File(['photo'], 'foto.png', { type: 'image/png' });
    await user.upload(screen.getByLabelText(/editar foto de perfil/i), file);
    expect(sendPhoto).not.toHaveBeenCalled();
    await user.click(screen.getByRole('button', { name: 'Usar esta foto' }));

    await waitFor(() =>
      expect(toast()).toMatchObject({
        message: 'Foto de perfil atualizada com sucesso.',
        severity: 'success',
      })
    );
    expect(sendPhoto).toHaveBeenCalledWith(expect.objectContaining({ file }));
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(screen.getByRole('img', { name: /foto de perfil de/i })).toHaveAttribute(
      'src',
      'https://cdn.test/new.webp'
    );
    expect(refresh).toHaveBeenCalledTimes(1);
    // Not an unsaved change of the form.
    expect(screen.getAllByRole('link', { name: 'Voltar para o perfil' })).toHaveLength(2);
  });

  it('removes the photo right away once confirmed', async () => {
    const user = userEvent.setup();
    renderWithQuery(
      <SupporterEditForm profile={{ ...mockProfile, avatarUrl: 'https://cdn.test/a.webp' }} />
    );

    await user.click(screen.getByRole('button', { name: 'Remover foto' }));
    await user.click(
      within(screen.getByRole('dialog')).getByRole('button', { name: 'Remover foto' })
    );

    await waitFor(() =>
      expect(toast()).toMatchObject({
        message: 'Foto de perfil removida com sucesso.',
        severity: 'success',
      })
    );
    expect(removePhoto).toHaveBeenCalledTimes(1);
  });

  it('"Salvar" without changes says so in a blue toast', async () => {
    const user = userEvent.setup();
    renderWithQuery(<SupporterEditForm profile={mockProfile} />);

    await user.click(screen.getByRole('button', { name: /salvar/i }));

    await waitFor(() =>
      expect(toast()).toMatchObject({ message: 'Nenhuma alteração para salvar.', severity: 'info' })
    );
  });

  it('"Cancelar" undoes the changes with a blue toast and stays', async () => {
    const user = userEvent.setup();
    renderWithQuery(<SupporterEditForm profile={mockProfile} />);

    const bio = screen.getByLabelText(/bio \/ papel/i);
    await user.type(bio, ' extra');
    await user.click(screen.getByRole('button', { name: 'Cancelar' }));

    expect(bio).toHaveValue(mockProfile.roleDescription);
    expect(toast()).toMatchObject({ message: 'Alterações descartadas.', severity: 'info' });
    expect(push).not.toHaveBeenCalled();

    await user.click(screen.getByRole('button', { name: 'Cancelar' }));
    expect(toast()).toMatchObject({
      message: 'Nenhuma alteração para descartar.',
      severity: 'info',
    });
  });

  it('"Voltar" with unsaved changes asks before leaving', async () => {
    const user = userEvent.setup();
    renderWithQuery(<SupporterEditForm profile={mockProfile} />);

    await user.type(screen.getByLabelText(/bio \/ papel/i), '!');
    await user.click(screen.getAllByRole('button', { name: 'Voltar para o perfil' })[0]);
    const dialog = screen.getByRole('dialog', { name: 'Descartar alterações não salvas?' });
    await user.click(within(dialog).getByRole('button', { name: 'Descartar e voltar' }));

    expect(push).toHaveBeenCalledWith('/profile/supporter/missionarios');
  });

  it('shows a failed photo send in the dialog', async () => {
    const user = userEvent.setup();
    sendPhoto.mockRejectedValueOnce(new ApiError('rede', 0));
    renderWithQuery(<SupporterEditForm profile={mockProfile} />);

    await user.upload(
      screen.getByLabelText(/(adicionar|editar) foto de perfil/i),
      new File(['photo'], 'foto.png', { type: 'image/png' })
    );
    await user.click(screen.getByRole('button', { name: 'Usar esta foto' }));

    expect(
      await screen.findByRole('dialog', { name: 'Sem conexão com a internet' })
    ).toBeInTheDocument();
    expect(toast()).toBeNull();
  });

  it('blocks save when the typed username is already taken', async () => {
    const user = userEvent.setup();
    renderWithQuery(<SupporterEditForm profile={mockProfile} />);

    const username = screen.getByLabelText(/nome de usuário/i);
    await user.clear(username);
    await user.type(username, 'nome_usado');

    expect(await screen.findByText(/este nome de usuário já está em uso/i)).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /salvar/i }));
    expect(useFeedbackStore.getState().current).toBeNull();
  });
});
