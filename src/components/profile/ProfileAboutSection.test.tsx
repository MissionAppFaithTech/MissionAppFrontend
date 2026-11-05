import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import ProfileAboutSection, { ABOUT_EMPTY_VALUE } from './ProfileAboutSection';
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
  it('lists every field the owner can fill, each with "A definir" while empty', () => {
    const { container } = render(<ProfileAboutSection data={emptyAbout} onEditAction={vi.fn()} />);

    expect(screen.getByRole('region', { name: 'Sobre' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 3, name: 'Biografia' })).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { level: 3, name: 'Resumo da minha história em missões' })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { level: 3, name: 'Pedidos de oração' })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { level: 3, name: 'Versículo para a vida' })
    ).toBeInTheDocument();
    const terms = within(container.querySelector('dl') as HTMLElement)
      .getAllByRole('term')
      .map((term) => term.textContent);
    expect(terms).toEqual([
      'Local de origem',
      'Local de atuação atual',
      'Agência missionária',
      'Comunidade de fé',
    ]);
    // 8 fields, none filled.
    expect(screen.getAllByText(ABOUT_EMPTY_VALUE)).toHaveLength(8);
    expect(container.querySelectorAll('blockquote')).toHaveLength(0);
  });

  it('marks only the missing fields with "A definir"', () => {
    render(
      <ProfileAboutSection
        data={{ ...emptyAbout, missionaryAgency: 'JOCUM', faithCommunity: 'Igreja Central' }}
        onEditAction={vi.fn()}
      />
    );

    expect(screen.getByText('JOCUM')).toBeInTheDocument();
    expect(screen.getByText('Igreja Central')).toBeInTheDocument();
    expect(screen.getAllByText(ABOUT_EMPTY_VALUE)).toHaveLength(6);
  });

  it('opens the editor from the header edit button', async () => {
    const onEdit = vi.fn();
    const user = userEvent.setup();
    render(<ProfileAboutSection data={populatedAbout} onEditAction={onEdit} />);

    await user.click(screen.getByRole('button', { name: /editar informações do sobre/i }));
    expect(onEdit).toHaveBeenCalledTimes(1);
  });

  it('shows the about fields, including the faith community, with quotes as blockquotes', () => {
    const { container } = render(
      <ProfileAboutSection data={populatedAbout} onEditAction={vi.fn()} />
    );

    expect(screen.queryByText(ABOUT_EMPTY_VALUE)).not.toBeInTheDocument();
    expect(screen.getByText(populatedAbout.introduction)).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: /resumo da minha história em missões/i })
    ).toBeInTheDocument();

    const details = container.querySelector('dl') as HTMLElement;
    const terms = within(details)
      .getAllByRole('term')
      .map((term) => term.textContent);
    expect(terms).toEqual([
      'Local de origem',
      'Local de atuação atual',
      'Agência missionária',
      'Comunidade de fé',
    ]);
    expect(within(details).getByText(populatedAbout.faithCommunity)).toBeInTheDocument();
    expect(within(details).getByText('Santarém - PA - Brasil')).toBeInTheDocument();

    const quotes = container.querySelectorAll('blockquote');
    expect(quotes).toHaveLength(2);
    expect(quotes[0]).toHaveTextContent('Pela saúde da equipe.');
    expect(quotes[1]).toHaveTextContent('Romanos 8:28');
  });

  it('shows a filled quote as a blockquote and the empty one as "A definir"', () => {
    const { container } = render(
      <ProfileAboutSection
        data={{ ...emptyAbout, introduction: 'Apenas introdução.', lifeVerse: 'João 3:16' }}
        onEditAction={vi.fn()}
      />
    );

    expect(screen.getByText('Apenas introdução.')).toBeInTheDocument();
    const quotes = container.querySelectorAll('blockquote');
    expect(quotes).toHaveLength(1);
    expect(quotes[0]).toHaveTextContent('João 3:16');
    expect(screen.getAllByText(ABOUT_EMPTY_VALUE)).toHaveLength(6);
  });

  it('opens the editor from any "A definir"', async () => {
    const onEdit = vi.fn();
    const user = userEvent.setup();
    render(
      <ProfileAboutSection data={{ ...emptyAbout, lifeVerse: 'João 3:16' }} onEditAction={onEdit} />
    );

    await user.click(screen.getByRole('button', { name: 'Definir Biografia' }));
    await user.click(screen.getByRole('button', { name: 'Definir Comunidade de fé' }));
    await user.click(screen.getByRole('button', { name: 'Definir Pedidos de oração' }));
    expect(onEdit).toHaveBeenCalledTimes(3);
    // A filled field is plain text, not a button.
    expect(
      screen.queryByRole('button', { name: 'Definir Versículo para a vida' })
    ).not.toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: /^Definir / })).toHaveLength(7);
  });

  it('reaches "A definir" with the keyboard', async () => {
    const onEdit = vi.fn();
    const user = userEvent.setup();
    render(<ProfileAboutSection data={emptyAbout} onEditAction={onEdit} />);

    screen.getByRole('button', { name: 'Definir Local de origem' }).focus();
    await user.keyboard('{Enter}');
    expect(onEdit).toHaveBeenCalledTimes(1);
  });

  it('separates every part (bio, story, details, prayer, verse) with a line', () => {
    render(<ProfileAboutSection data={populatedAbout} onEditAction={vi.fn()} />);

    expect(screen.getAllByRole('separator')).toHaveLength(4);
  });
});
