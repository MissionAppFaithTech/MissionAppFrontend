import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import ProfileAboutEditSection from './ProfileAboutEditSection';
import type { ProfileAboutData } from '@/types/profile';

const mockData: ProfileAboutData = {
  introduction: 'Minha introdução inicial',
  missionHistory: 'História em missões',
  originLocation: 'São Paulo - Brasil',
  currentLocation: 'Cidade do Cabo - África do Sul',
  missionaryAgency: 'JOCUM (Jovens com uma Missão)',
  faithCommunity: 'Igreja Batista',
  prayerRequests: 'Orem pela saúde',
  lifeVerse: 'Filipenses 4:13',
};

describe('ProfileAboutEditSection', () => {
  it('renders all fields with initial data', () => {
    render(<ProfileAboutEditSection data={mockData} onBack={vi.fn()} />);

    expect(screen.getByLabelText(/sobre mim:/i)).toHaveValue('Minha introdução inicial');
    expect(screen.getByLabelText(/resumo da minha história em missões:/i)).toHaveValue(
      'História em missões'
    );
    expect(screen.getByLabelText(/pedidos de oração:/i)).toHaveValue('Orem pela saúde');
    expect(screen.getByLabelText(/versículo para a vida:/i)).toHaveValue('Filipenses 4:13');
  });

  it('calls onBack when Voltar button is clicked', async () => {
    const user = userEvent.setup();
    const handleBack = vi.fn();

    render(<ProfileAboutEditSection data={mockData} onBack={handleBack} />);

    await user.click(screen.getByRole('button', { name: /voltar/i }));
    expect(handleBack).toHaveBeenCalledTimes(1);
  });

  it('submits form with updated values and calls onSave and onBack', async () => {
    const user = userEvent.setup();
    const handleBack = vi.fn();
    const handleSave = vi.fn();

    render(<ProfileAboutEditSection data={mockData} onBack={handleBack} onSave={handleSave} />);

    const introInput = screen.getByLabelText(/sobre mim:/i);
    await user.clear(introInput);
    await user.type(introInput, 'Nova introdução');

    const saveButton = screen.getByRole('button', { name: /salvar/i });
    await user.click(saveButton);

    expect(handleSave).toHaveBeenCalledWith(
      expect.objectContaining({
        introduction: 'Nova introdução',
      })
    );
    expect(handleBack).toHaveBeenCalledTimes(1);
  });
});
