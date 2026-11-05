import { screen, waitFor, within } from '@testing-library/react';
import { renderWithQuery } from '@/test/query';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import AccountSettingsView from './AccountSettingsView';
import { OwnerProfileProvider } from '@/components/profile/OwnerProfileProvider';
import { ApiError } from '@/lib/api/client';
import { createFaithCommunity, createMissionaryAgency } from '@/services/catalog.service';
import { emptyProfile, updateAbout } from '@/services/profile.service';
import { useFeedbackStore } from '@/stores/feedbackStore';

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
  };
});

vi.mock('@/services/profile.service', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/services/profile.service')>()),
  updateAbout: vi.fn(async () => ({})),
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

    expect(useFeedbackStore.getState().current?.message).toMatch(
      /e-mail alterado com sucesso para novo.missionario@email.com/i
    );
    expect(useFeedbackStore.getState().current?.severity).toBe('success');
  });

  it('triggers secure password reset link email and displays feedback toast', async () => {
    const user = userEvent.setup();
    renderWithQuery(<AccountSettingsView role="missionary" initialEmail="teste@missao.org" />);

    const resetLinkButton = screen.getByRole('button', {
      name: /enviar link de redefinição para meu e-mail/i,
    });
    await user.click(resetLinkButton);

    expect(useFeedbackStore.getState().current?.message).toMatch(
      /link seguro de redefinição de senha enviado para teste@missao.org/i
    );
    expect(useFeedbackStore.getState().current?.severity).toBe('info');
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

  it('tells a supporter the link is not saved yet, without calling the API', async () => {
    const user = userEvent.setup();
    renderWithQuery(<AccountSettingsView role="supporter" />);

    await user.click(screen.getByRole('button', { name: /salvar dados eclesiásticos/i }));

    await waitFor(() =>
      expect(useFeedbackStore.getState().current).toMatchObject({ severity: 'info' })
    );
    expect(updateAbout).not.toHaveBeenCalled();
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
