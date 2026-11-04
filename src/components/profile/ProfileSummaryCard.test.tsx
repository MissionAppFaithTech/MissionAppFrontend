import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ProfileSummaryCard from './ProfileSummaryCard';
import { mockProfile, mockSupporterProfile } from '@/mocks/profile';
import { ApiError } from '@/lib/api/client';
import { removeProfilePicture, uploadProfilePicture } from '@/services/profilePicture.service';
import { useFeedbackStore } from '@/stores/feedbackStore';

vi.mock('@/services/profilePicture.service', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/services/profilePicture.service')>()),
  uploadProfilePicture: vi.fn(),
  removeProfilePicture: vi.fn(),
}));

beforeEach(() => {
  vi.mocked(uploadProfilePicture).mockReset();
  vi.mocked(removeProfilePicture).mockReset();
  useFeedbackStore.setState({ current: null });
});

describe('ProfileSummaryCard component', () => {
  it('renders the missionary owner header with navy edit', () => {
    render(<ProfileSummaryCard profile={mockProfile} isOwnProfile />);

    expect(screen.getByText(mockProfile.displayName)).toBeInTheDocument();
    expect(screen.getByText(`@${mockProfile.username}`)).toBeInTheDocument();
    expect(screen.getByLabelText(/adicionar foto de perfil/i)).toBeInTheDocument();
    expect(screen.getByText('apoiadores')).toBeInTheDocument();
    expect(screen.getByText('seguindo')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /editar perfil/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^contato$/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /compartilhar perfil/i })).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /configurar doações/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /ofertar/i })).not.toBeInTheDocument();
  });

  it('shows zero counters and hides the example badge on a new profile', () => {
    render(
      <ProfileSummaryCard
        profile={{
          ...mockProfile,
          projectsCount: 0,
          postsCount: 0,
          campaignsCount: 0,
          supportersCount: 0,
          followingCount: 0,
          statsAreExample: false,
        }}
        isOwnProfile
      />
    );

    expect(screen.queryByText(/dados de exemplo/i)).not.toBeInTheDocument();
    expect(screen.queryByText('1.2k')).not.toBeInTheDocument();
    expect(screen.queryByText('25')).not.toBeInTheDocument();
    for (const label of ['projetos', 'postagens', 'campanhas', 'apoiadores', 'seguindo']) {
      expect(screen.getByText(label)).toBeInTheDocument();
    }
    expect(screen.getAllByText('0')).toHaveLength(5);
  });

  it('renders a compact own supporter header without stats or share', () => {
    render(<ProfileSummaryCard profile={mockSupporterProfile} isOwnProfile />);

    expect(screen.getByText(mockSupporterProfile.displayName)).toBeInTheDocument();
    expect(screen.getByText(/apoiador de missões/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/adicionar foto de perfil/i)).toBeInTheDocument();
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

  it('uploads the chosen image and keeps the preview while the server processes it', async () => {
    const user = userEvent.setup();
    const previewUrl = 'blob:profile-photo';
    vi.spyOn(URL, 'createObjectURL').mockReturnValue(previewUrl);
    vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {});
    vi.mocked(uploadProfilePicture).mockResolvedValue({ url: null });

    render(<ProfileSummaryCard profile={mockProfile} isOwnProfile />);
    const file = new File(['photo'], 'foto.png', { type: 'image/png' });
    await user.upload(screen.getByLabelText(/adicionar foto de perfil/i), file);

    expect(uploadProfilePicture).toHaveBeenCalledWith(file);
    expect(screen.getByRole('img', { name: /foto de perfil de samuel mendonça/i })).toHaveAttribute(
      'src',
      previewUrl
    );
    await waitFor(() =>
      expect(useFeedbackStore.getState().current?.message).toMatch(/processamento/i)
    );
  });

  it('shows the saved URL once the server has it', async () => {
    const user = userEvent.setup();
    vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:x');
    vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {});
    vi.mocked(uploadProfilePicture).mockResolvedValue({ url: 'https://cdn.test/p.webp' });

    render(<ProfileSummaryCard profile={mockProfile} isOwnProfile />);
    await user.upload(
      screen.getByLabelText(/adicionar foto de perfil/i),
      new File(['photo'], 'foto.webp', { type: 'image/webp' })
    );

    await waitFor(() =>
      expect(screen.getByRole('img', { name: /foto de perfil/i })).toHaveAttribute(
        'src',
        'https://cdn.test/p.webp'
      )
    );
    expect(screen.getByLabelText(/alterar foto de perfil/i)).toBeInTheDocument();
  });

  it('refuses a file that is not JPG, PNG or WebP without uploading it', async () => {
    const user = userEvent.setup({ applyAccept: false });
    render(<ProfileSummaryCard profile={mockProfile} isOwnProfile />);

    await user.upload(
      screen.getByLabelText(/adicionar foto de perfil/i),
      new File(['gif'], 'foto.gif', { type: 'image/gif' })
    );

    expect(uploadProfilePicture).not.toHaveBeenCalled();
    expect(useFeedbackStore.getState().current).toMatchObject({
      message: expect.stringMatching(/jpg, png ou webp/i),
      severity: 'error',
    });
  });

  it('drops the preview and reports the error when the upload fails', async () => {
    const user = userEvent.setup();
    vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:x');
    vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {});
    vi.mocked(uploadProfilePicture).mockRejectedValue(new ApiError('Falha no envio', 0));

    render(<ProfileSummaryCard profile={mockProfile} isOwnProfile />);
    await user.upload(
      screen.getByLabelText(/adicionar foto de perfil/i),
      new File(['photo'], 'foto.png', { type: 'image/png' })
    );

    await waitFor(() =>
      expect(useFeedbackStore.getState().current).toMatchObject({
        message: 'Falha no envio',
        severity: 'error',
      })
    );
    expect(screen.queryByRole('img', { name: /foto de perfil/i })).not.toBeInTheDocument();
  });

  it('shows the saved photo to visitors without an upload control', () => {
    render(
      <ProfileSummaryCard
        profile={{ ...mockProfile, avatarUrl: 'https://cdn.test/p.webp' }}
        isOwnProfile={false}
      />
    );

    expect(screen.getByRole('img', { name: /foto de perfil de samuel mendonça/i })).toHaveAttribute(
      'src',
      'https://cdn.test/p.webp'
    );
    expect(screen.queryByLabelText(/foto de perfil$/i)).not.toBeInTheDocument();
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

  it('removes the photo after confirming in an accessible dialog', async () => {
    const user = userEvent.setup();
    vi.mocked(removeProfilePicture).mockResolvedValue();
    const withPhoto = { ...mockProfile, avatarUrl: 'https://cdn.test/p.webp' };
    render(<ProfileSummaryCard profile={withPhoto} isOwnProfile />);

    expect(screen.getByLabelText(/alterar foto de perfil/i)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /remover foto de perfil/i }));

    const dialog = await screen.findByRole('dialog', { name: /remover foto de perfil\?/i });
    expect(dialog).toHaveAccessibleDescription(/ícone padrão/i);
    await user.click(screen.getByRole('button', { name: /^cancelar$/i }));
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(removeProfilePicture).not.toHaveBeenCalled();

    await user.click(screen.getByRole('button', { name: /remover foto de perfil/i }));
    await user.click(await screen.findByRole('button', { name: /^remover foto$/i }));

    await waitFor(() => expect(removeProfilePicture).toHaveBeenCalledTimes(1));
    await waitFor(() =>
      expect(screen.queryByRole('img', { name: /foto de perfil/i })).not.toBeInTheDocument()
    );
    expect(screen.getByLabelText(/adicionar foto de perfil/i)).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: /remover foto de perfil/i })
    ).not.toBeInTheDocument();
    expect(useFeedbackStore.getState().current).toMatchObject({ severity: 'success' });
  });

  it('offers no remove action without a photo or to visitors', () => {
    const { unmount } = render(
      <ProfileSummaryCard profile={{ ...mockProfile, avatarUrl: undefined }} isOwnProfile />
    );
    expect(
      screen.queryByRole('button', { name: /remover foto de perfil/i })
    ).not.toBeInTheDocument();
    unmount();

    render(
      <ProfileSummaryCard
        profile={{ ...mockProfile, avatarUrl: 'https://cdn.test/p.webp' }}
        isOwnProfile={false}
      />
    );
    expect(
      screen.queryByRole('button', { name: /remover foto de perfil/i })
    ).not.toBeInTheDocument();
  });
});
