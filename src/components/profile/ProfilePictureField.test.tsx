import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import ProfilePictureField from './ProfilePictureField';
import { ApiError } from '@/lib/api/client';
import { removeProfilePicture, uploadProfilePicture } from '@/services/profilePicture.service';

vi.mock('@/services/profilePicture.service', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/services/profilePicture.service')>()),
  uploadProfilePicture: vi.fn(),
  removeProfilePicture: vi.fn(),
}));

const png = () => new File(['photo'], 'foto.png', { type: 'image/png' });

describe('ProfilePictureField', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:preview');
    vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {});
  });

  it('offers an accessible picker limited to JPG, PNG and WebP', () => {
    render(<ProfilePictureField displayName="Ana" />);

    const picker = screen.getByLabelText(/adicionar foto de perfil/i);
    expect(picker.querySelector('input[type="file"]')).toHaveAttribute(
      'accept',
      'image/jpeg,image/png,image/webp'
    );
    expect(screen.getByText(/jpg, png ou webp de até 5 mb/i)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /remover foto/i })).not.toBeInTheDocument();
  });

  it('keeps the local preview and announces that the photo is being processed', async () => {
    const user = userEvent.setup();
    vi.mocked(uploadProfilePicture).mockResolvedValue({ url: null });
    render(<ProfilePictureField displayName="Ana" />);

    await user.upload(screen.getByLabelText(/adicionar foto de perfil/i), png());

    expect(await screen.findByRole('status')).toHaveTextContent(/processamento/i);
    expect(screen.getByRole('img', { name: 'Foto de perfil de Ana' })).toHaveAttribute(
      'src',
      'blob:preview'
    );
  });

  it('shows the type error in an alert without uploading', async () => {
    const user = userEvent.setup({ applyAccept: false });
    render(<ProfilePictureField displayName="Ana" />);

    await user.upload(
      screen.getByLabelText(/adicionar foto de perfil/i),
      new File(['x'], 'foto.bmp', { type: 'image/bmp' })
    );

    expect(screen.getByRole('alert')).toHaveTextContent(/jpg, png ou webp/i);
    expect(uploadProfilePicture).not.toHaveBeenCalled();
  });

  it('reports a failed upload and goes back to the saved photo', async () => {
    const user = userEvent.setup();
    vi.mocked(uploadProfilePicture).mockRejectedValue(new ApiError('Falha no envio', 0));
    render(<ProfilePictureField displayName="Ana" currentUrl="https://cdn.test/old.webp" />);

    await user.upload(screen.getByLabelText(/alterar foto de perfil/i), png());

    expect(await screen.findByRole('alert')).toHaveTextContent('Falha no envio');
    expect(screen.getByRole('img', { name: 'Foto de perfil de Ana' })).toHaveAttribute(
      'src',
      'https://cdn.test/old.webp'
    );
  });

  it('removes the saved photo', async () => {
    const user = userEvent.setup();
    vi.mocked(removeProfilePicture).mockResolvedValue(undefined);
    render(<ProfilePictureField displayName="Ana" currentUrl="https://cdn.test/old.webp" />);

    await user.click(screen.getByRole('button', { name: /remover foto/i }));

    await waitFor(() => expect(removeProfilePicture).toHaveBeenCalledTimes(1));
    await waitFor(() =>
      expect(screen.queryByRole('img', { name: /foto de perfil/i })).not.toBeInTheDocument()
    );
    expect(screen.getByLabelText(/adicionar foto de perfil/i)).toBeInTheDocument();
  });
});
