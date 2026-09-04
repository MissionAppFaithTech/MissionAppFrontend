import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect } from 'vitest';
import ImpactProjectCard, { getYouTubeEmbedUrl } from '@/components/profile/ImpactProjectCard';

describe('ImpactProjectCard Component', () => {
  const mockProject = {
    id: 'proj-1',
    title: 'Projeto social na favela do Lixão',
    description: 'Ajude-nos a construir uma escola cristã na África do Sul.',
    imageUrl: '/images/projects/projeto-impacto.jpg',
    galleryImages: [
      '/landing-page/landing-page.png',
      '/images/projects/projeto-impacto.jpg',
      '/landing-page/background.png',
    ],
    videoUrl: 'https://www.youtube.com/watch?v=5dsGWM5XGdg',
    campaignTitle: 'Campanha de Educação & Esperança',
    campaignBadge: true,
  };

  it('renders project title, campaign badge, description, and Ofertar button', () => {
    render(
      <ImpactProjectCard
        project={mockProject}
        isOwnProfile={true}
        missionaryName="Samuel Mendonça"
      />
    );

    expect(
      screen.getByRole('heading', { name: /projeto social na favela do lixão/i })
    ).toBeInTheDocument();
    expect(screen.getByText(/campanha de educação & esperança/i)).toBeInTheDocument();
    expect(screen.getByText(/ajude-nos a construir uma escola cristã/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /ofertar/i })).toBeInTheDocument();
  });

  it('renders youtube video frame display with cute animal video when videoUrl is provided', () => {
    render(
      <ImpactProjectCard
        project={mockProject}
        isOwnProfile={true}
        missionaryName="Samuel Mendonça"
      />
    );

    expect(screen.getByText(/vídeo de apresentação/i)).toBeInTheDocument();
    const iframe = screen.getByTitle(/vídeo de apresentação/i);
    expect(iframe).toBeInTheDocument();
    expect(iframe).toHaveAttribute('src', 'https://www.youtube-nocookie.com/embed/5dsGWM5XGdg');
  });

  it('renders gallery photos in carousel mode and opens lightbox modal when clicked', async () => {
    const user = userEvent.setup();
    render(
      <ImpactProjectCard
        project={mockProject}
        isOwnProfile={true}
        missionaryName="Samuel Mendonça"
      />
    );

    expect(screen.getByText(/fotos do projeto \(3\)/i)).toBeInTheDocument();
    expect(screen.getByText('1 de 3')).toBeInTheDocument();

    // Verify first photo is active in carousel
    const photo1 = screen.getByAltText(/foto 1/i);
    expect(photo1).toBeInTheDocument();

    // Click next slide button in carousel
    const nextSlideBtn = screen.getByRole('button', { name: /foto seguinte do carrossel/i });
    await user.click(nextSlideBtn);

    expect(screen.getByText('2 de 3')).toBeInTheDocument();
    const photo2 = screen.getByAltText(/foto 2/i);
    expect(photo2).toBeInTheDocument();

    // Click pagination dot for slide 3
    const dot3 = screen.getByRole('button', { name: /ir para a foto 3/i });
    await user.click(dot3);
    expect(screen.getByText('3 de 3')).toBeInTheDocument();

    // Click on the active photo to open Lightbox
    const expandBtn = screen.getByRole('button', { name: /ampliar foto 3 do projeto/i });
    await user.click(expandBtn);

    // Lightbox is open in DOM
    const lightboxDialog = document.querySelector('.yarl__container');
    expect(lightboxDialog).toBeInTheDocument();

    // Close lightbox
    const closeBtn = screen.getByRole('button', { name: /close/i });
    await user.click(closeBtn);
    await waitFor(() => {
      expect(document.querySelector('.yarl__container')).not.toBeInTheDocument();
    });
  });

  it('opens donation modal when clicking Ofertar button', async () => {
    const user = userEvent.setup();
    render(
      <ImpactProjectCard
        project={mockProject}
        isOwnProfile={true}
        missionaryName="Samuel Mendonça"
      />
    );

    const ofertarBtn = screen.getByRole('button', { name: /ofertar/i });
    await user.click(ofertarBtn);

    expect(screen.getByRole('heading', { name: /ofertar na missão/i })).toBeInTheDocument();
  });

  describe('getYouTubeEmbedUrl helper', () => {
    it('correctly extracts youtube video IDs and formats embed URLs', () => {
      expect(getYouTubeEmbedUrl('https://www.youtube.com/watch?v=5dsGWM5XGdg')).toBe(
        'https://www.youtube-nocookie.com/embed/5dsGWM5XGdg'
      );
      expect(getYouTubeEmbedUrl('https://youtu.be/5dsGWM5XGdg')).toBe(
        'https://www.youtube-nocookie.com/embed/5dsGWM5XGdg'
      );
      expect(getYouTubeEmbedUrl('https://www.youtube-nocookie.com/embed/5dsGWM5XGdg')).toBe(
        'https://www.youtube-nocookie.com/embed/5dsGWM5XGdg'
      );
      expect(getYouTubeEmbedUrl('https://www.youtube.com/shorts/5dsGWM5XGdg')).toBe(
        'https://www.youtube-nocookie.com/embed/5dsGWM5XGdg'
      );
      expect(getYouTubeEmbedUrl(undefined)).toBeNull();
      expect(getYouTubeEmbedUrl('invalid-url')).toBeNull();
    });
  });
});
