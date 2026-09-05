import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import ProfileSummaryCard from './ProfileSummaryCard';
import { mockProfile } from '@/mocks/profile';

describe('ProfileSummaryCard component', () => {
  it('renders missionary profile details', () => {
    render(<ProfileSummaryCard profile={mockProfile} isOwnProfile={true} />);

    expect(screen.getByText(mockProfile.displayName)).toBeInTheDocument();
    expect(screen.getByText(`@${mockProfile.username}`)).toBeInTheDocument();
    expect(screen.getByText(mockProfile.roleDescription)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /editar perfil/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /configurar doações/i })).toBeInTheDocument();
  });

  it('renders action buttons with "Ofertar" button when isOwnProfile is false', () => {
    render(
      <ProfileSummaryCard
        profile={mockProfile}
        isOwnProfile={false}
        followHref="/select-role"
        viewerRole="visitor"
      />
    );

    expect(screen.getByRole('link', { name: /seguir/i })).toHaveAttribute('href', '/select-role');
    expect(screen.getByRole('button', { name: /ofertar/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /contato/i })).toBeInTheDocument();
  });

  it('opens DonationModal when clicking Ofertar button', async () => {
    const user = userEvent.setup();
    render(
      <ProfileSummaryCard profile={mockProfile} isOwnProfile={false} viewerRole="supporter" />
    );

    const ofertarBtn = screen.getByRole('button', { name: /ofertar/i });
    await user.click(ofertarBtn);

    expect(screen.getByRole('heading', { name: /ofertar na missão/i })).toBeInTheDocument();
  });

  it('opens ContactModal when clicking Contato button', async () => {
    const user = userEvent.setup();
    render(<ProfileSummaryCard profile={mockProfile} isOwnProfile={true} />);

    const contactBtn = screen.getByRole('button', { name: /contato/i });
    await user.click(contactBtn);

    expect(screen.getByRole('heading', { name: /^contato$/i })).toBeInTheDocument();
  });

  it('copies profile URL to clipboard when share button is clicked', async () => {
    const user = userEvent.setup();
    const writeTextMock = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText: writeTextMock },
      configurable: true,
      writable: true,
    });

    render(<ProfileSummaryCard profile={mockProfile} isOwnProfile={false} />);
    const shareBtn = screen.getByRole('button', { name: /compartilhar perfil/i });
    await user.click(shareBtn);

    expect(writeTextMock).toHaveBeenCalled();
  });
});
