import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import CampaignVideoPlayer from './CampaignVideoPlayer';

describe('CampaignVideoPlayer component', () => {
  it('renders iframe when valid YouTube URL is provided', () => {
    render(
      <CampaignVideoPlayer
        videoUrl="https://www.youtube.com/watch?v=5dsGWM5XGdg"
        title="Test Campaign Video"
      />
    );

    expect(screen.getByText(/vídeo oficial da campanha/i)).toBeInTheDocument();
    const iframe = screen.getByTitle('Test Campaign Video');
    expect(iframe).toBeInTheDocument();
    expect(iframe).toHaveAttribute('src', 'https://www.youtube-nocookie.com/embed/5dsGWM5XGdg');
  });

  it('renders nothing when no videoUrl or invalid URL is provided', () => {
    const { container } = render(<CampaignVideoPlayer videoUrl="" />);
    expect(container.firstChild).toBeNull();
  });
});
