import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, it, expect, vi } from 'vitest';
import { DEFAULT_A11Y_PREFERENCES, useA11yPreferencesStore } from '@/stores/a11yPreferencesStore';
import CampaignMediaCarousel from './CampaignMediaCarousel';

describe('CampaignMediaCarousel component', () => {
  const testImages = [
    '/landing-page/landing-page.png',
    '/images/projects/projeto-impacto.jpg',
    '/landing-page/background.png',
  ];

  afterEach(() => {
    vi.useRealTimers();
    useA11yPreferencesStore.setState({ ...DEFAULT_A11Y_PREFERENCES });
  });

  it('auto-advances and stops after the user presses Pausar (WCAG 2.2.2)', () => {
    vi.useFakeTimers();
    render(<CampaignMediaCarousel images={testImages} autoPlayInterval={1000} />);

    act(() => vi.advanceTimersByTime(1000));
    expect(screen.getByRole('button', { name: /ampliar imagem 2 de 3/i })).toBeInTheDocument();

    const pause = screen.getByRole('button', { name: /pausar troca automática/i });
    act(() => pause.click());
    expect(screen.getByRole('button', { name: /retomar troca automática/i })).toHaveAttribute(
      'aria-pressed',
      'true'
    );

    act(() => vi.advanceTimersByTime(5000));
    expect(screen.getByRole('button', { name: /ampliar imagem 2 de 3/i })).toBeInTheDocument();
  });

  it('never auto-advances when the user asked to reduce motion', () => {
    vi.useFakeTimers();
    useA11yPreferencesStore.setState({ reduceMotion: true });
    render(<CampaignMediaCarousel images={testImages} autoPlayInterval={1000} />);

    act(() => vi.advanceTimersByTime(5000));
    expect(screen.getByRole('button', { name: /ampliar imagem 1 de 3/i })).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: /pausar troca automática/i })
    ).not.toBeInTheDocument();
  });

  it('renders active image and navigation buttons', () => {
    render(<CampaignMediaCarousel images={testImages} title="Test Campaign" />);

    expect(screen.getByRole('button', { name: /ampliar imagem 1 de 3/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /próxima imagem/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /imagem anterior/i })).toBeInTheDocument();
  });

  it('navigates through images when clicking next and prev', async () => {
    const user = userEvent.setup();
    render(<CampaignMediaCarousel images={testImages} title="Test Campaign" />);

    const nextBtn = screen.getByRole('button', { name: /próxima imagem/i });
    await user.click(nextBtn);

    expect(screen.getByRole('button', { name: /ampliar imagem 2 de 3/i })).toBeInTheDocument();

    const prevBtn = screen.getByRole('button', { name: /imagem anterior/i });
    await user.click(prevBtn);

    expect(screen.getByRole('button', { name: /ampliar imagem 1 de 3/i })).toBeInTheDocument();
  });

  it('renders nothing when images array is empty', () => {
    const { container } = render(<CampaignMediaCarousel images={[]} />);
    expect(container.firstChild).toBeNull();
  });
});
