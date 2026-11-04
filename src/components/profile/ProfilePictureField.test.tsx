import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useRouter } from 'next/navigation';
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

  it('announces the processing and blocks the controls until the backend finishes', async () => {
    const user = userEvent.setup();
    let finish!: (value: { url: string | null }) => void;
    vi.mocked(uploadProfilePicture).mockImplementation(async (_file, options) => {
      options?.onProcessing?.();
      return new Promise((resolve) => {
        finish = resolve;
      });
    });
    render(<ProfilePictureField displayName="Ana" />);

    await user.upload(screen.getByLabelText(/adicionar foto de perfil/i), png());

    expect(await screen.findByRole('status')).toHaveTextContent(/processando a foto/i);
    expect(screen.getByLabelText(/alterar foto de perfil/i).querySelector('input')).toBeDisabled();
    expect(screen.queryByRole('button', { name: /remover foto/i })).not.toBeInTheDocument();

    finish({ url: 'https://cdn.test/new.webp' });

    await waitFor(() =>
      expect(screen.getByRole('status')).toHaveTextContent('Foto de perfil atualizada.')
    );
    expect(screen.getByRole('img', { name: 'Foto de perfil de Ana' })).toHaveAttribute(
      'src',
      'https://cdn.test/new.webp'
    );
  });

  it('refreshes the server data after saving and after removing the photo', async () => {
    const user = userEvent.setup();
    const { refresh } = useRouter();
    vi.mocked(uploadProfilePicture).mockResolvedValue({ url: 'https://cdn.test/new.webp' });
    vi.mocked(removeProfilePicture).mockResolvedValue(undefined);
    render(<ProfilePictureField displayName="Ana" />);

    await user.upload(screen.getByLabelText(/adicionar foto de perfil/i), png());
    await waitFor(() => expect(refresh).toHaveBeenCalledTimes(1));

    await user.click(screen.getByRole('button', { name: /remover foto/i }));
    await waitFor(() => expect(refresh).toHaveBeenCalledTimes(2));
  });

  it('does not refresh when the upload fails', async () => {
    const user = userEvent.setup();
    const { refresh } = useRouter();
    vi.mocked(uploadProfilePicture).mockRejectedValue(new ApiError('Falha', 422));
    render(<ProfilePictureField displayName="Ana" />);

    await user.upload(screen.getByLabelText(/adicionar foto de perfil/i), png());

    expect(await screen.findByRole('alert')).toHaveTextContent('Falha');
    expect(refresh).not.toHaveBeenCalled();
  });

  it('refreshes after a processing failure, since the old photo was already replaced', async () => {
    const user = userEvent.setup();
    const { refresh } = useRouter();
    vi.mocked(uploadProfilePicture).mockImplementation(async (_file, options) => {
      options?.onProcessing?.();
      throw new ApiError('Não foi possível processar a imagem. Tente enviar outra foto.', 422);
    });
    render(<ProfilePictureField displayName="Ana" currentUrl="https://cdn.test/old.webp" />);

    await user.upload(screen.getByLabelText(/alterar foto de perfil/i), png());

    expect(await screen.findByRole('alert')).toHaveTextContent(/processar a imagem/i);
    expect(refresh).toHaveBeenCalledTimes(1);
  });

  it('disables the picker while the file is being sent', async () => {
    const user = userEvent.setup();
    vi.mocked(uploadProfilePicture).mockReturnValue(new Promise(() => {}));
    render(<ProfilePictureField displayName="Ana" />);

    await user.upload(screen.getByLabelText(/adicionar foto de perfil/i), png());

    expect(await screen.findByRole('status')).toHaveTextContent('Enviando foto de perfil...');
    expect(screen.getByLabelText(/alterar foto de perfil/i).querySelector('input')).toBeDisabled();
  });

  it('disables the picker while the photo is being removed', async () => {
    const user = userEvent.setup();
    vi.mocked(removeProfilePicture).mockReturnValue(new Promise(() => {}));
    render(<ProfilePictureField displayName="Ana" currentUrl="https://cdn.test/old.webp" />);

    await user.click(screen.getByRole('button', { name: /remover foto/i }));

    expect(await screen.findByRole('status')).toHaveTextContent('Removendo foto de perfil...');
    expect(screen.getByLabelText(/alterar foto de perfil/i).querySelector('input')).toBeDisabled();
  });
});
