import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import ImpactProjectEditForm from '@/components/profile/ImpactProjectEditForm';

describe('ImpactProjectEditForm Component', () => {
  const mockProject = {
    id: 'proj-1',
    title: 'Projeto social na favela do Lixão',
    description: 'Ajude-nos a construir uma escola cristã na África do Sul.',
    imageUrl: '/images/projects/projeto-impacto.jpg',
    bannerUrl: '/images/projects/projeto-impacto.jpg',
    galleryImages: [
      '/landing-page/landing-page.png',
      '/images/projects/projeto-impacto.jpg',
      '/landing-page/background.png',
    ],
    videoUrl: 'https://www.youtube.com/watch?v=5dsGWM5XGdg',
    campaignTitle: 'Campanha de Educação & Esperança',
    campaignBadge: true,
  };

  it('renders all project fields including banner, basic info, campaign, youtube video and gallery', () => {
    render(<ImpactProjectEditForm project={mockProject} />);

    expect(screen.getByRole('heading', { name: /editar projeto de impacto/i })).toBeInTheDocument();
    expect(screen.getByDisplayValue(mockProject.title)).toBeInTheDocument();
    expect(screen.getByDisplayValue(mockProject.description)).toBeInTheDocument();
    expect(screen.getByDisplayValue(mockProject.bannerUrl)).toBeInTheDocument();
    expect(screen.getByDisplayValue(mockProject.campaignTitle)).toBeInTheDocument();
    expect(screen.getByDisplayValue(mockProject.videoUrl)).toBeInTheDocument();

    // YouTube iframe preview
    expect(screen.getByTitle(/prévia do vídeo de apresentação/i)).toBeInTheDocument();

    // Gallery photos
    expect(screen.getByText(/fotos da galeria \(3\)/i)).toBeInTheDocument();
    expect(screen.getAllByAltText(/foto da galeria/i)).toHaveLength(3);

    // Actions
    expect(screen.getByRole('link', { name: /voltar/i })).toHaveAttribute(
      'href',
      '/profile/projetos-de-impacto'
    );
    expect(screen.getByRole('button', { name: /salvar/i })).toBeInTheDocument();
  });

  it('allows adding and removing gallery photos', async () => {
    const user = userEvent.setup();
    render(<ImpactProjectEditForm project={mockProject} />);

    // Remove first photo
    const removeFirstBtn = screen.getByRole('button', { name: /remover foto 1 da galeria/i });
    await user.click(removeFirstBtn);

    expect(screen.getByText(/fotos da galeria \(2\)/i)).toBeInTheDocument();
    expect(screen.getAllByAltText(/foto da galeria/i)).toHaveLength(2);

    // Add new photo
    const newImageInput = screen.getByLabelText(/url da nova foto/i);
    await user.type(newImageInput, '/images/new-photo.jpg');

    const addBtn = screen.getByRole('button', { name: /adicionar foto/i });
    await user.click(addBtn);

    expect(screen.getByText(/fotos da galeria \(3\)/i)).toBeInTheDocument();
    expect(screen.getAllByAltText(/foto da galeria/i)).toHaveLength(3);
  });

  it('submits updated project and calls onSave with toast notification', async () => {
    const user = userEvent.setup();
    const handleSave = vi.fn();
    render(<ImpactProjectEditForm project={mockProject} onSave={handleSave} />);

    const titleInput = screen.getByDisplayValue(mockProject.title);
    await user.clear(titleInput);
    await user.type(titleInput, 'Novo Título do Projeto');

    const saveBtn = screen.getByRole('button', { name: /salvar/i });
    await user.click(saveBtn);

    expect(handleSave).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Novo Título do Projeto',
      })
    );
    expect(screen.getByText(/projeto de impacto atualizado com sucesso!/i)).toBeInTheDocument();
  });
});
