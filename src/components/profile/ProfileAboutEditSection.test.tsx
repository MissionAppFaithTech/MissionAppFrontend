import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useRouter } from 'next/navigation';
import ProfileAboutEditSection, {
  buildSaveAboutInput,
} from '@/components/profile/ProfileAboutEditSection';
import { ApiError } from '@/lib/api/client';
import type { ProfileAboutFormData } from '@/schemas/profile.schema';
import { createFaithCommunity, createMissionaryAgency } from '@/services/catalog.service';
import { renderWithQuery } from '@/test/query';
import type { ProfileAboutData } from '@/types/profile';

vi.mock('@/services/catalog.service', async () => {
  const { normalizeCatalogTerm } = await import('@/lib/catalog/search');
  const catalogs: Record<string, Array<{ id: string; name: string }>> = {
    missionaryAgencies: [
      { id: 'ma-1', name: 'JOCUM' },
      { id: 'ma-2', name: 'Missão do Interior' },
    ],
    faithCommunities: [
      { id: 'fc-1', name: 'Igreja Batista Central' },
      { id: 'fc-2', name: 'Igreja Presbiteriana' },
    ],
  };
  return {
    searchCatalog: vi.fn(async (kind: string, term: string) => ({
      items: catalogs[kind].filter((item) => normalizeCatalogTerm(item.name).includes(term)),
      hasMore: false,
    })),
    createMissionaryAgency: vi.fn(),
    createFaithCommunity: vi.fn(),
  };
});

const data: ProfileAboutData = {
  introduction: 'Sirvo no sertão há 10 anos.',
  missionHistory: 'Comecei em 2015.',
  originLocation: 'Recife - Brasil',
  currentLocation: 'Juazeiro - BA - Brasil',
  missionaryAgency: 'JOCUM',
  missionaryAgencyId: 'ma-1',
  faithCommunity: 'Igreja Batista Central',
  faithCommunityId: 'fc-1',
  prayerRequests: 'Saúde da família.',
  lifeVerse: 'Filipenses 4:13',
  workAddress: {
    country: 'Brasil',
    state: 'BA',
    city: 'Juazeiro',
    district: 'Centro',
    zip: '48900-000',
  },
};

const onSave = vi.fn();
const onDone = vi.fn();
const onCancel = vi.fn();
const onDiscard = vi.fn();

function renderSection(about: ProfileAboutData = data) {
  return renderWithQuery(
    <ProfileAboutEditSection
      data={about}
      onSave={onSave}
      onDone={onDone}
      onCancel={onCancel}
      backHref="/profile/sobre"
      onDiscard={onDiscard}
    />
  );
}

describe('ProfileAboutEditSection', () => {
  beforeEach(() => {
    onSave.mockReset();
    onDone.mockReset();
    onCancel.mockReset();
    onDiscard.mockReset();
    vi.mocked(useRouter().push).mockClear();
  });

  it('offers "Voltar" at the top and next to the actions, as plain links when nothing changed', () => {
    renderSection();

    const back = screen.getAllByRole('link', { name: 'Voltar para o perfil' });
    expect(back).toHaveLength(2);
    for (const link of back) expect(link).toHaveAttribute('href', '/profile/sobre');
  });

  it('"Voltar" with unsaved changes asks first; "Continuar editando" keeps the text', async () => {
    const user = userEvent.setup();
    renderSection();

    await user.type(screen.getByLabelText(/versículo para a vida/i), ' extra');
    await user.click(screen.getAllByRole('button', { name: 'Voltar para o perfil' })[0]);

    const dialog = screen.getByRole('dialog', { name: 'Descartar alterações não salvas?' });
    await user.click(within(dialog).getByRole('button', { name: 'Continuar editando' }));

    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(screen.getByLabelText(/versículo para a vida/i)).toHaveValue(`${data.lifeVerse} extra`);
    expect(onDiscard).not.toHaveBeenCalled();
    expect(useRouter().push).not.toHaveBeenCalled();
  });

  it('"Descartar e voltar" announces the discard and goes to the profile without saving', async () => {
    const user = userEvent.setup();
    renderSection();

    await user.type(screen.getByLabelText(/versículo para a vida/i), ' extra');
    const back = screen.getAllByRole('button', { name: 'Voltar para o perfil' });
    await user.click(back[back.length - 1]);
    await user.click(screen.getByRole('button', { name: 'Descartar e voltar' }));

    expect(onDiscard).toHaveBeenCalledTimes(1);
    expect(useRouter().push).toHaveBeenCalledWith('/profile/sobre');
    expect(onSave).not.toHaveBeenCalled();
  });

  it('renders every editable field of RF 10.7.2 grouped in labelled fieldsets', () => {
    renderSection();

    expect(screen.getByRole('heading', { name: /editar sobre/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/^biografia/i)).toHaveValue(data.introduction);
    expect(screen.getByLabelText(/resumo da minha história em missões/i)).toHaveValue(
      data.missionHistory
    );
    expect(screen.getByLabelText(/cidade e país de origem/i)).toHaveValue(data.originLocation);
    expect(screen.getByLabelText(/pedidos de oração/i)).toHaveValue(data.prayerRequests);
    expect(screen.getByLabelText(/versículo para a vida/i)).toHaveValue(data.lifeVerse);
    expect(screen.getByLabelText(/^cidade$/i)).toHaveValue('Juazeiro');
    expect(screen.getByLabelText(/cep ou código postal/i)).toHaveValue('48900-000');
    expect(screen.getByRole('group', { name: /local de atuação atual/i })).toBeInTheDocument();
    expect(screen.getByRole('group', { name: /agência e comunidade de fé/i })).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: /agência missionária/i })).toHaveValue('JOCUM');
    expect(screen.getByRole('combobox', { name: /comunidade de fé/i })).toHaveValue(
      'Igreja Batista Central'
    );
  });

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

  it('sends the new agency and an unlinked community in the same save', async () => {
    onSave.mockResolvedValue(undefined);
    renderSection();

    const user = await choose(/agência missionária/i, 'interior', 'Missão do Interior');
    await user.click(screen.getByRole('combobox', { name: /comunidade de fé/i }));
    await user.click(screen.getByRole('button', { name: 'Limpar' }));
    await user.click(screen.getByRole('button', { name: /^salvar/i }));

    await waitFor(() => expect(onSave).toHaveBeenCalledTimes(1));
    expect(onSave).toHaveBeenCalledWith({
      about: { missionaryAgencyId: 'ma-2', faithCommunityId: null },
      workAddress: undefined,
    });
  });

  it('shows an agency the API rejected on its select', async () => {
    onSave.mockRejectedValue(
      new ApiError('Revise os campos', 422, { missionaryAgencyId: 'Agência inexistente.' })
    );
    renderSection();

    const user = await choose(/agência missionária/i, 'missao', 'Missão do Interior');
    await user.click(screen.getByRole('button', { name: /^salvar/i }));

    expect(await screen.findByText('Agência inexistente.')).toBeInTheDocument();
    const field = screen.getByRole('combobox', { name: /agência missionária/i });
    expect(field).toHaveAttribute('aria-invalid', 'true');
    expect(field).toHaveAccessibleDescription(/Agência inexistente\./);
  });

  it('registers a missing agency in the modal and selects it, unsaved until "Salvar"', async () => {
    vi.mocked(createMissionaryAgency).mockResolvedValueOnce({ id: 'ma-9', name: 'Missão Nova' });
    onSave.mockResolvedValue(undefined);
    renderSection();

    const user = await choose(/agência missionária/i, 'Missão Nova', /adicionar agência/i);
    const dialog = await screen.findByRole('dialog');
    expect(within(dialog).getByRole('textbox', { name: /^nome$/i })).toHaveValue('Missão Nova');
    await user.type(within(dialog).getByRole('textbox', { name: /^país/i }), 'Brasil');
    await user.type(within(dialog).getByRole('textbox', { name: /^estado/i }), 'BA');
    await user.type(within(dialog).getByRole('textbox', { name: /^cidade/i }), 'Juazeiro');
    await user.type(within(dialog).getByRole('textbox', { name: /^telefone$/i }), '74987654321');
    await user.click(within(dialog).getByRole('button', { name: /^salvar$/i }));

    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(screen.getByRole('combobox', { name: /agência missionária/i })).toHaveValue(
      'Missão Nova'
    );
    expect(onSave).not.toHaveBeenCalled();

    await user.click(screen.getByRole('button', { name: /^salvar/i }));
    await waitFor(() =>
      expect(onSave).toHaveBeenCalledWith(
        expect.objectContaining({ about: expect.objectContaining({ missionaryAgencyId: 'ma-9' }) })
      )
    );
  });

  it('keeps the community modal open with the API error on its field', async () => {
    vi.mocked(createFaithCommunity).mockRejectedValueOnce(
      new ApiError('Revise os campos', 422, { pastorPhone: 'Telefone do pastor inválido.' })
    );
    renderSection();

    const user = await choose(/comunidade de fé/i, 'Igreja Nova', /adicionar comunidade/i);
    const dialog = await screen.findByRole('dialog');
    await user.type(within(dialog).getByRole('textbox', { name: /^país/i }), 'Brasil');
    await user.type(within(dialog).getByRole('textbox', { name: /^estado/i }), 'BA');
    await user.type(within(dialog).getByRole('textbox', { name: /^cidade/i }), 'Juazeiro');
    await user.type(within(dialog).getByRole('textbox', { name: /nome do pastor/i }), 'Pr. Ana');
    for (const phone of [/^telefone da igreja/i, /^telefone do pastor/i]) {
      await user.type(within(dialog).getByRole('textbox', { name: phone }), '74987654321');
    }
    await user.click(within(dialog).getByRole('button', { name: /^salvar$/i }));

    const pastorPhone = within(dialog).getByRole('textbox', { name: /^telefone do pastor/i });
    await waitFor(() => expect(pastorPhone).toHaveAttribute('aria-invalid', 'true'));
    expect(pastorPhone).toHaveAccessibleDescription(/Telefone do pastor inválido\./);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('maps nested work address errors of the about endpoint to the inputs', async () => {
    const user = userEvent.setup();
    onSave.mockRejectedValue(
      new ApiError('Revise os campos', 422, { 'workAddress.zip': 'CEP inválido.' })
    );
    renderSection();

    const zip = screen.getByLabelText(/cep ou código postal/i);
    await user.clear(zip);
    await user.type(zip, '1');
    await user.click(screen.getByRole('button', { name: /salvar/i }));

    expect(await screen.findByText('CEP inválido.')).toBeInTheDocument();
    expect(zip).toHaveAttribute('aria-invalid', 'true');
  });

  it('saves only the changed fields once and reports success', async () => {
    const user = userEvent.setup();
    onSave.mockResolvedValue(undefined);
    renderSection();

    const verse = screen.getByLabelText(/versículo para a vida/i);
    await user.clear(verse);
    await user.type(verse, 'Salmos 23');
    await user.click(screen.getByRole('button', { name: /salvar/i }));

    await waitFor(() => expect(onDone).toHaveBeenCalledWith(true));
    expect(onSave).toHaveBeenCalledTimes(1);
    expect(onSave).toHaveBeenCalledWith({
      about: { lifeVerse: 'Salmos 23' },
      workAddress: undefined,
    });
  });

  it('sends null for an emptied field so the backend clears it', async () => {
    const user = userEvent.setup();
    onSave.mockResolvedValue(undefined);
    renderSection();

    await user.clear(screen.getByLabelText(/pedidos de oração/i));
    await user.click(screen.getByRole('button', { name: /salvar/i }));

    await waitFor(() => expect(onSave).toHaveBeenCalled());
    expect(onSave.mock.calls[0][0].about).toEqual({ prayerRequest: null });
  });

  it('requires every work address field once one is filled', async () => {
    const user = userEvent.setup();
    renderSection({ ...data, workAddress: null, currentLocation: '' });

    await user.type(screen.getByLabelText(/^cidade$/i), 'Lisboa');
    await user.click(screen.getByRole('button', { name: /salvar/i }));

    expect(await screen.findAllByText(/preencha para salvar o local de atuação/i)).toHaveLength(4);
    await waitFor(() => expect(screen.getByLabelText(/^país$/i)).toHaveFocus());
    expect(onSave).not.toHaveBeenCalled();
  });

  it('focuses cidade when it is the only empty work address field', async () => {
    const user = userEvent.setup();
    renderSection();

    const city = screen.getByLabelText(/^cidade$/i);
    await user.clear(city);
    await user.click(screen.getByRole('button', { name: /salvar/i }));

    expect(await screen.findByText(/preencha para salvar o local de atuação/i)).toBeInTheDocument();
    expect(city).toHaveAttribute('aria-invalid', 'true');
    await waitFor(() => expect(city).toHaveFocus());
    expect(onSave).not.toHaveBeenCalled();
  });

  it('explains that a saved work address cannot be removed instead of silently ignoring it', async () => {
    const user = userEvent.setup();
    renderSection();

    for (const label of [
      /^país$/i,
      /estado ou província/i,
      /^cidade$/i,
      /^bairro$/i,
      /cep ou código postal/i,
    ]) {
      await user.clear(screen.getByLabelText(label));
    }
    await user.click(screen.getByRole('button', { name: /salvar/i }));

    expect(
      await screen.findByText(/o local de atuação não pode ser removido/i)
    ).toBeInTheDocument();
    await waitFor(() => expect(screen.getByLabelText(/^país$/i)).toHaveFocus());
    expect(onSave).not.toHaveBeenCalled();
    expect(onDone).not.toHaveBeenCalled();
  });

  it('upserts the full work address when it changes', async () => {
    const user = userEvent.setup();
    onSave.mockResolvedValue(undefined);
    renderSection();

    const city = screen.getByLabelText(/^cidade$/i);
    await user.clear(city);
    await user.type(city, 'Petrolina');
    await user.click(screen.getByRole('button', { name: /salvar/i }));

    await waitFor(() => expect(onSave).toHaveBeenCalled());
    expect(onSave.mock.calls[0][0]).toEqual({
      about: undefined,
      workAddress: { ...data.workAddress, city: 'Petrolina' },
    });
  });

  it('finishes without saving when nothing changed', async () => {
    const user = userEvent.setup();
    renderSection();

    await user.click(screen.getByRole('button', { name: /salvar/i }));

    await waitFor(() => expect(onDone).toHaveBeenCalledWith(false));
    expect(onSave).not.toHaveBeenCalled();
  });

  it('keeps the form open and shows the error when the API rejects the save', async () => {
    const user = userEvent.setup();
    onSave.mockRejectedValue(new ApiError('Não foi possível salvar o Sobre', 502));
    renderSection();

    await user.type(screen.getByLabelText(/versículo para a vida/i), '!');
    await user.click(screen.getByRole('button', { name: /salvar/i }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Não foi possível salvar o Sobre');
    expect(onDone).not.toHaveBeenCalled();
  });

  it('maps backend field errors onto the matching inputs', async () => {
    const user = userEvent.setup();
    onSave.mockRejectedValue(
      new ApiError('Revise os campos', 422, { lifeVerse: 'Use no máximo 255 caracteres.' })
    );
    renderSection();

    const verse = screen.getByLabelText(/versículo para a vida/i);
    await user.type(verse, '!');
    await user.click(screen.getByRole('button', { name: /salvar/i }));

    expect(await screen.findByText('Use no máximo 255 caracteres.')).toBeInTheDocument();
    expect(verse).toHaveAttribute('aria-invalid', 'true');
  });

  it('cancels without saving', async () => {
    const user = userEvent.setup();
    renderSection();

    await user.click(screen.getByRole('button', { name: /cancelar/i }));

    expect(onCancel).toHaveBeenCalled();
    expect(onSave).not.toHaveBeenCalled();
  });
});

describe('buildSaveAboutInput', () => {
  const values: ProfileAboutFormData = {
    introduction: 'Nova bio',
    missionHistory: '',
    originLocation: 'Recife',
    prayerRequests: '',
    lifeVerse: 'Salmos 23',
    missionaryAgencyId: 'ma-2',
    faithCommunityId: '',
    workAddress: { country: 'Brasil', state: 'PE', city: 'Recife', district: '', zip: '' },
  };

  it('skips an incomplete work address and maps only dirty text fields', () => {
    expect(
      buildSaveAboutInput(values, { introduction: true, missionHistory: true, workAddress: {} })
    ).toEqual({
      about: { aboutMe: 'Nova bio', missionStorySummary: null },
      workAddress: undefined,
    });
  });

  it('sends a changed agency and turns an emptied community into null', () => {
    expect(
      buildSaveAboutInput(values, { missionaryAgencyId: true, faithCommunityId: true })
    ).toEqual({
      about: { missionaryAgencyId: 'ma-2', faithCommunityId: null },
      workAddress: undefined,
    });
  });

  it('never sends an empty agency (it cannot be removed)', () => {
    expect(
      buildSaveAboutInput({ ...values, missionaryAgencyId: '' }, { missionaryAgencyId: true })
    ).toEqual({ about: undefined, workAddress: undefined });
  });

  it('returns nothing to save when no field is dirty', () => {
    expect(buildSaveAboutInput(values, {})).toEqual({ about: undefined, workAddress: undefined });
  });
});
