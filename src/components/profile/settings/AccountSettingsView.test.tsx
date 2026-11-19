import { screen, waitFor, within } from '@testing-library/react';
import { renderWithQuery } from '@/test/query';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import AccountSettingsView from './AccountSettingsView';
import { OwnerProfileProvider } from '@/components/profile/OwnerProfileProvider';
import { ApiError } from '@/lib/api/client';
import { requestPasswordReset } from '@/services/auth.service';
import {
  createFaithCommunity,
  createMissionaryAgency,
  getFaithCommunity,
  updateFaithCommunity,
} from '@/services/catalog.service';
import {
  changeAccountEmail,
  changeAccountPassword,
  emptyProfile,
  updateAbout,
  updateHeader,
} from '@/services/profile.service';
import { useFeedbackStore } from '@/stores/feedbackStore';

const mockReplace = vi.fn();
const mockRefresh = vi.fn();
vi.mock('next/navigation', async () => {
  const actual = await vi.importActual('next/navigation');
  return {
    ...actual,
    useRouter: () => ({
      push: vi.fn(),
      replace: mockReplace,
      refresh: mockRefresh,
      prefetch: vi.fn(),
    }),
  };
});

vi.mock('@/services/auth.service', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/services/auth.service')>()),
  requestPasswordReset: vi.fn(async () => ({
    found: true,
    message: 'Se o e-mail estiver cadastrado, você receberá as instruções.',
  })),
}));

vi.mock('@/services/catalog.service', async () => {
  const { normalizeCatalogTerm } = await import('@/lib/catalog/search');
  const catalogs: Record<string, Array<{ id: string; name: string }>> = {
    faithCommunities: [
      { id: 'fc-1', name: 'Igreja Batista Central' },
      { id: 'fc-2', name: 'Igreja Presbiteriana' },
    ],
    missionaryAgencies: [
      { id: 'ma-1', name: 'JOCUM' },
      { id: 'ma-2', name: 'Missão do Interior' },
    ],
  };
  return {
    // Same matching as the backend: accent and case insensitive, "contains".
    searchCatalog: vi.fn(async (kind: string, term: string) => ({
      items: catalogs[kind].filter((item) => normalizeCatalogTerm(item.name).includes(term)),
      hasMore: false,
    })),
    createFaithCommunity: vi.fn(),
    createMissionaryAgency: vi.fn(),
    getFaithCommunity: vi.fn(),
    updateFaithCommunity: vi.fn(),
  };
});

vi.mock('@/services/profile.service', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/services/profile.service')>()),
  changeAccountEmail: vi.fn(async ({ email }: { email: string }) => ({ email })),
  changeAccountPassword: vi.fn(async () => undefined),
  updateAbout: vi.fn(async () => ({})),
  updateHeader: vi.fn(async () => ({})),
}));

/** The missionary area provides the owner's profile, with the saved catalog links. */
function renderMissionary() {
  const owner = {
    ...emptyProfile,
    about: {
      ...emptyProfile.about,
      faithCommunity: 'Igreja Batista Central',
      faithCommunityId: 'fc-1',
      missionaryAgency: 'JOCUM',
      missionaryAgencyId: 'ma-1',
    },
  };
  return renderWithQuery(
    <OwnerProfileProvider profile={owner}>
      <AccountSettingsView role="missionary" />
    </OwnerProfileProvider>
  );
}

/** Fills the required location and phone fields of an open create modal. */
async function fillRequired(
  user: ReturnType<typeof userEvent.setup>,
  dialog: HTMLElement,
  phones: RegExp[]
) {
  await user.type(within(dialog).getByRole('textbox', { name: /^país/i }), 'Brasil');
  await user.type(within(dialog).getByRole('textbox', { name: /^estado/i }), 'RJ');
  await user.type(within(dialog).getByRole('textbox', { name: /^cidade/i }), 'Niterói');
  for (const phone of phones) {
    await user.type(within(dialog).getByRole('textbox', { name: phone }), '21987654321');
  }
}

/** Types `term` in the catalog field and picks `option` from the server results. */
async function choose(label: RegExp, term: string, option: string | RegExp) {
  const user = userEvent.setup();
  const combobox = screen.getByRole('combobox', { name: label });
  await user.clear(combobox);
  await user.type(combobox, term);
  await user.click(
    await within(await screen.findByRole('listbox')).findByRole('option', { name: option })
  );
  return user;
}

describe('AccountSettingsView Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useFeedbackStore.setState({ current: null });
  });

  it('renders all sections for missionary, including Agência Missionária and Soft Delete', () => {
    renderWithQuery(<AccountSettingsView role="missionary" />);

    // Fast navigation chips
    expect(screen.getByText(/navegação rápida/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^credenciais$/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^dados eclesiásticos$/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^agência missionária$/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^zona de perigo$/i })).toBeInTheDocument();

    // Section 1: Credenciais
    expect(screen.getByRole('heading', { name: /credenciais de acesso/i })).toBeInTheDocument();
    expect(screen.getByText(/alteração de e-mail de login/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/novo e-mail/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/senha atual \(para confirmar\)/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /atualizar e-mail/i })).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /enviar link de redefinição para meu e-mail/i })
    ).toBeInTheDocument();

    // Section 2: Dados Eclesiásticos
    expect(screen.getByRole('heading', { name: /dados eclesiásticos/i })).toBeInTheDocument();
    expect(
      screen.getByRole('combobox', { name: /comunidade de fé \(igreja\)/i })
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /salvar dados eclesiásticos/i })).toBeInTheDocument();

    // Section 3: Agência Missionária (Only for missionary)
    expect(screen.getByRole('heading', { name: /agência missionária/i })).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: /^agência missionária/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /salvar agência missionária/i })).toBeInTheDocument();

    // Section 4: Zona de Perigo (Soft delete for missionary)
    expect(screen.getByRole('heading', { name: /zona de perigo/i })).toBeInTheDocument();
    expect(screen.getByText(/desativação de conta missionária/i)).toBeInTheDocument();
    expect(screen.getAllByText(/soft delete/i).length).toBeGreaterThan(0);
    expect(
      screen.getByRole('button', { name: /desativar conta de missionário/i })
    ).toBeInTheDocument();
  });

  it('renders correctly for supporter (common user) without Agência Missionária and with Hard Delete', () => {
    renderWithQuery(<AccountSettingsView role="supporter" />);

    // Fast navigation shouldn't have Agência Missionária chip
    expect(
      screen.queryByRole('button', { name: /^agência missionária$/i })
    ).not.toBeInTheDocument();

    // Section 2: Supporter has optional church indication
    expect(screen.getByRole('heading', { name: /dados eclesiásticos/i })).toBeInTheDocument();
    expect(screen.getAllByText(/opcional/i).length).toBeGreaterThan(0);

    // Supporter does NOT have Agência Missionária card
    expect(screen.queryByRole('heading', { name: /agência missionária/i })).not.toBeInTheDocument();

    // Section 4: Supporter has Hard Delete
    expect(screen.getByText(/exclusão definitiva de conta de apoiador/i)).toBeInTheDocument();
    expect(screen.getAllByText(/hard delete/i).length).toBeGreaterThan(0);
    expect(screen.queryByText(/desativação de conta missionária/i)).not.toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /excluir conta definitivamente/i })
    ).toBeInTheDocument();
  });

  it('offers the light/dark appearance switch in its own section', () => {
    renderWithQuery(<AccountSettingsView role="missionary" />);

    expect(screen.getByRole('heading', { level: 2, name: 'Aparência' })).toBeInTheDocument();
    const appearance = screen.getByRole('group', { name: 'Aparência' });
    expect(appearance).toContainElement(screen.getByRole('button', { name: 'Escuro' }));
  });

  it('validates and updates email successfully', async () => {
    const user = userEvent.setup();
    renderWithQuery(<AccountSettingsView role="missionary" />);

    const updateEmailButton = screen.getByRole('button', { name: /atualizar e-mail/i });
    await user.click(updateEmailButton);

    // Validation errors
    expect(screen.getByText(/informe o novo endereço de e-mail/i)).toBeInTheDocument();

    // Fill new email and password
    const emailInput = screen.getByLabelText(/novo e-mail/i);
    const passwordInput = screen.getByLabelText(/senha atual \(para confirmar\)/i);

    await user.type(emailInput, 'novo.missionario@email.com');
    await user.type(passwordInput, 'senha123');
    await user.click(updateEmailButton);

    await waitFor(() =>
      expect(changeAccountEmail).toHaveBeenCalledWith({
        email: 'novo.missionario@email.com',
        currentPassword: 'senha123',
      })
    );
    expect(useFeedbackStore.getState().current?.message).toMatch(
      /e-mail alterado com sucesso para novo.missionario@email.com/i
    );
    expect(useFeedbackStore.getState().current?.severity).toBe('success');
  });

  it('shows API field errors when changing email fails', async () => {
    vi.mocked(changeAccountEmail).mockRejectedValueOnce(
      new ApiError('A senha atual está incorreta.', 422, {
        currentPassword: 'A senha atual está incorreta.',
      })
    );
    const user = userEvent.setup();
    renderWithQuery(<AccountSettingsView role="missionary" />);

    await user.type(screen.getByLabelText(/novo e-mail/i), 'outro@email.com');
    await user.type(screen.getByLabelText(/senha atual \(para confirmar\)/i), 'errada');
    await user.click(screen.getByRole('button', { name: /atualizar e-mail/i }));

    const passwordField = screen.getByLabelText(/senha atual \(para confirmar\)/i);
    await waitFor(() => expect(passwordField).toHaveAttribute('aria-invalid', 'true'));
    expect(passwordField).toHaveAccessibleDescription(/A senha atual está incorreta\./);
  });

  it('rejects changing email to the same current email (case-insensitive) and toggles password visibility', async () => {
    const user = userEvent.setup();
    renderWithQuery(<AccountSettingsView role="missionary" initialEmail="samuelhe@gmail.com" />);

    const emailField = screen.getByLabelText(/novo e-mail/i);
    const passwordField = screen.getByLabelText(/senha atual \(para confirmar\)/i);

    expect(passwordField).toHaveAttribute('type', 'password');
    const toggleButtons = screen.getAllByRole('button', { name: /exibir senha/i });
    await user.click(toggleButtons[0]);
    expect(passwordField).toHaveAttribute('type', 'text');

    await user.type(emailField, 'SAMUELHE@GMAIL.COM');
    await user.type(passwordField, 'Senha@123');
    await user.click(screen.getByRole('button', { name: /atualizar e-mail/i }));

    expect(emailField).toHaveAttribute('aria-invalid', 'true');
    expect(emailField).toHaveAccessibleDescription(
      /O novo e-mail deve ser diferente do e-mail atual\./
    );
    expect(changeAccountEmail).not.toHaveBeenCalled();
  });

  it('maps API email field error and generic 502 error in email change', async () => {
    vi.mocked(changeAccountEmail)
      .mockRejectedValueOnce(
        new ApiError('Este e-mail já está em uso.', 422, {
          email: 'Este e-mail já está em uso.',
        })
      )
      .mockRejectedValueOnce(new ApiError('Servidor indisponível no momento.', 502));

    const user = userEvent.setup();
    renderWithQuery(<AccountSettingsView role="missionary" />);

    const emailField = screen.getByLabelText(/novo e-mail/i);
    await user.type(emailField, 'usado@email.com');
    await user.type(screen.getByLabelText(/senha atual \(para confirmar\)/i), 'Senha@123');
    await user.click(screen.getByRole('button', { name: /atualizar e-mail/i }));

    await waitFor(() => expect(emailField).toHaveAttribute('aria-invalid', 'true'));
    expect(emailField).toHaveAccessibleDescription(/Este e-mail já está em uso\./);

    // Retry and hit generic 502 alert
    await user.click(screen.getByRole('button', { name: /atualizar e-mail/i }));
    const alerts = await screen.findAllByRole('alert');
    expect(
      alerts.some((alert) => alert.textContent?.includes('Servidor indisponível no momento.'))
    ).toBe(true);
  });

  it('validates and updates password directly, then redirects to login', async () => {
    const user = userEvent.setup();
    renderWithQuery(<AccountSettingsView role="missionary" />);

    const submitBtn = screen.getByRole('button', { name: /^alterar senha$/i });
    await user.click(submitBtn);

    expect(screen.getByText(/informe a senha atual/i)).toBeInTheDocument();

    await user.type(screen.getByLabelText(/^senha atual$/i), 'Velha@123');
    await user.type(screen.getByLabelText(/^nova senha$/i), 'NovaSenha@123');
    await user.type(screen.getByLabelText(/confirmar nova senha/i), 'NovaSenha@123');
    await user.click(submitBtn);

    await waitFor(() =>
      expect(changeAccountPassword).toHaveBeenCalledWith({
        currentPassword: 'Velha@123',
        newPassword: 'NovaSenha@123',
        newPasswordConfirmation: 'NovaSenha@123',
      })
    );
    expect(useFeedbackStore.getState().current?.severity).toBe('success');
    expect(mockReplace).toHaveBeenCalledWith('/login');
  });

  it('shows API field errors when current password is wrong in password change', async () => {
    vi.mocked(changeAccountPassword).mockRejectedValueOnce(
      new ApiError('A senha atual está incorreta.', 422, {
        currentPassword: 'A senha atual está incorreta.',
      })
    );
    const user = userEvent.setup();
    renderWithQuery(<AccountSettingsView role="missionary" />);

    await user.type(screen.getByLabelText(/^senha atual$/i), 'Errada@123');
    await user.type(screen.getByLabelText(/^nova senha$/i), 'NovaSenha@123');
    await user.type(screen.getByLabelText(/confirmar nova senha/i), 'NovaSenha@123');
    await user.click(screen.getByRole('button', { name: /^alterar senha$/i }));

    const currentPasswordInput = screen.getByLabelText(/^senha atual$/i);
    await waitFor(() => expect(currentPasswordInput).toHaveAttribute('aria-invalid', 'true'));
    expect(currentPasswordInput).toHaveAccessibleDescription(/A senha atual está incorreta\./);
  });

  it('validates weak password, >32 chars, mismatched confirmation, cancel reset, and generic API error in password change', async () => {
    vi.mocked(changeAccountPassword).mockRejectedValueOnce(
      new ApiError('Erro temporário ao atualizar senha.', 502)
    );
    const user = userEvent.setup();
    renderWithQuery(<AccountSettingsView role="missionary" />);

    const currentPwd = screen.getByLabelText(/^senha atual$/i);
    const newPwd = screen.getByLabelText(/^nova senha$/i);
    const confirmPwd = screen.getByLabelText(/confirmar nova senha/i);
    const submitBtn = screen.getByRole('button', { name: /^alterar senha$/i });
    const cancelBtn = screen.getByRole('button', { name: /cancelar alteração de senha/i });

    expect(cancelBtn).toBeDisabled();

    // Weak password & mismatched confirmation
    await user.type(currentPwd, 'Velha@123');
    await user.type(newPwd, 'fraca');
    await user.type(confirmPwd, 'outra');
    await user.click(submitBtn);

    expect(newPwd).toHaveAttribute('aria-invalid', 'true');
    expect(newPwd).toHaveAccessibleDescription(/senha fraca: inclua/i);
    expect(confirmPwd).toHaveAttribute('aria-invalid', 'true');
    expect(confirmPwd).toHaveAccessibleDescription(/as senhas não coincidem/i);

    // >32 characters password
    await user.clear(newPwd);
    await user.type(newPwd, 'NovaSenhaMuitoLonga1234567890@AbcDef');
    await user.click(submitBtn);
    expect(newPwd).toHaveAccessibleDescription(/no máximo 32 caracteres/i);

    // Cancel clears fields and errors
    await user.click(cancelBtn);
    expect(currentPwd).toHaveValue('');
    expect(newPwd).toHaveValue('');
    expect(confirmPwd).toHaveValue('');
    expect(newPwd).toHaveAttribute('aria-invalid', 'false');
    expect(cancelBtn).toBeDisabled();

    // Valid inputs hitting 502 alert
    await user.type(currentPwd, 'Velha@123');
    await user.type(newPwd, 'NovaSenha@123');
    await user.type(confirmPwd, 'NovaSenha@123');
    await user.click(submitBtn);

    const alerts = await screen.findAllByRole('alert');
    expect(
      alerts.some((alert) => alert.textContent?.includes('Erro temporário ao atualizar senha.'))
    ).toBe(true);
  });

  it('triggers secure password reset link email and displays feedback toast', async () => {
    const user = userEvent.setup();
    renderWithQuery(<AccountSettingsView role="missionary" initialEmail="teste@missao.org" />);

    const resetLinkButton = screen.getByRole('button', {
      name: /enviar link de redefinição para meu e-mail/i,
    });
    await user.click(resetLinkButton);

    await waitFor(() =>
      expect(requestPasswordReset).toHaveBeenCalledWith({ login: 'teste@missao.org' })
    );
    expect(useFeedbackStore.getState().current?.message).toMatch(
      /link seguro de redefinição de senha enviado para teste@missao.org/i
    );
    expect(useFeedbackStore.getState().current?.severity).toBe('info');
  });

  it('shows an error toast when requesting password reset link fails', async () => {
    vi.mocked(requestPasswordReset).mockRejectedValueOnce(
      new ApiError('Serviço de e-mail indisponível.', 502)
    );
    const user = userEvent.setup();
    renderWithQuery(<AccountSettingsView role="missionary" initialEmail="teste@missao.org" />);

    await user.click(
      screen.getByRole('button', {
        name: /enviar link de redefinição para meu e-mail/i,
      })
    );

    await waitFor(() =>
      expect(useFeedbackStore.getState().current).toMatchObject({
        message: 'Serviço de e-mail indisponível.',
        severity: 'error',
      })
    );
  });

  it('links another faith community through the about endpoint', async () => {
    renderMissionary();

    const user = await choose(/comunidade de fé/i, 'presb', 'Igreja Presbiteriana');
    await user.click(screen.getByRole('button', { name: /salvar dados eclesiásticos/i }));

    await waitFor(() => expect(updateAbout).toHaveBeenCalledWith({ faithCommunityId: 'fc-2' }));
    expect(useFeedbackStore.getState().current).toMatchObject({
      message: expect.stringMatching(/dados eclesiásticos atualizados com sucesso/i),
      severity: 'success',
    });
    expect(
      screen.getByRole('button', { name: 'Cancelar alterações dos dados eclesiásticos' })
    ).toBeDisabled();
  });

  it('unlinks the faith community with null', async () => {
    renderMissionary();

    const user = userEvent.setup();
    await user.click(screen.getByRole('combobox', { name: /comunidade de fé/i }));
    await user.click(screen.getByRole('button', { name: 'Limpar' }));
    await user.click(screen.getByRole('button', { name: /salvar dados eclesiásticos/i }));

    await waitFor(() => expect(updateAbout).toHaveBeenCalledWith({ faithCommunityId: null }));
  });

  it('switches the missionary agency through the about endpoint', async () => {
    renderMissionary();

    const user = await choose(/^agência missionária/i, 'missao', 'Missão do Interior');
    await user.click(screen.getByRole('button', { name: /salvar agência missionária/i }));

    await waitFor(() => expect(updateAbout).toHaveBeenCalledWith({ missionaryAgencyId: 'ma-2' }));
    expect(useFeedbackStore.getState().current?.message).toMatch(
      /agência missionária atualizada com sucesso/i
    );
  });

  it('shows the API error in an alert and keeps the selection', async () => {
    vi.mocked(updateAbout).mockRejectedValueOnce(new ApiError('Agência inexistente', 422));
    renderMissionary();

    const user = await choose(/^agência missionária/i, 'missao', 'Missão do Interior');
    await user.click(screen.getByRole('button', { name: /salvar agência missionária/i }));

    const alerts = await screen.findAllByRole('alert');
    expect(alerts.some((alert) => alert.textContent?.includes('Agência inexistente'))).toBe(true);
    expect(
      screen.getByRole('button', { name: 'Cancelar alterações da agência missionária' })
    ).toBeEnabled();
  });

  it('shows a link error of the API on the field', async () => {
    vi.mocked(updateAbout).mockRejectedValueOnce(
      new ApiError('Revise os campos destacados e tente novamente.', 422, {
        missionaryAgencyId: 'Agência missionária informada não existe',
      })
    );
    renderMissionary();

    const user = await choose(/^agência missionária/i, 'missao', 'Missão do Interior');
    await user.click(screen.getByRole('button', { name: /salvar agência missionária/i }));

    const field = screen.getByRole('combobox', { name: /^agência missionária/i });
    await waitFor(() => expect(field).toHaveAttribute('aria-invalid', 'true'));
    expect(field).toHaveAccessibleDescription(/Agência missionária informada não existe/);
    expect(field).toHaveFocus();
  });

  it('keeps the agency required', async () => {
    renderMissionary();
    const user = userEvent.setup();

    await user.click(screen.getByRole('combobox', { name: /^agência missionária/i }));
    await user.click(screen.getByRole('button', { name: 'Limpar' }));
    await user.click(screen.getByRole('button', { name: /salvar agência missionária/i }));

    expect(
      screen.getByRole('combobox', { name: /^agência missionária/i })
    ).toHaveAccessibleDescription(/Selecione a agência missionária\./);
    expect(updateAbout).not.toHaveBeenCalled();
  });

  it('registers a missing community in the modal and links it on save', async () => {
    vi.mocked(createFaithCommunity).mockResolvedValueOnce({ id: 'fc-9', name: 'Igreja Nova' });
    renderMissionary();

    const user = await choose(/comunidade de fé/i, 'Igreja Nova', /adicionar comunidade de fé/i);
    const dialog = await screen.findByRole('dialog');
    expect(within(dialog).getByRole('textbox', { name: /^nome$/i })).toHaveValue('Igreja Nova');
    await user.type(within(dialog).getByRole('textbox', { name: /nome do pastor/i }), 'Pr. Ana');
    await fillRequired(user, dialog, [/^telefone da igreja/i, /^telefone do pastor/i]);
    await user.click(within(dialog).getByRole('button', { name: /^salvar$/i }));

    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(createFaithCommunity).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'Igreja Nova', pastorName: 'Pr. Ana' })
    );
    expect(screen.getByRole('combobox', { name: /comunidade de fé/i })).toHaveValue('Igreja Nova');

    await user.click(screen.getByRole('button', { name: /salvar dados eclesiásticos/i }));
    await waitFor(() => expect(updateAbout).toHaveBeenCalledWith({ faithCommunityId: 'fc-9' }));
  });

  it('shows the API field errors inside the modal, which stays open', async () => {
    vi.mocked(createMissionaryAgency).mockRejectedValueOnce(
      new ApiError('Revise os campos destacados e tente novamente.', 422, {
        name: 'Já existe uma agência com este nome nesta cidade.',
      })
    );
    renderMissionary();

    const user = await choose(/^agência missionária/i, 'JOCUM Rio', /adicionar agência/i);
    const dialog = await screen.findByRole('dialog');
    await fillRequired(user, dialog, [/^telefone$/i]);
    await user.click(within(dialog).getByRole('button', { name: /^salvar$/i }));

    const name = await within(dialog).findByRole('textbox', { name: /^nome$/i });
    await waitFor(() => expect(name).toHaveAttribute('aria-invalid', 'true'));
    expect(name).toHaveAccessibleDescription(/Já existe uma agência com este nome nesta cidade\./);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(updateAbout).not.toHaveBeenCalled();
  });

  it('saves a supporter faith community link through updateHeader', async () => {
    renderWithQuery(<AccountSettingsView role="supporter" />);

    const user = await choose(/comunidade de fé/i, 'presb', 'Igreja Presbiteriana');
    await user.click(screen.getByRole('button', { name: /salvar dados eclesiásticos/i }));

    await waitFor(() => expect(updateHeader).toHaveBeenCalledWith({ faithCommunityId: 'fc-2' }));
    expect(useFeedbackStore.getState().current).toMatchObject({
      message: expect.stringMatching(/dados eclesiásticos atualizados com sucesso/i),
      severity: 'success',
    });
    expect(updateAbout).not.toHaveBeenCalled();
  });

  it('edits the linked faith community details in the modal', async () => {
    vi.mocked(getFaithCommunity).mockResolvedValueOnce({
      name: 'Igreja Batista Central',
      address1: 'Rua Central, 100',
      address2: '',
      city: 'Niterói',
      state: 'RJ',
      country: 'Brasil',
      zipCode: '24020-000',
      website: 'https://ibcentral.org.br',
      churchPhone: '+552134567890',
      pastorName: 'Pr. Carlos',
      pastorPhone: '+5521987654321',
    });
    vi.mocked(updateFaithCommunity).mockResolvedValueOnce({
      id: 'fc-1',
      name: 'Igreja Batista Central Renovada',
    });
    renderMissionary();

    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: /editar dados da comunidade/i }));

    const dialog = await screen.findByRole('dialog');
    expect(
      within(dialog).getByRole('heading', { name: /editar comunidade de fé/i })
    ).toBeInTheDocument();
    const nameInput = within(dialog).getByRole('textbox', { name: /^nome$/i });
    expect(nameInput).toHaveValue('Igreja Batista Central');

    await user.clear(nameInput);
    await user.type(nameInput, 'Igreja Batista Central Renovada');
    await user.click(within(dialog).getByRole('button', { name: /^salvar$/i }));

    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(updateFaithCommunity).toHaveBeenCalledWith(
      'fc-1',
      expect.objectContaining({
        name: 'Igreja Batista Central Renovada',
        pastorName: 'Pr. Carlos',
      })
    );
    expect(screen.getByRole('combobox', { name: /comunidade de fé/i })).toHaveValue(
      'Igreja Batista Central Renovada'
    );
    expect(useFeedbackStore.getState().current).toMatchObject({
      message: expect.stringMatching(/dados da comunidade de fé atualizados com sucesso/i),
      severity: 'success',
    });
  });

  it('shows an alert when loading faith community details fails or saving edited community returns 403', async () => {
    vi.mocked(getFaithCommunity)
      .mockRejectedValueOnce(new ApiError('Comunidade não encontrada.', 404))
      .mockResolvedValueOnce({
        name: 'Igreja Batista Central',
        address1: 'Rua Central, 100',
        address2: '',
        city: 'Niterói',
        state: 'RJ',
        country: 'Brasil',
        zipCode: '24020-000',
        website: 'https://ibcentral.org.br',
        churchPhone: '+552134567890',
        pastorName: 'Pr. Carlos',
        pastorPhone: '+5521987654321',
      });
    vi.mocked(updateFaithCommunity).mockRejectedValueOnce(
      new ApiError('Você não tem permissão para editar esta comunidade.', 403)
    );

    renderMissionary();
    const user = userEvent.setup();

    // First click fails on getFaithCommunity
    await user.click(screen.getByRole('button', { name: /editar dados da comunidade/i }));
    const sectionAlerts = await screen.findAllByRole('alert');
    expect(sectionAlerts.some((a) => a.textContent?.includes('Comunidade não encontrada.'))).toBe(
      true
    );
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    // Second click loads modal, then save fails with 403 inside modal
    await user.click(screen.getByRole('button', { name: /editar dados da comunidade/i }));
    const dialog = await screen.findByRole('dialog');
    await user.click(within(dialog).getByRole('button', { name: /^salvar$/i }));

    const modalAlert = await within(dialog).findByRole('alert');
    expect(modalAlert).toHaveTextContent('Você não tem permissão para editar esta comunidade.');
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('handles soft delete confirmation modal for missionary', async () => {
    const user = userEvent.setup();
    renderWithQuery(<AccountSettingsView role="missionary" />);

    const deactivateBtn = screen.getByRole('button', { name: /desativar conta de missionário/i });
    await user.click(deactivateBtn);

    // Dialog opens
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: /confirmar desativação de conta/i })
    ).toBeInTheDocument();

    const confirmBtn = screen.getByRole('button', {
      name: /confirmar desativação \(soft delete\)/i,
    });
    await user.click(confirmBtn);

    expect(useFeedbackStore.getState().current?.message).toMatch(
      /conta de missionário desativada com sucesso \(soft delete aplicado\)/i
    );
    expect(useFeedbackStore.getState().current?.severity).toBe('info');
  });

  it('handles hard delete confirmation modal for supporter requiring EXCLUIR confirmation', async () => {
    const user = userEvent.setup();
    renderWithQuery(<AccountSettingsView role="supporter" />);

    const deleteBtn = screen.getByRole('button', { name: /excluir conta definitivamente/i });
    await user.click(deleteBtn);

    // Dialog opens
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: /confirmar exclusão definitiva/i })
    ).toBeInTheDocument();

    // Confirm button is disabled initially
    const confirmButtons = screen.getAllByRole('button', {
      name: /excluir conta definitivamente/i,
    });
    const modalConfirmBtn = confirmButtons[confirmButtons.length - 1];
    expect(modalConfirmBtn).toBeDisabled();

    // Type confirmation text EXCLUIR
    const input = screen.getByPlaceholderText('EXCLUIR');
    await user.type(input, 'EXCLUIR');

    expect(modalConfirmBtn).toBeEnabled();
    await user.click(modalConfirmBtn);

    expect(useFeedbackStore.getState().current?.message).toMatch(
      /conta excluída definitivamente com sucesso \(hard delete aplicado\)/i
    );
    expect(useFeedbackStore.getState().current?.severity).toBe('info');
  });

  describe('Voltar e Cancelar', () => {
    it.each([
      ['missionary', '/profile/sobre'],
      ['supporter', '/profile/supporter/missionarios'],
    ] as const)('shows "Voltar" at the top and bottom leading to the %s profile', (role, href) => {
      renderWithQuery(<AccountSettingsView role={role} />);

      const back = screen.getAllByRole('link', { name: 'Voltar para o perfil' });
      expect(back).toHaveLength(2);
      back.forEach((link) => {
        expect(link).toHaveAttribute('href', href);
        expect(link).toHaveTextContent('Voltar');
      });
    });

    it('keeps every "Cancelar" disabled while nothing was changed', () => {
      renderWithQuery(<AccountSettingsView role="missionary" />);

      expect(screen.getByRole('button', { name: 'Cancelar alteração de e-mail' })).toBeDisabled();
      expect(
        screen.getByRole('button', { name: 'Cancelar alterações dos dados eclesiásticos' })
      ).toBeDisabled();
      expect(
        screen.getByRole('button', { name: 'Cancelar alterações da agência missionária' })
      ).toBeDisabled();
    });

    it('discards the typed e-mail, password and errors', async () => {
      const user = userEvent.setup();
      renderWithQuery(<AccountSettingsView role="missionary" />);

      const email = screen.getByLabelText(/novo e-mail/i);
      await user.type(email, 'invalido');
      await user.click(screen.getByRole('button', { name: /atualizar e-mail/i }));
      expect(email).toHaveAttribute('aria-invalid', 'true');

      await user.click(screen.getByRole('button', { name: 'Cancelar alteração de e-mail' }));

      expect(email).toHaveValue('');
      expect(screen.getByLabelText(/senha atual \(para confirmar\)/i)).toHaveValue('');
      expect(email).toHaveAttribute('aria-invalid', 'false');
      expect(screen.getByRole('button', { name: 'Cancelar alteração de e-mail' })).toBeDisabled();
      expect(useFeedbackStore.getState().current).toBeNull();
    });

    it('restores the last saved selection and stays on the page', async () => {
      renderMissionary();

      const user = await choose(/comunidade de fé/i, 'presb', 'Igreja Presbiteriana');
      const cancel = screen.getByRole('button', {
        name: 'Cancelar alterações dos dados eclesiásticos',
      });
      expect(cancel).toBeEnabled();
      await user.click(cancel);

      expect(screen.getByRole('combobox', { name: /comunidade de fé/i })).toHaveValue(
        'Igreja Batista Central'
      );
      expect(cancel).toBeDisabled();
      expect(updateAbout).not.toHaveBeenCalled();
    });
  });

  describe('server data changes', () => {
    const ownerWith = (email: string, agencyId: string, agency: string) => ({
      ...emptyProfile,
      contact: { publicEmail: '', publicPhone: '', accountEmail: email },
      about: {
        ...emptyProfile.about,
        faithCommunity: 'Igreja Batista Central',
        faithCommunityId: 'fc-1',
        missionaryAgency: agency,
        missionaryAgencyId: agencyId,
      },
    });

    it('shows the e-mail and agency the server sends now, not the previous ones', async () => {
      const { rerender } = renderWithQuery(
        <OwnerProfileProvider profile={ownerWith('ana@example.com', 'ma-1', 'JOCUM')}>
          <AccountSettingsView role="missionary" />
        </OwnerProfileProvider>
      );
      expect(screen.getAllByText('ana@example.com').length).toBeGreaterThan(0);

      // e.g. the agency was changed in "Sobre" and the page refreshed.
      rerender(
        <OwnerProfileProvider
          profile={ownerWith('ana.nova@example.com', 'ma-2', 'Missão do Interior')}
        >
          <AccountSettingsView role="missionary" />
        </OwnerProfileProvider>
      );

      expect(screen.getAllByText('ana.nova@example.com').length).toBeGreaterThan(0);
      expect(screen.queryByText('ana@example.com')).not.toBeInTheDocument();
      await waitFor(() =>
        expect(screen.getByRole('combobox', { name: /^agência missionária/i })).toHaveValue(
          'Missão do Interior'
        )
      );
      expect(
        screen.getByRole('button', { name: 'Cancelar alterações da agência missionária' })
      ).toBeDisabled();
    });

    const renderOwner = (profile: ReturnType<typeof ownerWith>) => (
      <OwnerProfileProvider profile={profile}>
        <AccountSettingsView role="missionary" />
      </OwnerProfileProvider>
    );
    const agencyCombobox = () => screen.getByRole('combobox', { name: /^agência missionária/i });

    it('follows a new agency id even when the name is the same', async () => {
      const { rerender } = renderWithQuery(renderOwner(ownerWith('a@x.com', 'ma-1', 'JOCUM')));
      const user = await choose(/^agência missionária/i, 'missao', 'Missão do Interior');

      rerender(renderOwner(ownerWith('a@x.com', 'ma-2', 'JOCUM')));

      // The server's link wins over the unsaved pick, and nothing is left to cancel.
      await waitFor(() => expect(agencyCombobox()).toHaveValue('JOCUM'));
      expect(
        screen.getByRole('button', { name: 'Cancelar alterações da agência missionária' })
      ).toBeDisabled();
      await user.click(screen.getByRole('button', { name: /salvar agência missionária/i }));
      await waitFor(() => expect(updateAbout).toHaveBeenCalledWith({ missionaryAgencyId: 'ma-2' }));
    });

    it('keeps what the user types when the refresh after saving brings the same link', async () => {
      const { rerender } = renderWithQuery(renderOwner(ownerWith('a@x.com', 'ma-1', 'JOCUM')));
      const user = await choose(/^agência missionária/i, 'missao', 'Missão do Interior');
      await user.click(screen.getByRole('button', { name: /salvar agência missionária/i }));
      await waitFor(() => expect(updateAbout).toHaveBeenCalledTimes(1));
      await user.clear(agencyCombobox());
      await user.type(agencyCombobox(), 'jo');
      const before = agencyCombobox();

      rerender(renderOwner(ownerWith('a@x.com', 'ma-2', 'Missão do Interior')));

      expect(agencyCombobox()).toBe(before);
      expect(before).toHaveValue('jo');
      expect(before).toHaveFocus();
    });

    it('follows a new name of an agency that is not in the catalog yet', async () => {
      const { rerender } = renderWithQuery(
        renderOwner(ownerWith('a@x.com', 'ma-9', 'Agência Nova'))
      );
      expect(agencyCombobox()).toHaveValue('Agência Nova');

      rerender(renderOwner(ownerWith('a@x.com', 'ma-9', 'Agência Renomeada')));

      await waitFor(() => expect(agencyCombobox()).toHaveValue('Agência Renomeada'));
    });
  });

  describe('e-mail without a saved account e-mail', () => {
    it('falls back per role when the profile has no contact', () => {
      const { unmount } = renderWithQuery(
        <OwnerProfileProvider profile={{ ...emptyProfile, contact: undefined }}>
          <AccountSettingsView role="missionary" />
        </OwnerProfileProvider>
      );
      expect(screen.getAllByText('samuelhe@gmail.com').length).toBeGreaterThan(0);
      unmount();

      renderWithQuery(<AccountSettingsView role="supporter" />);
      expect(screen.getAllByText('soraia.santos@email.com').length).toBeGreaterThan(0);
    });
  });
});
