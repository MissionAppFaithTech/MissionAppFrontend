import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import ImpactProjectEditForm from '@/components/profile/ImpactProjectEditForm';
import { ApiError } from '@/lib/api/client';

const project = {
  id: 'proj-1',
  title: 'Escola na Comunidade',
  description: 'Construção de uma escola comunitária no interior.',
  imageUrl: 'https://cdn.test/covers/a.webp',
  videoUrl: 'https://www.youtube.com/embed/Bll78RzRaaU',
  campaignTitle: 'Campanha de Educação & Esperança',
  campaignBadge: true,
};

const cover = (type = 'image/jpeg', size = 1024) => {
  const file = new File(['x'], 'capa.jpg', { type });
  Object.defineProperty(file, 'size', { value: size });
  return file;
};

describe('ImpactProjectEditForm', () => {
  beforeEach(() => {
    global.URL.createObjectURL = vi.fn(() => 'blob:preview');
    global.URL.revokeObjectURL = vi.fn();
  });
  afterEach(() => vi.restoreAllMocks());

  it('prefills the existing project in edit mode', () => {
    render(<ImpactProjectEditForm project={project} onSubmit={vi.fn()} onDelete={vi.fn()} />);

    expect(screen.getByRole('heading', { name: /editar projeto de impacto/i })).toBeInTheDocument();
    expect(screen.getByDisplayValue(project.title)).toBeInTheDocument();
    expect(screen.getByDisplayValue(project.videoUrl)).toBeInTheDocument();
    expect(screen.getByAltText(/prévia da capa do projeto/i)).toBeInTheDocument();
    expect(screen.getByTitle(/prévia do vídeo de apresentação/i)).toBeInTheDocument();
    expect(screen.getByText('Campanha Ativa')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /voltar/i })).toHaveAttribute(
      'href',
      '/profile/projetos-de-impacto'
    );
    expect(screen.getByRole('button', { name: /excluir projeto/i })).toBeInTheDocument();
  });

  it('requires a cover when creating and does not submit without it', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<ImpactProjectEditForm onSubmit={onSubmit} />);

    expect(screen.getByRole('heading', { name: /criar projeto de impacto/i })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /excluir projeto/i })).not.toBeInTheDocument();

    await user.type(screen.getByLabelText(/título do projeto/i), 'Meu projeto');
    await user.type(screen.getByLabelText(/descrição detalhada/i), 'Descrição');
    await user.click(screen.getByRole('button', { name: /criar projeto/i }));

    expect(await screen.findByText(/selecione uma foto de capa/i)).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('rejects covers with an unsupported type or above 10 MB', async () => {
    const user = userEvent.setup({ applyAccept: false });
    render(<ImpactProjectEditForm onSubmit={vi.fn()} />);
    const input = screen.getByLabelText(/upload de foto de capa/i);

    await user.upload(input, cover('image/gif'));
    expect(await screen.findByText(/jpg, png ou webp\./i)).toBeInTheDocument();

    await user.upload(input, cover('image/png', 10 * 1024 * 1024 + 1));
    expect(await screen.findByText(/no máximo 10 mb/i)).toBeInTheDocument();
    expect(input).toHaveAttribute('aria-invalid', 'true');
  });

  it('rejects video links that are not YouTube or Vimeo', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<ImpactProjectEditForm project={project} onSubmit={onSubmit} />);

    const video = screen.getByLabelText(/link do vídeo/i);
    await user.clear(video);
    await user.type(video, 'https://example.com/video');
    await user.click(screen.getByRole('button', { name: /^salvar$/i }));

    expect(await screen.findByText(/youtube ou do vimeo/i)).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('submits the values with the chosen cover file', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    render(<ImpactProjectEditForm onSubmit={onSubmit} />);

    const file = cover();
    await user.type(screen.getByLabelText(/título do projeto/i), '  Escola  ');
    await user.type(screen.getByLabelText(/descrição detalhada/i), 'Descrição');
    await user.upload(screen.getByLabelText(/upload de foto de capa/i), file);
    await user.click(screen.getByRole('button', { name: /criar projeto/i }));

    await waitFor(() =>
      expect(onSubmit).toHaveBeenCalledWith({
        title: 'Escola',
        description: 'Descrição',
        videoUrl: '',
        coverFile: file,
      })
    );
  });

  it('shows server field errors and a general alert when saving fails', async () => {
    const user = userEvent.setup();
    const onSubmit = vi
      .fn()
      .mockRejectedValue(
        new ApiError('Dados do projeto de impacto inválidos', 422, { title: 'Título já usado' })
      );
    render(<ImpactProjectEditForm project={project} onSubmit={onSubmit} />);

    await user.click(screen.getByRole('button', { name: /^salvar$/i }));

    expect(await screen.findByText('Título já usado')).toBeInTheDocument();
    expect(await screen.findByRole('alert')).toHaveTextContent(/dados do projeto/i);
  });

  it('asks for confirmation before deleting', async () => {
    const user = userEvent.setup();
    const onDelete = vi.fn().mockResolvedValue(undefined);
    render(<ImpactProjectEditForm project={project} onSubmit={vi.fn()} onDelete={onDelete} />);

    await user.click(screen.getByRole('button', { name: /excluir projeto/i }));
    const dialog = await screen.findByRole('dialog', { name: /excluir projeto de impacto\?/i });
    expect(onDelete).not.toHaveBeenCalled();

    await user.click(screen.getByRole('button', { name: /^excluir$/i }));
    expect(onDelete).toHaveBeenCalledTimes(1);
    expect(dialog).toBeInTheDocument();
  });

  it('keeps the dialog open and reports a failed delete', async () => {
    const user = userEvent.setup();
    const onDelete = vi.fn().mockRejectedValue(new Error('Sem permissão'));
    render(<ImpactProjectEditForm project={project} onSubmit={vi.fn()} onDelete={onDelete} />);

    await user.click(screen.getByRole('button', { name: /excluir projeto/i }));
    await user.click(await screen.findByRole('button', { name: /^excluir$/i }));

    expect(await screen.findByText('Sem permissão')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^excluir$/i })).toBeEnabled();
  });
});
