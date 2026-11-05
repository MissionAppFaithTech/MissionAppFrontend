import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { SELECT_OTHER } from '@/forms/register/options';
import { ApiError } from '@/lib/api/client';
import { searchCatalog } from '@/services/catalog.service';
import { renderWithQuery } from '@/test/query';
import CatalogAutocomplete from './CatalogAutocomplete';

vi.mock('@/services/catalog.service', () => ({ searchCatalog: vi.fn() }));

const agencies = [
  { id: 'a-1', name: 'Missão Ágape' },
  { id: 'a-2', name: 'Missões Unidas' },
];

type HarnessProps = {
  initialValue?: string;
  initialName?: string;
  onAddNew?: (name: string) => void;
  onEditOther?: () => void;
  otherSummary?: string;
  error?: string;
  onBlur?: () => void;
};

const changes = vi.fn();

/** The component's own result count (MUI 9 keeps an empty status of its own). */
const liveRegion = () => document.getElementById('agency-status');

function Harness({
  initialValue = '',
  initialName,
  onAddNew,
  onEditOther,
  otherSummary,
  error,
  onBlur,
}: HarnessProps) {
  const [value, setValue] = useState(initialValue);
  const [name, setName] = useState(initialName);
  return (
    <CatalogAutocomplete
      id="agency"
      label="Agência missionária"
      kind="missionaryAgencies"
      value={value}
      selectedName={name}
      onChange={(next, item) => {
        changes(next, item);
        setValue(next);
        setName(item?.name);
      }}
      onAddNew={onAddNew}
      onEditOther={onEditOther}
      otherSummary={otherSummary}
      required
      error={Boolean(error)}
      helperText={error}
      onBlur={onBlur}
    />
  );
}

describe('CatalogAutocomplete', () => {
  beforeEach(() => {
    changes.mockReset();
    vi.mocked(searchCatalog).mockReset();
    vi.mocked(searchCatalog).mockResolvedValue({ items: agencies, hasMore: false });
  });

  it('asks for two letters before searching', async () => {
    const user = userEvent.setup();
    renderWithQuery(<Harness onAddNew={vi.fn()} />);

    await user.click(screen.getByRole('combobox', { name: /Agência missionária/ }));

    expect(await screen.findByText('Digite ao menos 2 letras para buscar.')).toBeInTheDocument();
    expect(screen.getByRole('option', { name: /Adicionar Agência Missionária/ })).toBeVisible();
    expect(searchCatalog).not.toHaveBeenCalled();
  });

  it('searches the server once the user pauses and picks a result', async () => {
    const user = userEvent.setup();
    renderWithQuery(<Harness onAddNew={vi.fn()} />);

    await user.type(screen.getByRole('combobox', { name: /Agência missionária/ }), 'Missõ');

    expect(await screen.findByRole('option', { name: 'Missão Ágape' })).toBeInTheDocument();
    expect(searchCatalog).toHaveBeenCalledTimes(1);
    expect(searchCatalog).toHaveBeenCalledWith('missionaryAgencies', 'misso', expect.anything());
    expect(liveRegion()).toHaveTextContent('2 resultados encontrados.');

    await user.click(screen.getByRole('option', { name: 'Missões Unidas' }));

    expect(changes).toHaveBeenCalledWith('a-2', {
      type: 'item',
      id: 'a-2',
      name: 'Missões Unidas',
    });
    expect(screen.getByRole('combobox', { name: /Agência missionária/ })).toHaveValue(
      'Missões Unidas'
    );
  });

  it('does not search for the text of the item just picked', async () => {
    const user = userEvent.setup();
    renderWithQuery(<Harness />);

    await user.type(screen.getByRole('combobox', { name: /Agência missionária/ }), 'mi');
    await user.click(await screen.findByRole('option', { name: 'Missão Ágape' }));
    await new Promise((resolve) => setTimeout(resolve, 400));

    expect(searchCatalog).toHaveBeenCalledTimes(1);
  });

  it('picks with the keyboard', async () => {
    const user = userEvent.setup();
    renderWithQuery(<Harness />);

    await user.type(screen.getByRole('combobox', { name: /Agência missionária/ }), 'mi');
    await screen.findByRole('option', { name: 'Missão Ágape' });
    await user.keyboard('{ArrowDown}{Enter}');

    expect(changes).toHaveBeenCalledWith('a-1', expect.objectContaining({ id: 'a-1' }));
  });

  it('highlights "+ Adicionar" when nothing matches and passes on the typed name', async () => {
    vi.mocked(searchCatalog).mockResolvedValue({ items: [], hasMore: false });
    const onAddNew = vi.fn();
    const user = userEvent.setup();
    renderWithQuery(<Harness onAddNew={onAddNew} />);

    await user.type(
      screen.getByRole('combobox', { name: /Agência missionária/ }),
      '  Missão Nova  '
    );

    expect(
      await screen.findByRole('option', { name: 'Nenhuma agência missionária encontrada.' })
    ).toHaveAttribute('aria-disabled', 'true');
    expect(liveRegion()).toHaveTextContent('Nenhuma agência missionária encontrada.');
    expect(screen.getByRole('option', { name: /Adicionar Agência Missionária/ })).toHaveStyle({
      fontWeight: '700',
    });
    await user.click(screen.getByRole('option', { name: /Adicionar Agência Missionária/ }));

    expect(onAddNew).toHaveBeenCalledWith('Missão Nova');
    expect(changes).not.toHaveBeenCalled();
    // The typed name stays (MUI would write the option label over it).
    expect(screen.getByRole('combobox', { name: /Agência missionária/ })).toHaveValue(
      '  Missão Nova  '
    );
  });

  it('hides "+ Adicionar" without onAddNew', async () => {
    const user = userEvent.setup();
    renderWithQuery(<Harness />);

    await user.type(screen.getByRole('combobox', { name: /Agência missionária/ }), 'mi');
    await screen.findByRole('option', { name: 'Missão Ágape' });

    expect(screen.queryByRole('option', { name: /Adicionar/ })).not.toBeInTheDocument();
  });

  it('asks to keep typing when the server has more results', async () => {
    vi.mocked(searchCatalog).mockResolvedValue({ items: agencies, hasMore: true });
    const user = userEvent.setup();
    renderWithQuery(<Harness />);

    await user.type(screen.getByRole('combobox', { name: /Agência missionária/ }), 'mi');

    expect(
      await screen.findByText('Continue digitando para encontrar outros resultados.')
    ).toBeInTheDocument();
  });

  it('shows a failed search and retries it', async () => {
    vi.mocked(searchCatalog).mockRejectedValueOnce(
      new ApiError('Muitas buscas seguidas. Aguarde alguns segundos e tente de novo.', 429)
    );
    const user = userEvent.setup();
    renderWithQuery(<Harness />);

    await user.type(screen.getByRole('combobox', { name: /Agência missionária/ }), 'jo');

    expect(
      await screen.findByText('Muitas buscas seguidas. Aguarde alguns segundos e tente de novo.')
    ).toBeInTheDocument();
    await user.click(screen.getByRole('option', { name: 'Tentar novamente' }));

    // Same term, list still open with the new results.
    expect(await screen.findByRole('option', { name: 'Missão Ágape' })).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: /Agência missionária/ })).toHaveValue('jo');
    expect(searchCatalog).toHaveBeenCalledTimes(2);
    expect(changes).not.toHaveBeenCalled();
  });

  it('shows the saved name without loading the catalog and clears it', async () => {
    const user = userEvent.setup();
    renderWithQuery(<Harness initialValue="a-9" initialName="JOCUM Brasil" />);

    const input = screen.getByRole('combobox', { name: /Agência missionária/ });
    expect(input).toHaveValue('JOCUM Brasil');
    expect(searchCatalog).not.toHaveBeenCalled();

    await user.click(input);
    await user.click(screen.getByRole('button', { name: 'Limpar' }));

    expect(changes).toHaveBeenCalledWith('', undefined);
    expect(input).toHaveValue('');
  });

  it('links the error to the input', () => {
    renderWithQuery(<Harness error="Selecione a agência missionária." />);

    const input = screen.getByRole('combobox', { name: /Agência missionária/ });
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input).toHaveAccessibleDescription(/Selecione a agência missionária\./);
  });

  it('offers to edit a new item being registered', async () => {
    const onEditOther = vi.fn();
    const user = userEvent.setup();
    renderWithQuery(
      <Harness initialValue={SELECT_OTHER} otherSummary="Missão Nova" onEditOther={onEditOther} />
    );

    await user.click(screen.getByRole('button', { name: 'Editar cadastro de Missão Nova' }));

    expect(onEditOther).toHaveBeenCalledTimes(1);
  });

  it('does not search again for text that only differs in accents or case', async () => {
    const user = userEvent.setup();
    renderWithQuery(<Harness />);
    const input = screen.getByRole('combobox', { name: /Agência missionária/ });

    await user.type(input, 'missao');
    await screen.findByRole('option', { name: 'Missão Ágape' });
    await user.clear(input);
    await user.type(input, 'MISSÃO');

    await waitFor(() =>
      expect(within(screen.getByRole('listbox')).getByText('Missão Ágape')).toBeInTheDocument()
    );
    expect(searchCatalog).toHaveBeenCalledTimes(1);
  });
});
