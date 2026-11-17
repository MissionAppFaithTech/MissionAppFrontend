import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithQuery } from '@/test/query';
import { IMAGE_ID, POST_ID, postFixture } from '@/test/posts';
import { ApiError } from '@/lib/api/client';
import { createPost, updatePost, uploadPostImage } from '@/services/post.service';
import PostForm from './PostForm';
vi.mock('@/services/post.service', () => ({
  createPost: vi.fn(),
  updatePost: vi.fn(),
  uploadPostImage: vi.fn(),
}));
beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(createPost).mockResolvedValue(postFixture);
  vi.mocked(updatePost).mockResolvedValue(postFixture);
  vi.mocked(uploadPostImage).mockImplementation(async (_, progress) => {
    Object.assign(progress, { assetId: POST_ID, confirmed: true });
    return POST_ID;
  });
  Object.defineProperty(URL, 'createObjectURL', {
    configurable: true,
    value: vi.fn(() => 'blob:preview'),
  });
  Object.defineProperty(URL, 'revokeObjectURL', { configurable: true, value: vi.fn() });
});
const picture = () => new File(['png'], 'foto.png', { type: 'image/png' });
async function fillAndSubmit() {
  const user = userEvent.setup();
  await user.type(screen.getByRole('textbox', { name: /legenda/i }), 'Legenda do campo');
  await user.click(screen.getByRole('button', { name: 'Publicar' }));
  return user;
}
describe('post editor', () => {
  it('associates the empty caption error, focuses it and never posts', async () => {
    renderWithQuery(<PostForm onClose={vi.fn()} />);
    await userEvent.click(screen.getByRole('button', { name: 'Publicar' }));
    const input = screen.getByRole('textbox', { name: /legenda/i });
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input).toHaveAccessibleDescription('Escreva a legenda da publicação');
    expect(input).toHaveFocus();
    expect(createPost).not.toHaveBeenCalled();
  });
  it('only closes once a real save resolves and shows immediate loading', async () => {
    let resolve!: (value: typeof postFixture) => void;
    vi.mocked(createPost).mockImplementation(
      () =>
        new Promise((done) => {
          resolve = done;
        })
    );
    const close = vi.fn();
    renderWithQuery(<PostForm onClose={close} />);
    await fillAndSubmit();
    expect(screen.getByRole('button', { name: 'Publicar' })).toBeDisabled();
    expect(close).not.toHaveBeenCalled();
    resolve(postFixture);
    await waitFor(() => expect(close).toHaveBeenCalledOnce());
  });
  it('requires explicit replacement confirmation and cancellation does not retry', async () => {
    vi.mocked(createPost).mockRejectedValue(
      new ApiError('Limite', 409, {}, 'E_POST_IMAGE_LIMIT_REACHED')
    );
    renderWithQuery(<PostForm onClose={vi.fn()} />);
    const user = await fillAndSubmit();
    await screen.findByRole('dialog', { name: 'Limite de 50 imagens atingido' });
    expect(createPost).toHaveBeenCalledTimes(1);
    await user.click(screen.getByRole('button', { name: 'Manter imagens antigas' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(screen.getByRole('button', { name: 'Publicar' })).toHaveFocus();
    expect(createPost).toHaveBeenCalledTimes(1);
    await user.click(screen.getByRole('button', { name: 'Publicar' }));
    await screen.findByRole('dialog');
    vi.mocked(createPost).mockResolvedValue(postFixture);
    await user.click(screen.getByRole('button', { name: 'Substituir imagens antigas' }));
    await waitFor(() =>
      expect(createPost).toHaveBeenLastCalledWith({
        content: 'Legenda do campo',
        highlightLink: undefined,
        imageAssetIds: [],
        replaceOldestImages: true,
      })
    );
  });
  it('confirms the image limit during editing without resending a confirmed upload', async () => {
    vi.mocked(updatePost)
      .mockRejectedValueOnce(new ApiError('Limite', 409, {}, 'E_POST_IMAGE_LIMIT_REACHED'))
      .mockResolvedValue(postFixture);
    renderWithQuery(<PostForm post={postFixture} onClose={vi.fn()} />);
    const user = userEvent.setup();
    await user.upload(screen.getByLabelText('Selecionar imagens'), picture());
    await user.click(screen.getByRole('button', { name: 'Salvar alterações' }));
    await screen.findByRole('dialog');
    expect(updatePost).toHaveBeenCalledTimes(1);
    await user.click(screen.getByRole('button', { name: 'Substituir imagens antigas' }));
    await waitFor(() => expect(updatePost).toHaveBeenCalledTimes(2));
    expect(updatePost).toHaveBeenLastCalledWith(POST_ID, {
      content: postFixture.content,
      highlightLink: null,
      imageAssetIds: [POST_ID],
      replaceOldestImages: true,
    });
    expect(uploadPostImage).toHaveBeenCalledTimes(1);
  });

  it.each([403, 409, 422])(
    'keeps the form and never offers replacement for generic %i',
    async (status) => {
      vi.mocked(createPost).mockRejectedValue(new ApiError('Falha no servidor', status));
      const close = vi.fn();
      renderWithQuery(<PostForm onClose={close} />);
      await fillAndSubmit();
      expect(await screen.findByText('Falha no servidor')).toBeVisible();
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      expect(close).not.toHaveBeenCalled();
    }
  );
  it('rejects 4 images and invalid media before any upload', () => {
    renderWithQuery(<PostForm onClose={vi.fn()} />);
    const input = screen.getByLabelText('Selecionar imagens');
    fireEvent.change(input, { target: { files: [picture(), picture(), picture(), picture()] } });
    expect(screen.getByText('Escolha até 3 imagens por postagem')).toBeVisible();
    fireEvent.change(input, {
      target: { files: [new File(['svg'], 'x.svg', { type: 'image/svg+xml' })] },
    });
    expect(screen.getByText('Escolha JPG, PNG ou WebP')).toBeVisible();
    expect(uploadPostImage).not.toHaveBeenCalled();
  });
  it('preserves retained IDs, replaces the complete ordered gallery, and revokes previews', async () => {
    const existing = {
      ...postFixture,
      images: [
        {
          id: IMAGE_ID,
          imageAssetId: IMAGE_ID,
          order: 0,
          createdAt: postFixture.createdAt,
          image: { id: IMAGE_ID, status: 'READY' as const, url: 'https://storage.test/old.png' },
        },
      ],
    };
    const { unmount } = renderWithQuery(<PostForm post={existing} onClose={vi.fn()} />);
    const user = userEvent.setup();
    await user.upload(screen.getByLabelText('Selecionar imagens'), picture());
    await user.click(screen.getByRole('button', { name: 'Salvar alterações' }));
    await waitFor(() =>
      expect(updatePost).toHaveBeenCalledWith(POST_ID, {
        content: existing.content,
        highlightLink: null,
        imageAssetIds: [IMAGE_ID, POST_ID],
      })
    );
    expect(uploadPostImage).toHaveBeenCalledTimes(1);
    unmount();
    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:preview');
  });
  it('does not post on upload failure; removes and revokes a selected preview', async () => {
    vi.mocked(uploadPostImage).mockRejectedValue(new Error('Upload falhou'));
    renderWithQuery(<PostForm onClose={vi.fn()} />);
    const user = userEvent.setup();
    await user.upload(screen.getByLabelText('Selecionar imagens'), picture());
    await fillAndSubmit();
    await screen.findByText('Upload falhou');
    expect(createPost).not.toHaveBeenCalled();
    await user.click(screen.getByRole('button', { name: 'Remover imagem 1' }));
    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:preview');
  });
});
