import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import ImpactProjectEditForm from '@/components/profile/ImpactProjectEditForm';

describe('ImpactProjectEditForm Component', () => {
  const mockProjectWithCampaign = {
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

  const mockProjectWithoutCampaign = {
    id: 'proj-2',
    title: 'Projeto Sem Campanha',
    description: 'Projeto social focado em desenvolvimento comunitário local.',
    imageUrl: '/images/projects/projeto-impacto.jpg',
    bannerUrl: '/images/projects/projeto-impacto.jpg',
    galleryImages: [],
    videoUrl: '',
    campaignTitle: undefined,
    campaignBadge: false,
  };

  beforeEach(() => {
    if (!global.URL.createObjectURL) {
      global.URL.createObjectURL = vi.fn(
        (file: Blob | MediaSource) => `blob:${(file as File).name || 'preview'}`
      );
    } else {
      vi.spyOn(global.URL, 'createObjectURL').mockImplementation(
        (file: Blob | MediaSource) => `blob:${(file as File).name || 'preview'}`
      );
    }
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders all project fields including banner upload, basic info, youtube video and gallery', () => {
    render(<ImpactProjectEditForm project={mockProjectWithCampaign} />);

    expect(screen.getByRole('heading', { name: /editar projeto de impacto/i })).toBeInTheDocument();
    expect(screen.getByDisplayValue(mockProjectWithCampaign.title)).toBeInTheDocument();
    expect(screen.getByDisplayValue(mockProjectWithCampaign.description)).toBeInTheDocument();
    expect(screen.getByAltText(/prévia da capa do projeto/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/upload de foto de capa/i)).toBeInTheDocument();
    expect(screen.getByDisplayValue(mockProjectWithCampaign.videoUrl)).toBeInTheDocument();

    // YouTube iframe preview
    expect(screen.getByTitle(/prévia do vídeo de apresentação/i)).toBeInTheDocument();

    // Gallery photos
    expect(screen.getByText(/fotos da galeria \(3\)/i)).toBeInTheDocument();
    expect(screen.getAllByAltText(/foto da galeria/i)).toHaveLength(3);
    expect(screen.getByLabelText(/upload de fotos da galeria/i)).toBeInTheDocument();

    // Actions
    expect(screen.getByRole('link', { name: /voltar/i })).toHaveAttribute(
      'href',
      '/profile/projetos-de-impacto'
    );
    expect(screen.getByRole('button', { name: /salvar/i })).toBeInTheDocument();
  });

  it('displays Campanha Ativa badge and title when linked by backend data', () => {
    render(<ImpactProjectEditForm project={mockProjectWithCampaign} />);

    expect(screen.getByText(/campanha vinculada/i)).toBeInTheDocument();
    expect(screen.getByText('Campanha Ativa')).toBeInTheDocument();
    expect(screen.getByText(mockProjectWithCampaign.campaignTitle)).toBeInTheDocument();

    // Manual input fields must be removed
    expect(
      screen.queryByPlaceholderText(/ex: campanha de educação & esperança/i)
    ).not.toBeInTheDocument();
    expect(screen.queryByRole('checkbox')).not.toBeInTheDocument();
  });

  it('displays placeholder waiting for backend integration when project is not linked to a campaign', () => {
    render(<ImpactProjectEditForm project={mockProjectWithoutCampaign} />);

    expect(screen.getByText(/campanha vinculada/i)).toBeInTheDocument();
    expect(screen.getByText(/aguardando integração com o backend/i)).toBeInTheDocument();
    expect(screen.queryByText('Campanha Ativa')).not.toBeInTheDocument();
  });

  it('allows uploading a new cover photo from the user device', async () => {
    const user = userEvent.setup();
    render(<ImpactProjectEditForm project={mockProjectWithCampaign} />);

    const coverFileInput = screen.getByLabelText(/upload de foto de capa/i);
    const newCoverFile = new File(['dummy-image'], 'new-cover.jpg', { type: 'image/jpeg' });

    await user.upload(coverFileInput, newCoverFile);

    const updatedCover = screen.getByAltText(/prévia da capa do projeto/i);
    expect(updatedCover).toBeInTheDocument();
  });

  it('allows uploading multiple gallery photos from user device and removing photos', async () => {
    const user = userEvent.setup();
    render(<ImpactProjectEditForm project={mockProjectWithCampaign} />);

    // Remove first photo
    const removeFirstBtn = screen.getByRole('button', { name: /remover foto 1 da galeria/i });
    await user.click(removeFirstBtn);

    expect(screen.getByText(/fotos da galeria \(2\)/i)).toBeInTheDocument();
    expect(screen.getAllByAltText(/foto da galeria/i)).toHaveLength(2);

    // Upload new photo files from device
    const galleryFileInput = screen.getByLabelText(/upload de fotos da galeria/i);
    const file1 = new File(['photo1'], 'photo1.png', { type: 'image/png' });
    const file2 = new File(['photo2'], 'photo2.png', { type: 'image/png' });

    await user.upload(galleryFileInput, [file1, file2]);

    expect(screen.getByText(/fotos da galeria \(4\)/i)).toBeInTheDocument();
    expect(screen.getAllByAltText(/foto da galeria/i)).toHaveLength(4);
  });

  it('submits updated project and calls onSave with toast notification', async () => {
    const user = userEvent.setup();
    const handleSave = vi.fn();
    render(<ImpactProjectEditForm project={mockProjectWithCampaign} onSave={handleSave} />);

    const titleInput = screen.getByDisplayValue(mockProjectWithCampaign.title);
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
