import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import SupporterMissionaryPage, { generateMetadata } from './page';

describe('Supporter Missionary Route (/profile/supporter/missionario/[username])', () => {
  it('generates proper title metadata for missionary', async () => {
    const meta = await generateMetadata({
      params: Promise.resolve({ username: '_SamiMendonca' }),
    });

    expect(meta.title).toContain('Samuel Mendonça');
  });

  it('renders missionary profile with supporter authenticated navbar and no edit profile button', async () => {
    const PageComponent = await SupporterMissionaryPage({
      params: Promise.resolve({ username: '_SamiMendonca' }),
    });

    render(PageComponent);

    // Supporter authenticated header components
    expect(
      screen.getByPlaceholderText(/buscar missionários, projetos, campanhas/i)
    ).toBeInTheDocument();

    // Missionary name rendered
    expect(screen.getByText('Samuel Mendonça')).toBeInTheDocument();

    // No "Editar perfil" button
    expect(screen.queryByRole('link', { name: /editar perfil/i })).not.toBeInTheDocument();

    // "Ofertar" button rendered
    expect(screen.getByRole('button', { name: /ofertar/i })).toBeInTheDocument();
  });
});
