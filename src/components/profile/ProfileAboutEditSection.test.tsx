import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, it, expect, vi } from 'vitest';
import ProfileAboutEditSection from './ProfileAboutEditSection';
import type { ProfileAboutData } from '@/types/profile';
import { updateMissionaryAbout } from '@/services/missionary.service';
import { updateAccountProfile } from '@/services/profile.service';

vi.mock('@/services/missionary.service', async () => {
  const actual = await vi.importActual<typeof import('@/services/missionary.service')>(
    '@/services/missionary.service'
  );
  return {
    ...actual,
    updateMissionaryAbout: vi.fn(),
  };
});

vi.mock('@/services/profile.service', async () => {
  const actual = await vi.importActual<typeof import('@/services/profile.service')>(
    '@/services/profile.service'
  );
  return {
    ...actual,
    updateAccountProfile: vi.fn().mockResolvedValue(undefined),
    updateMissionaryAboutData: vi.fn().mockResolvedValue(undefined),
  };
});

vi.mock('@/services/catalog.service', () => ({
  listFaithCommunities: vi
    .fn()
    .mockResolvedValue([{ id: '018f1111-2222-7333-8444-555555555555', name: 'Igreja Batista' }]),
}));

const mockedUpdate = vi.mocked(updateMissionaryAbout);
const mockedUpdateAccountProfile = vi.mocked(updateAccountProfile);

const missionaryId = '018f1a2b-3c4d-7e8f-9a0b-1c2d3e4f5a6b';

const mockData: ProfileAboutData = {
  introduction: 'Minha introdução inicial',
  missionHistory: 'História em missões',
  originLocation: 'São Paulo - Brasil',
  currentLocation: 'Cidade do Cabo - África do Sul',
  missionaryAgency: 'JOCUM (Jovens com uma Missão)',
  faithCommunity: '018f1111-2222-7333-8444-555555555555',
  prayerRequests: 'Orem pela saúde',
  lifeVerse: 'Filipenses 4:13',
};

describe('ProfileAboutEditSection', () => {
  beforeEach(() => {
    mockedUpdate.mockReset();
    mockedUpdate.mockResolvedValue({ id: missionaryId });
    mockedUpdateAccountProfile.mockReset();
    mockedUpdateAccountProfile.mockResolvedValue(undefined);
  });

  it('renders all fields with initial data', () => {
    render(
      <ProfileAboutEditSection missionaryId={missionaryId} data={mockData} onBack={vi.fn()} />
    );

    expect(screen.queryByLabelText(/biografia curta/i)).not.toBeInTheDocument();
    expect(screen.getByLabelText(/sobre mim:/i)).toHaveValue('Minha introdução inicial');
    expect(screen.getByLabelText(/resumo da minha história em missões:/i)).toHaveValue(
      'História em missões'
    );
    expect(screen.getByLabelText(/pedidos de oração:/i)).toHaveValue('Orem pela saúde');
    expect(screen.getByLabelText(/versículo para a vida:/i)).toHaveValue('Filipenses 4:13');
    expect(screen.queryByLabelText(/local de origem/i)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/local de atuação atual/i)).not.toBeInTheDocument();
  });

  it('calls onBack when Voltar button is clicked', async () => {
    const user = userEvent.setup();
    const handleBack = vi.fn();

    render(
      <ProfileAboutEditSection missionaryId={missionaryId} data={mockData} onBack={handleBack} />
    );

    await user.click(screen.getByRole('button', { name: /voltar/i }));
    expect(handleBack).toHaveBeenCalledTimes(1);
  });

  it('saves about section and shows success feedback toast', async () => {
    const user = userEvent.setup();
    const handleBack = vi.fn();
    const handleSave = vi.fn();

    render(
      <ProfileAboutEditSection
        missionaryId={missionaryId}
        data={mockData}
        onBack={handleBack}
        onSave={handleSave}
      />
    );

    const introInput = screen.getByLabelText(/sobre mim:/i);
    await user.clear(introInput);
    await user.type(introInput, 'Nova introdução');

    await user.click(screen.getByRole('button', { name: /salvar/i }));

    await waitFor(() => {
      expect(mockedUpdate).toHaveBeenCalledWith(
        missionaryId,
        expect.objectContaining({
          aboutMe: 'Nova introdução',
          missionStorySummary: 'História em missões',
          prayerRequest: 'Orem pela saúde',
          lifeVerse: 'Filipenses 4:13',
        })
      );
    });

    expect(
      await screen.findByText(/informações da seção sobre salvas com sucesso!/i)
    ).toBeInTheDocument();
    expect(handleSave).toHaveBeenCalledWith(
      expect.objectContaining({
        introduction: 'Nova introdução',
      })
    );
  });

  it('keeps the form open and shows an error when the API rejects the save', async () => {
    const user = userEvent.setup();
    const handleBack = vi.fn();
    mockedUpdate.mockRejectedValueOnce(new Error('Faça login para editar o sobre'));

    render(
      <ProfileAboutEditSection missionaryId={missionaryId} data={mockData} onBack={handleBack} />
    );

    await user.click(screen.getByRole('button', { name: /salvar/i }));

    expect(await screen.findByRole('alert')).toHaveTextContent(/faça login para editar o sobre/i);
    expect(handleBack).not.toHaveBeenCalled();
  });
});
