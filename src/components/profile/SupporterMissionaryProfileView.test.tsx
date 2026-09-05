import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect } from 'vitest';
import SupporterMissionaryProfileView from './SupporterMissionaryProfileView';
import { mockCampaign } from '@/mocks/campaign';
import { mockProfile, mockSavedPosts } from '@/mocks/profile';

describe('SupporterMissionaryProfileView Component', () => {
  it('renders missionary header without "Editar perfil" and with "Ofertar" button', () => {
    render(<SupporterMissionaryProfileView profile={mockProfile} posts={mockSavedPosts} />);

    // Name and info
    expect(screen.getByText(mockProfile.displayName)).toBeInTheDocument();
    expect(screen.getByText(`@${mockProfile.username}`)).toBeInTheDocument();

    // No "Editar perfil" button
    expect(screen.queryByRole('link', { name: /editar perfil/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /editar perfil/i })).not.toBeInTheDocument();

    // Has "Ofertar" button
    const ofertarBtn = screen.getByRole('button', { name: /ofertar/i });
    expect(ofertarBtn).toBeInTheDocument();
  });

  it('opens DonationModal when clicking "Ofertar" button in the summary header', async () => {
    const user = userEvent.setup();
    render(<SupporterMissionaryProfileView profile={mockProfile} posts={mockSavedPosts} />);

    const ofertarBtn = screen.getByRole('button', { name: /ofertar/i });
    await user.click(ofertarBtn);

    expect(screen.getByRole('heading', { name: /ofertar na missão/i })).toBeInTheDocument();
    expect(
      screen.getByText(new RegExp(`apoie o ministério de ${mockProfile.displayName}`, 'i'))
    ).toBeInTheDocument();
  });

  it('displays only that missionary posts when accessing Postagens tab', async () => {
    const user = userEvent.setup();
    render(<SupporterMissionaryProfileView profile={mockProfile} posts={mockSavedPosts} />);

    const postagensTab = screen.getByRole('tab', { name: /postagens/i });
    await user.click(postagensTab);

    // No "+ Postar" button
    expect(screen.queryByRole('button', { name: /^\+?\s*postar$/i })).not.toBeInTheDocument();

    // No "Meu feed / Geral" tab switches
    expect(screen.queryByRole('tab', { name: /meu feed/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('tab', { name: /^geral$/i })).not.toBeInTheDocument();

    // Displays Samuel Mendonça's posts
    expect(screen.getByText(/orem pela liberação dos materiais da escola/i)).toBeInTheDocument();

    // Does NOT display Maria Silva's post or Lucas Moreira's post when viewing Samuel's profile
    expect(
      screen.queryByText(
        /distribuímos cestas básicas e kits escolares para 50 famílias em moçambique/i
      )
    ).not.toBeInTheDocument();
  });

  it('displays only Maria Silva posts when viewing Maria Silva profile', async () => {
    const user = userEvent.setup();
    const mariaProfile = {
      ...mockProfile,
      username: 'MariaSilva',
      displayName: 'Maria Silva',
    };

    render(<SupporterMissionaryProfileView profile={mariaProfile} posts={mockSavedPosts} />);

    const postagensTab = screen.getByRole('tab', { name: /postagens/i });
    await user.click(postagensTab);

    // Displays Maria Silva's post
    expect(
      screen.getByText(
        /distribuímos cestas básicas e kits escolares para 50 famílias em moçambique/i
      )
    ).toBeInTheDocument();

    // Does NOT display Samuel Mendonça's prayer request
    expect(
      screen.queryByText(/orem pela liberação dos materiais da escola/i)
    ).not.toBeInTheDocument();
  });

  it('switches to Sobre, Projetos, and Campanha tabs correctly', async () => {
    const user = userEvent.setup();
    render(<SupporterMissionaryProfileView profile={mockProfile} posts={mockSavedPosts} />);

    // Default is Sobre
    expect(screen.getByRole('heading', { name: /^sobre$/i })).toBeInTheDocument();
    expect(screen.getAllByText(mockProfile.about.introduction).length).toBeGreaterThanOrEqual(1);

    // Switch to Projetos
    const projetosTab = screen.getByRole('tab', { name: /projetos/i });
    await user.click(projetosTab);
    expect(screen.getByText(mockProfile.impactProject!.title)).toBeInTheDocument();

    // Switch to Campanha
    const campanhaTab = screen.getByRole('tab', { name: /campanha/i });
    await user.click(campanhaTab);
    expect(screen.getByRole('heading', { name: mockCampaign.title })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /ofertar na campanha/i })).toBeInTheDocument();
  });
});
