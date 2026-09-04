import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect } from 'vitest';
import CampaignMediaCarousel from './CampaignMediaCarousel';

describe('CampaignMediaCarousel component', () => {
  const testImages = [
    '/landing-page/landing-page.png',
    '/images/projects/projeto-impacto.jpg',
    '/landing-page/background.png',
  ];

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
