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
  });

  it('renders guest visitor action buttons when isOwnProfile is false', () => {
    render(
      <ProfileSummaryCard
        profile={mockProfile}
        isOwnProfile={false}
        followHref="/select-role"
        supportHref="/select-role"
        contactHref="/login"
      />
    );

    expect(screen.getByRole('link', { name: /seguir/i })).toHaveAttribute('href', '/select-role');
    expect(screen.getByRole('link', { name: /apoiar/i })).toHaveAttribute('href', '/select-role');
    expect(screen.getByRole('link', { name: /contato/i })).toHaveAttribute('href', '/login');
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
