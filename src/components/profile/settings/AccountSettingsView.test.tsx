import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, beforeEach } from 'vitest';
import AccountSettingsView from './AccountSettingsView';
import { useFeedbackStore } from '@/stores/feedbackStore';

describe('AccountSettingsView Component', () => {
  beforeEach(() => {
    useFeedbackStore.setState({ current: null });
  });

  it('renders all sections for missionary, including Agência Missionária and Soft Delete', () => {
    render(<AccountSettingsView role="missionary" />);

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
    expect(screen.getByLabelText(/nome da comunidade de fé \(igreja\)/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/endereço 1 \(rua, avenida, número\)/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/website da igreja/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/nome do pastor responsável/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /salvar dados eclesiásticos/i })).toBeInTheDocument();

    // Section 3: Agência Missionária (Only for missionary)
    expect(screen.getByRole('heading', { name: /agência missionária/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/nome da agência missionária/i)).toBeInTheDocument();
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
    render(<AccountSettingsView role="supporter" />);

    // Fast navigation shouldn't have Agência Missionária chip
    expect(
      screen.queryByRole('button', { name: /^agência missionária$/i })
    ).not.toBeInTheDocument();

    // Section 2: Supporter has optional church indication
    expect(screen.getByRole('heading', { name: /dados eclesiásticos/i })).toBeInTheDocument();
    expect(screen.getByText(/opcional/i)).toBeInTheDocument();

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
    render(<AccountSettingsView role="missionary" />);

    expect(screen.getByRole('heading', { level: 2, name: 'Aparência' })).toBeInTheDocument();
    const appearance = screen.getByRole('group', { name: 'Aparência' });
    expect(appearance).toContainElement(screen.getByRole('button', { name: 'Escuro' }));
  });

  it('validates and updates email successfully', async () => {
    const user = userEvent.setup();
    render(<AccountSettingsView role="missionary" />);

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
    render(<AccountSettingsView role="missionary" initialEmail="teste@missao.org" />);

    const resetLinkButton = screen.getByRole('button', {
      name: /enviar link de redefinição para meu e-mail/i,
    });
    await user.click(resetLinkButton);

    expect(useFeedbackStore.getState().current?.message).toMatch(
      /link seguro de redefinição de senha enviado para teste@missao.org/i
    );
    expect(useFeedbackStore.getState().current?.severity).toBe('info');
  });

  it('allows saving ecclesiastical data and displays success notification', async () => {
    const user = userEvent.setup();
    render(<AccountSettingsView role="missionary" />);

    const saveEcclesiasticalButton = screen.getByRole('button', {
      name: /salvar dados eclesiásticos/i,
    });
    await user.click(saveEcclesiasticalButton);

    expect(useFeedbackStore.getState().current?.message).toMatch(
      /dados eclesiásticos atualizados com sucesso/i
    );
    expect(useFeedbackStore.getState().current?.severity).toBe('success');
  });

  it('allows saving missionary agency data for missionary and displays success notification', async () => {
    const user = userEvent.setup();
    render(<AccountSettingsView role="missionary" />);

    const saveAgencyButton = screen.getByRole('button', { name: /salvar agência missionária/i });
    await user.click(saveAgencyButton);

    expect(useFeedbackStore.getState().current?.message).toMatch(
      /dados da agência missionária atualizados com sucesso/i
    );
    expect(useFeedbackStore.getState().current?.severity).toBe('success');
  });

  it('handles soft delete confirmation modal for missionary', async () => {
    const user = userEvent.setup();
    render(<AccountSettingsView role="missionary" />);

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
    render(<AccountSettingsView role="supporter" />);

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
});
