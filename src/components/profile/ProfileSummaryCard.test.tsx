import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import ProfileSummaryCard from './ProfileSummaryCard';
import { mockProfile, mockSupporterProfile } from '@/mocks/profile';

describe('ProfileSummaryCard component', () => {
  it('renders the missionary owner header with example-data stats and navy edit', () => {
    render(<ProfileSummaryCard profile={mockProfile} isOwnProfile />);

    expect(screen.getByText(mockProfile.displayName)).toBeInTheDocument();
    expect(screen.getByText(`@${mockProfile.username}`)).toBeInTheDocument();
    // Photo upload is not available yet: no dead control on the header.
    expect(
      screen.queryByRole('button', { name: /adicionar foto de perfil/i })
    ).not.toBeInTheDocument();
    expect(screen.getByLabelText(/dados de exemplo: estatísticas do perfil/i)).toBeInTheDocument();
    expect(screen.getByText('apoiadores')).toBeInTheDocument();
    expect(screen.getByText('seguindo')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /editar perfil/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^contato$/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /compartilhar perfil/i })).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /configurar doações/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /ofertar/i })).not.toBeInTheDocument();
  });

  it('renders a compact own supporter header without stats or share', () => {
    render(<ProfileSummaryCard profile={mockSupporterProfile} isOwnProfile />);

    expect(screen.getByText(mockSupporterProfile.displayName)).toBeInTheDocument();
    expect(screen.getByText(/apoiador de missões/i)).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: /adicionar foto de perfil/i })
    ).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: /editar perfil/i })).toHaveAttribute(
      'href',
      '/profile/supporter/edit-profile'
    );
    expect(screen.queryByText('projetos')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /compartilhar perfil/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /ofertar/i })).not.toBeInTheDocument();
  });

  it('renders follow, offer, contact and icon-only share when a supporter views a missionary', () => {
    render(
      <ProfileSummaryCard profile={mockProfile} isOwnProfile={false} viewerRole="supporter" />
    );

    expect(screen.getByRole('button', { name: /^seguir$/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /ofertar/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /entrar em contato/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /compartilhar perfil/i })).toBeInTheDocument();
    expect(screen.queryByText('apoiadores')).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: /adicionar foto de perfil/i })
    ).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /editar perfil/i })).not.toBeInTheDocument();
  });

  it('shows Seguindo when the viewer already follows the missionary', () => {
    render(
      <ProfileSummaryCard
        profile={mockProfile}
        isOwnProfile={false}
        viewerRole="supporter"
        isFollowingInitial
      />
    );

    expect(screen.getByRole('button', { name: /^seguindo$/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /ofertar/i })).toBeInTheDocument();
  });

  it('links Seguir for visitors', () => {
    render(
      <ProfileSummaryCard
        profile={mockProfile}
        isOwnProfile={false}
        followHref="/select-role"
        viewerRole="visitor"
      />
    );

    expect(screen.getByRole('link', { name: /^seguir$/i })).toHaveAttribute('href', '/select-role');
  });

  it('opens DonationModal when clicking Ofertar', async () => {
    const user = userEvent.setup();
    render(
      <ProfileSummaryCard profile={mockProfile} isOwnProfile={false} viewerRole="supporter" />
    );

    await user.click(screen.getByRole('button', { name: /ofertar/i }));
    expect(screen.getByRole('heading', { name: /ofertar na missão/i })).toBeInTheDocument();
  });

  it('opens ContactModal from the owner Contato action', async () => {
    const user = userEvent.setup();
    render(<ProfileSummaryCard profile={mockProfile} isOwnProfile />);

    await user.click(screen.getByRole('button', { name: /^contato$/i }));
    expect(screen.getByRole('heading', { name: /^contato$/i })).toBeInTheDocument();
  });

  it('copies the profile URL from the icon-only share action', async () => {
    const user = userEvent.setup();
    const writeTextMock = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText: writeTextMock },
      configurable: true,
      writable: true,
    });

    render(<ProfileSummaryCard profile={mockProfile} isOwnProfile={false} />);
    await user.click(screen.getByRole('button', { name: /compartilhar perfil/i }));
    expect(writeTextMock).toHaveBeenCalled();
  });

  it('renders "Adicione sua biografia" prompt when bio is empty for owner', () => {
    const profileWithoutBio = {
      ...mockProfile,
      roleDescription: '',
      location: '',
    };

    render(<ProfileSummaryCard profile={profileWithoutBio} isOwnProfile />);

    const addBioLink = screen.getByRole('link', { name: /adicione sua biografia/i });
    expect(addBioLink).toBeInTheDocument();
    expect(addBioLink).toHaveAttribute('href', '/profile/edit-profile');
    expect(screen.queryByText(/cidade do cabo/i)).not.toBeInTheDocument();
  });

  it('renders real location when present and omits location pin when empty', () => {
    const profileWithLocation = {
      ...mockProfile,
      location: 'Curitiba/PR',
    };

    const { rerender } = render(<ProfileSummaryCard profile={profileWithLocation} isOwnProfile />);
    expect(screen.getByText('Curitiba/PR')).toBeInTheDocument();

    const profileNoLocation = {
      ...mockProfile,
      location: '',
    };
    rerender(<ProfileSummaryCard profile={profileNoLocation} isOwnProfile />);
    expect(screen.queryByText('Curitiba/PR')).not.toBeInTheDocument();
  });
});
