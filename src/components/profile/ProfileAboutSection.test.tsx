import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import ProfileAboutSection from './ProfileAboutSection';
import type { ProfileAboutData } from '@/types/profile';

const emptyAbout: ProfileAboutData = {
  introduction: '',
  missionHistory: '',
  originLocation: '',
  currentLocation: '',
  missionaryAgency: '',
  faithCommunity: '',
  prayerRequests: '',
  lifeVerse: '',
};

const populatedAbout: ProfileAboutData = {
  introduction: 'Olá, sou missionário há 5 anos.',
  missionHistory: 'Iniciei meu chamado em comunidades rurais.',
  originLocation: 'Belo Horizonte - Brasil',
  currentLocation: 'Santarém - PA - Brasil',
  missionaryAgency: 'JOCUM',
  faithCommunity: 'Igreja Batista Esperança',
  prayerRequests: 'Pela saúde da equipe.',
  lifeVerse: 'Romanos 8:28',
};

describe('ProfileAboutSection', () => {
  it('shows an empty state with a call to action when nothing editable is filled', async () => {
    const onEdit = vi.fn();
    const user = userEvent.setup();
    render(<ProfileAboutSection data={emptyAbout} onEditAction={onEdit} />);

    expect(screen.getByRole('region', { name: 'Sobre' })).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { level: 3, name: /compartilhe sua história em missões/i })
    ).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /preencher o sobre/i }));
    expect(onEdit).toHaveBeenCalledTimes(1);
  });

  it('keeps showing the agency, but never the faith community, next to the empty state', () => {
    render(
      <ProfileAboutSection
        data={{ ...emptyAbout, missionaryAgency: 'JOCUM', faithCommunity: 'Igreja Central' }}
        onEditAction={vi.fn()}
      />
    );

    expect(screen.getByRole('button', { name: /preencher o sobre/i })).toBeInTheDocument();
    expect(screen.getByText('JOCUM')).toBeInTheDocument();
    expect(screen.queryByText('Igreja Central')).not.toBeInTheDocument();
    expect(screen.queryByText(/comunidade de fé/i)).not.toBeInTheDocument();
  });

  it('opens the editor from the header edit button', async () => {
    const onEdit = vi.fn();
    const user = userEvent.setup();
    render(<ProfileAboutSection data={populatedAbout} onEditAction={onEdit} />);

    await user.click(screen.getByRole('button', { name: /editar informações do sobre/i }));
    expect(onEdit).toHaveBeenCalledTimes(1);
  });

  it('shows the RF 10.7.1 fields except the faith community, with quotes as blockquotes', () => {
    const { container } = render(
      <ProfileAboutSection data={populatedAbout} onEditAction={vi.fn()} />
    );

    expect(screen.queryByRole('button', { name: /preencher o sobre/i })).not.toBeInTheDocument();
    expect(screen.getByText(populatedAbout.introduction)).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: /resumo da minha história em missões/i })
    ).toBeInTheDocument();

    const details = container.querySelector('dl') as HTMLElement;
    const terms = within(details)
      .getAllByRole('term')
      .map((term) => term.textContent);
    expect(terms).toEqual(['Local de origem', 'Local de atuação atual', 'Agência missionária']);
    expect(screen.queryByText(populatedAbout.faithCommunity)).not.toBeInTheDocument();
    expect(within(details).getByText('Santarém - PA - Brasil')).toBeInTheDocument();

    const quotes = container.querySelectorAll('blockquote');
    expect(quotes).toHaveLength(2);
    expect(quotes[0]).toHaveTextContent('Pela saúde da equipe.');
    expect(quotes[1]).toHaveTextContent('Romanos 8:28');
  });

  it('omits rows for empty fields', () => {
    render(
      <ProfileAboutSection
        data={{ ...emptyAbout, introduction: 'Apenas introdução.', lifeVerse: 'João 3:16' }}
        onEditAction={vi.fn()}
      />
    );

    expect(screen.getByText('Apenas introdução.')).toBeInTheDocument();
    expect(screen.getByText('João 3:16')).toBeInTheDocument();
    expect(screen.queryByText(/local de origem/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/pedidos de oração/i)).not.toBeInTheDocument();
  });
});
