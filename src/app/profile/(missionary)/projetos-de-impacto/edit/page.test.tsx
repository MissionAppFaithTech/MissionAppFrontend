import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import EditImpactProjectPage from '@/app/profile/(missionary)/projetos-de-impacto/edit/page';
import { buildUpdate } from '@/app/profile/(missionary)/projetos-de-impacto/edit/ImpactProjectEditPageContent';
import ImpactProjectsPage from '@/app/profile/(missionary)/projetos-de-impacto/page';
import * as service from '@/services/impactProject.service';
import { useFeedbackStore } from '@/stores/feedbackStore';
import { OwnerProfileProvider } from '@/components/profile/OwnerProfileProvider';
import { emptyProfile } from '@/services/profile.service';

const push = vi.fn();

const renderPage = (ui: React.ReactElement) =>
  render(
    <OwnerProfileProvider profile={{ ...emptyProfile, missionaryId: 'm-1', displayName: 'Samuel' }}>
      {ui}
    </OwnerProfileProvider>
  );
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push, replace: vi.fn(), prefetch: vi.fn() }),
  usePathname: () => '/profile/projetos-de-impacto',
}));

vi.mock('@/services/impactProject.service', async (importOriginal) => ({
  ...(await importOriginal<typeof service>()),
  getMissionaryImpactProject: vi.fn(),
  uploadCoverImage: vi.fn(),
  createImpactProject: vi.fn(),
  updateImpactProject: vi.fn(),
  deleteImpactProject: vi.fn(),
}));

const project = {
  id: 'p-1',
  title: 'Escola na Comunidade',
  description: 'Construção de uma escola.',
  imageUrl: 'https://cdn.test/c.webp',
};

beforeEach(() => {
  push.mockClear();
  vi.mocked(service.getMissionaryImpactProject).mockReset();
  vi.mocked(service.uploadCoverImage).mockReset();
  vi.mocked(service.createImpactProject).mockReset();
  vi.mocked(service.updateImpactProject).mockReset();
  vi.mocked(service.deleteImpactProject).mockReset();
  useFeedbackStore.setState({ current: null });
  global.URL.createObjectURL = vi.fn(() => 'blob:preview');
  global.URL.revokeObjectURL = vi.fn();
});

describe('ImpactProjectsPage', () => {
  it('shows the missionary project loaded from the backend', async () => {
    vi.mocked(service.getMissionaryImpactProject).mockResolvedValue(project);
    renderPage(<ImpactProjectsPage />);

    expect(
      await screen.findByRole('heading', { name: /escola na comunidade/i })
    ).toBeInTheDocument();
    expect(service.getMissionaryImpactProject).toHaveBeenCalledWith('m-1');
  });

  it('shows the creation form in the tab, then the project once it is created', async () => {
    vi.mocked(service.getMissionaryImpactProject)
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(project);
    vi.mocked(service.uploadCoverImage).mockResolvedValue('asset-1');
    vi.mocked(service.createImpactProject).mockResolvedValue(project);
    const user = userEvent.setup();
    renderPage(<ImpactProjectsPage />);

    expect(
      await screen.findByRole('heading', { name: /criar projeto de impacto/i })
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('link', { name: /criar projeto de impacto/i })
    ).not.toBeInTheDocument();

    await user.type(screen.getByLabelText(/título do projeto/i), 'Escola');
    await user.type(screen.getByLabelText(/descrição detalhada/i), 'Descrição');
    await user.upload(
      screen.getByLabelText(/upload de foto de capa/i),
      new File(['x'], 'capa.jpg', { type: 'image/jpeg' })
    );
    await user.click(screen.getByRole('button', { name: /criar projeto/i }));

    await waitFor(() => expect(service.createImpactProject).toHaveBeenCalled());
    expect(
      await screen.findByRole('heading', { name: /escola na comunidade/i })
    ).toBeInTheDocument();
    expect(push).not.toHaveBeenCalled();
  });

  it('offers a retry when loading fails', async () => {
    vi.mocked(service.getMissionaryImpactProject)
      .mockRejectedValueOnce(new Error('Falha de rede'))
      .mockResolvedValueOnce(project);
    const user = userEvent.setup();
    renderPage(<ImpactProjectsPage />);

    expect(await screen.findByRole('alert')).toHaveTextContent('Falha de rede');
    await user.click(screen.getByRole('button', { name: /tentar novamente/i }));
    expect(
      await screen.findByRole('heading', { name: /escola na comunidade/i })
    ).toBeInTheDocument();
  });
});

describe('EditImpactProjectPage', () => {
  it('creates the project: uploads the cover, then posts with the asset id', async () => {
    vi.mocked(service.getMissionaryImpactProject).mockResolvedValue(null);
    vi.mocked(service.uploadCoverImage).mockResolvedValue('asset-1');
    vi.mocked(service.createImpactProject).mockResolvedValue(project);
    const user = userEvent.setup();
    renderPage(<EditImpactProjectPage />);

    await user.type(await screen.findByLabelText(/título do projeto/i), 'Escola');
    await user.type(screen.getByLabelText(/descrição detalhada/i), 'Descrição');
    await user.type(screen.getByLabelText(/link do vídeo/i), 'https://youtu.be/dQw4w9WgXcQ');
    const file = new File(['x'], 'capa.jpg', { type: 'image/jpeg' });
    await user.upload(screen.getByLabelText(/upload de foto de capa/i), file);
    await user.click(screen.getByRole('button', { name: /criar projeto/i }));

    await waitFor(() =>
      expect(service.createImpactProject).toHaveBeenCalledWith({
        title: 'Escola',
        description: 'Descrição',
        coverImageAssetId: 'asset-1',
        videoUrl: 'https://youtu.be/dQw4w9WgXcQ',
      })
    );
    expect(service.uploadCoverImage).toHaveBeenCalledWith(file);
    expect(push).toHaveBeenCalledWith('/profile/projetos-de-impacto');
    expect(useFeedbackStore.getState().current).toMatchObject({ severity: 'success' });
  });

  it('keeps the form and shows the error when the upload fails', async () => {
    vi.mocked(service.getMissionaryImpactProject).mockResolvedValue(null);
    vi.mocked(service.uploadCoverImage).mockRejectedValue(new Error('Falha no envio'));
    const user = userEvent.setup();
    renderPage(<EditImpactProjectPage />);

    await user.type(await screen.findByLabelText(/título do projeto/i), 'Escola');
    await user.type(screen.getByLabelText(/descrição detalhada/i), 'Descrição');
    await user.upload(
      screen.getByLabelText(/upload de foto de capa/i),
      new File(['x'], 'capa.jpg', { type: 'image/jpeg' })
    );
    await user.click(screen.getByRole('button', { name: /criar projeto/i }));

    expect(await screen.findByText('Falha no envio')).toBeInTheDocument();
    expect(service.createImpactProject).not.toHaveBeenCalled();
    expect(push).not.toHaveBeenCalled();
  });

  it('updates only the changed fields', async () => {
    vi.mocked(service.getMissionaryImpactProject).mockResolvedValue(project);
    vi.mocked(service.updateImpactProject).mockResolvedValue(project);
    const user = userEvent.setup();
    renderPage(<EditImpactProjectPage />);

    const title = await screen.findByLabelText(/título do projeto/i);
    await user.clear(title);
    await user.type(title, 'Novo título');
    await user.click(screen.getByRole('button', { name: /^salvar$/i }));

    await waitFor(() =>
      expect(service.updateImpactProject).toHaveBeenCalledWith('p-1', { title: 'Novo título' })
    );
    expect(service.uploadCoverImage).not.toHaveBeenCalled();
  });

  it('deletes the project after confirmation and goes back', async () => {
    vi.mocked(service.getMissionaryImpactProject).mockResolvedValue(project);
    vi.mocked(service.deleteImpactProject).mockResolvedValue(undefined);
    const user = userEvent.setup();
    renderPage(<EditImpactProjectPage />);

    await user.click(await screen.findByRole('button', { name: /excluir projeto/i }));
    await user.click(await screen.findByRole('button', { name: /^excluir$/i }));

    await waitFor(() => expect(service.deleteImpactProject).toHaveBeenCalledWith('p-1'));
    expect(push).toHaveBeenCalledWith('/profile/projetos-de-impacto');
  });
});

describe('buildUpdate', () => {
  const values = {
    title: 'Escola na Comunidade',
    description: 'Construção de uma escola.',
    videoUrl: '',
  };

  it('is empty when nothing changed', () => {
    expect(buildUpdate(project, values)).toEqual({});
  });

  it('sends a null video when it was cleared, and the new cover asset', () => {
    const withVideo = { ...project, videoUrl: 'https://www.youtube.com/embed/abc' };
    expect(buildUpdate(withVideo, values, 'asset-2')).toEqual({
      videoUrl: null,
      coverImageAssetId: 'asset-2',
    });
  });
});
