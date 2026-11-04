import { screen, waitFor } from '@testing-library/react';
import { renderWithQuery } from '@/test/query';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { useMissionaryRegisterStore } from '@/stores/missionaryRegisterStore';
import MissionariesStep2 from './MissionariesStep2';
import { MissionaryRegisterWizardProvider } from '@/components/register/missionaries/MissionaryRegisterWizardContext';

vi.mock('@/services/catalog.service', () => ({
  listMissionaryAgencies: vi.fn().mockResolvedValue([{ id: 'agency-1', name: 'JOCUM' }]),
  listFaithCommunities: vi.fn().mockResolvedValue([{ id: 'church-1', name: 'Igreja Batista' }]),
}));

function renderStep() {
  return renderWithQuery(
    <MissionaryRegisterWizardProvider>
      <MissionariesStep2 />
    </MissionaryRegisterWizardProvider>
  );
}

describe('MissionariesStep2', () => {
  afterEach(() => useMissionaryRegisterStore.setState({ stepErrors: {} }));

  it('shows the errors the API sent back for this step and focuses them', async () => {
    useMissionaryRegisterStore.setState({
      stepErrors: { missionaryAgency: 'Agência missionária informada não existe' },
    });
    renderStep();

    const summary = await screen.findByRole('alert');
    expect(summary).toHaveFocus();
    expect(summary).toHaveTextContent(
      'Agência missionária: Agência missionária informada não existe'
    );
  });

  it('opens the agency modal from Não encontrei na lista and keeps the page behind it', async () => {
    const user = userEvent.setup();
    renderStep();

    await user.click(screen.getByLabelText(/agência missionária/i));
    await user.click(await screen.findByRole('option', { name: /não encontrei na lista/i }));

    expect(
      await screen.findByRole('heading', { name: /cadastrar agência missionária/i })
    ).toBeInTheDocument();
    expect(screen.getByText(/dados ministeriais/i)).toBeInTheDocument();
  });

  it('does not keep Não encontrei selected when the agency modal is cancelled empty', async () => {
    const user = userEvent.setup();
    renderStep();

    await user.click(screen.getByLabelText(/agência missionária/i));
    await user.click(await screen.findByRole('option', { name: /não encontrei na lista/i }));
    await user.click(await screen.findByRole('button', { name: /cancelar/i }));

    await waitFor(() => {
      expect(
        screen.queryByRole('heading', { name: /cadastrar agência missionária/i })
      ).not.toBeInTheDocument();
    });
    expect(screen.queryByRole('button', { name: /editar cadastro/i })).not.toBeInTheDocument();
  });

  it('opens the church modal from Não encontrei na lista', async () => {
    const user = userEvent.setup();
    renderStep();

    await user.click(screen.getByLabelText(/comunidade de fé/i));
    await user.click(await screen.findByRole('option', { name: /não encontrei na lista/i }));

    expect(
      await screen.findByRole('heading', { name: /cadastrar comunidade de fé/i })
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/nome do pastor/i)).toBeInTheDocument();
  });
});
