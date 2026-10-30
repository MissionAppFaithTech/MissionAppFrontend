import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import ProfileAboutSection from './ProfileAboutSection';
import type { ProfileAboutData } from '@/types/profile';

describe('ProfileAboutSection', () => {
  const emptyAboutData: ProfileAboutData = {
    introduction: '',
    missionHistory: '',
    originLocation: '',
    currentLocation: '',
    missionaryAgency: '',
    faithCommunity: '',
    prayerRequests: '',
    lifeVerse: '',
  };

  const populatedAboutData: ProfileAboutData = {
    introduction: 'Olá, sou missionário há 5 anos.',
    missionHistory: 'Iniciei meu chamado em comunidades rurais.',
    originLocation: 'Belo Horizonte/MG',
    currentLocation: 'Santarém/PA',
    missionaryAgency: 'JOCUM',
    faithCommunity: 'Igreja Batista Esperança',
    prayerRequests: 'Pela saúde da equipe e viagens missionárias.',
    lifeVerse: 'Romanos 8:28',
  };

  it('renders inviting empty state when all about fields and biography are empty', async () => {
    const handleEdit = vi.fn();
    render(<ProfileAboutSection data={emptyAboutData} onEditAction={handleEdit} />);

    expect(screen.getByRole('heading', { level: 6, name: 'Sobre' })).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { level: 2, name: /compartilhe sua história em missões/i })
    ).toBeInTheDocument();
    expect(
      screen.getByText(/seus dados de apresentação, histórico missionário/i)
    ).toBeInTheDocument();

    const ctaButton = screen.getByRole('button', { name: /preencher informações do sobre/i });
    expect(ctaButton).toBeInTheDocument();

    const user = userEvent.setup();
    await user.click(ctaButton);
    expect(handleEdit).toHaveBeenCalledTimes(1);
  });

  it('triggers onEditAction when clicking the header edit button', async () => {
    const handleEdit = vi.fn();
    render(<ProfileAboutSection data={emptyAboutData} onEditAction={handleEdit} />);

    const headerEditBtn = screen.getByRole('button', { name: /editar informações do sobre/i });
    const user = userEvent.setup();
    await user.click(headerEditBtn);
    expect(handleEdit).toHaveBeenCalledTimes(1);
  });

  it('renders populated content without biography repetition', () => {
    const handleEdit = vi.fn();
    render(<ProfileAboutSection data={populatedAboutData} onEditAction={handleEdit} />);

    expect(
      screen.queryByRole('heading', { level: 2, name: /compartilhe sua história em missões/i })
    ).not.toBeInTheDocument();
    expect(screen.queryByText('Biografia / Atuação')).not.toBeInTheDocument();
    expect(screen.getByText('Olá, sou missionário há 5 anos.')).toBeInTheDocument();
    expect(screen.getByText('Iniciei meu chamado em comunidades rurais.')).toBeInTheDocument();
    expect(screen.queryByText(/local de origem/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/local de atuação atual/i)).not.toBeInTheDocument();
    expect(screen.getByText('JOCUM')).toBeInTheDocument();
    expect(screen.getByText('Igreja Batista Esperança')).toBeInTheDocument();
    expect(screen.getByText('Pela saúde da equipe e viagens missionárias.')).toBeInTheDocument();
    expect(screen.getByText('Romanos 8:28')).toBeInTheDocument();
  });

  it('renders only populated detail rows when some fields are omitted', () => {
    const partialAbout: ProfileAboutData = {
      introduction: 'Apenas introdução.',
      missionHistory: '',
      originLocation: '',
      currentLocation: '',
      missionaryAgency: '',
      faithCommunity: 'Igreja Nova Vida',
      prayerRequests: '',
      lifeVerse: '',
    };

    render(<ProfileAboutSection data={partialAbout} onEditAction={vi.fn()} />);

    expect(screen.getByText('Apenas introdução.')).toBeInTheDocument();
    expect(screen.getByText('Igreja Nova Vida')).toBeInTheDocument();
    expect(screen.queryByText(/resumo da minha história em missões/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/pedidos de oração:/i)).not.toBeInTheDocument();
  });
});
