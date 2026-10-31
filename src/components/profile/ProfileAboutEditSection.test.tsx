import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import ProfileAboutEditSection, {
  buildSaveAboutInput,
} from '@/components/profile/ProfileAboutEditSection';
import { ApiError } from '@/lib/api/client';
import type { ProfileAboutFormData } from '@/schemas/profile.schema';
import type { ProfileAboutData } from '@/types/profile';

const data: ProfileAboutData = {
  introduction: 'Sirvo no sertão há 10 anos.',
  missionHistory: 'Comecei em 2015.',
  originLocation: 'Recife - Brasil',
  currentLocation: 'Juazeiro - BA - Brasil',
  missionaryAgency: 'JOCUM',
  faithCommunity: 'Igreja Batista Central',
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

function renderSection(about: ProfileAboutData = data) {
  return render(
    <ProfileAboutEditSection data={about} onSave={onSave} onDone={onDone} onCancel={onCancel} />
  );
}

describe('ProfileAboutEditSection', () => {
  beforeEach(() => {
    onSave.mockReset();
    onDone.mockReset();
    onCancel.mockReset();
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
    // Agency and faith community are not edited here (RF 10.7.2).
    expect(screen.queryByLabelText(/agência missionária/i)).not.toBeInTheDocument();
    expect(screen.queryByRole('combobox')).not.toBeInTheDocument();
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
    expect(screen.getByLabelText(/^país$/i)).toHaveFocus();
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

  it('returns nothing to save when no field is dirty', () => {
    expect(buildSaveAboutInput(values, {})).toEqual({ about: undefined, workAddress: undefined });
  });
});
