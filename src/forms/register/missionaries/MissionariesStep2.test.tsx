import { screen, waitFor } from '@testing-library/react';
import { renderWithQuery } from '@/test/query';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { searchCatalog } from '@/services/catalog.service';
import { useMissionaryRegisterStore } from '@/stores/missionaryRegisterStore';
import MissionariesStep2 from './MissionariesStep2';
import { MissionaryRegisterWizardProvider } from '@/components/register/missionaries/MissionaryRegisterWizardContext';

vi.mock('@/services/catalog.service', () => ({
  searchCatalog: vi.fn(async (kind: string) => ({
    items:
      kind === 'missionaryAgencies'
        ? [{ id: 'agency-1', name: 'JOCUM' }]
        : [{ id: 'church-1', name: 'Igreja Batista' }],
    hasMore: false,
  })),
}));

const agencyField = () => screen.getByRole('combobox', { name: /agência missionária/i });
const communityField = () => screen.getByRole('combobox', { name: /comunidade de fé/i });

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

  it('searches the agency on the server and keeps the picked id and name', async () => {
    const user = userEvent.setup();
    renderStep();

    await user.type(agencyField(), 'jo');
    await user.click(await screen.findByRole('option', { name: 'JOCUM' }));

    expect(searchCatalog).toHaveBeenCalledWith('missionaryAgencies', 'jo', expect.anything());
    expect(agencyField()).toHaveValue('JOCUM');
  });

  it('opens the agency modal from "+ Adicionar" with the typed name and keeps the page behind it', async () => {
    const user = userEvent.setup();
    renderStep();

    await user.type(agencyField(), 'Missão Nova');
    await user.click(await screen.findByRole('option', { name: /adicionar agência missionária/i }));

    expect(
      await screen.findByRole('heading', { name: /cadastrar agência missionária/i })
    ).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: /^nome/i })).toHaveValue('Missão Nova');
    expect(screen.getByText(/dados ministeriais/i)).toBeInTheDocument();
  });

  it('does not keep a new agency when the modal is cancelled empty', async () => {
    const user = userEvent.setup();
    renderStep();

    await user.click(agencyField());
    await user.click(await screen.findByRole('option', { name: /adicionar agência missionária/i }));
    await user.click(await screen.findByRole('button', { name: /cancelar/i }));

    await waitFor(() => {
      expect(
        screen.queryByRole('heading', { name: /cadastrar agência missionária/i })
      ).not.toBeInTheDocument();
    });
    expect(screen.queryByRole('button', { name: /editar cadastro/i })).not.toBeInTheDocument();
    // Opening the modal is not leaving the field: no error appears behind it.
    expect(agencyField()).not.toHaveAttribute('aria-invalid', 'true');
  });

  it('checks a field already in error again after the modal is cancelled', async () => {
    const user = userEvent.setup();
    renderStep();

    await user.click(communityField());
    await user.tab();
    await waitFor(() => expect(communityField()).toHaveAttribute('aria-invalid', 'true'));
    await user.click(communityField());
    await user.click(await screen.findByRole('option', { name: /adicionar comunidade de fé/i }));
    await user.click(await screen.findByRole('button', { name: /cancelar/i }));

    // Red always comes with its message (never color alone).
    await waitFor(() => expect(communityField()).toHaveAttribute('aria-invalid', 'true'));
    expect(communityField()).toHaveAccessibleDescription(/\S/);
  });

  it('opens the church modal from "+ Adicionar"', async () => {
    const user = userEvent.setup();
    renderStep();

    await user.click(communityField());
    await user.click(await screen.findByRole('option', { name: /adicionar comunidade de fé/i }));

    expect(
      await screen.findByRole('heading', { name: /cadastrar comunidade de fé/i })
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/nome do pastor/i)).toBeInTheDocument();
  });
});
