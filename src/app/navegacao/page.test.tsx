import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import NavigationPageContent from './NavigationPageContent';
import NavigationPage from './page';

// Mock next/navigation
vi.mock('next/navigation', () => ({
  usePathname: () => '/navegacao',
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
  }),
}));

describe('NavigationPage route (/navegacao)', () => {
  it('renders page layout with heading, search bar, categories, and initiatives', () => {
    render(<NavigationPageContent />);

    // Header
    expect(
      screen.getByRole('heading', { level: 1, name: /navegação & descoberta/i })
    ).toBeInTheDocument();

    // Search input
    const searchInput = screen.getByPlaceholderText(
      /buscar por nome do missionário, causa, projeto ou país/i
    );
    expect(searchInput).toBeInTheDocument();

    // Categories heading
    expect(
      screen.getByRole('heading', { level: 2, name: /categorias de atuação missionária/i })
    ).toBeInTheDocument();

    // Category buttons with icons & labels (GAIA)
    expect(screen.getByRole('button', { name: /educação infantil/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /saúde & nutrição/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /plantação de igrejas/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /tradução & bíblias/i })).toBeInTheDocument();

    // Bottom navigation bar present with default visitor view (3 icons)
    const visitorNav = screen.getByRole('navigation', { name: /navegação móvel do visitante/i });
    expect(visitorNav).toBeInTheDocument();
    expect(within(visitorNav).getByRole('link', { name: /explorar/i })).toBeInTheDocument();
    expect(within(visitorNav).getByRole('link', { name: /navegar/i })).toBeInTheDocument();
    expect(within(visitorNav).getByRole('link', { name: /entrar/i })).toBeInTheDocument();
  });

  it('filters initiatives dynamically by text query', async () => {
    const user = userEvent.setup();
    render(<NavigationPageContent />);

    const searchInput = screen.getByPlaceholderText(
      /buscar por nome do missionário, causa, projeto ou país/i
    );
    await user.type(searchInput, 'Moçambique');

    // Matching items visible
    expect(screen.getByText('Campanha Esperança & Dignidade em Moçambique')).toBeInTheDocument();
    expect(screen.getByText('Apoio Emergencial e Refúgio Familiar')).toBeInTheDocument();

    // Non-matching items not visible
    expect(screen.queryByText('Campanha de Educação & Esperança')).not.toBeInTheDocument();
  });

  it('displays missionary card with avatar and name when searching missionary name', async () => {
    const user = userEvent.setup();
    render(<NavigationPageContent />);

    const searchInput = screen.getByPlaceholderText(
      /buscar por nome do missionário, causa, projeto ou país/i
    );
    await user.type(searchInput, 'Samuel Mendonça');

    // Avatar with missionary name alt text
    const avatarImg = screen.getByAltText(/foto do missionário samuel mendonça/i);
    expect(avatarImg).toBeInTheDocument();

    // Username tag
    expect(screen.getByText('@_SamiMendonca')).toBeInTheDocument();

    // Direct profile link button
    const profileBtn = screen.getByRole('link', { name: /ver perfil do missionário/i });
    expect(profileBtn).toHaveAttribute('href', '/user/_SamiMendonca');
  });

  it('filters by type: Missionários shows dedicated missionary profile cards', async () => {
    const user = userEvent.setup();
    render(<NavigationPageContent />);

    const missionariosChip = screen.getByRole('button', { name: 'Missionários' });
    await user.click(missionariosChip);

    // Shows missionary cards with avatar and name
    expect(screen.getByAltText(/foto do missionário samuel mendonça/i)).toBeInTheDocument();
    expect(screen.getByAltText(/foto do missionário maria silva/i)).toBeInTheDocument();
    expect(screen.getByAltText(/foto do missionário joão pedro/i)).toBeInTheDocument();
    expect(screen.getByAltText(/foto do missionário ana costa/i)).toBeInTheDocument();

    // Does not show general campaigns
    expect(screen.queryByText('Campanha de Educação & Esperança')).not.toBeInTheDocument();
  });

  it('clears search query when clear button is clicked', async () => {
    const user = userEvent.setup();
    render(<NavigationPageContent />);

    const searchInput = screen.getByPlaceholderText(
      /buscar por nome do missionário, causa, projeto ou país/i
    );
    await user.type(searchInput, 'Moçambique');

    const clearButton = screen.getByRole('button', { name: /limpar busca/i });
    await user.click(clearButton);

    expect(searchInput).toHaveValue('');
  });

  it('displays informative empty state when search returns zero results and allows recovery', async () => {
    const user = userEvent.setup();
    render(<NavigationPageContent />);

    const searchInput = screen.getByPlaceholderText(
      /buscar por nome do missionário, causa, projeto ou país/i
    );
    await user.type(searchInput, 'termo_inexistente_xyz');

    expect(screen.getByText(/0 resultados encontrados/i)).toBeInTheDocument();
    expect(screen.getByText(/nenhuma iniciativa encontrada/i)).toBeInTheDocument();

    // Recovery action button
    const clearFiltersBtn = screen.getByRole('button', { name: /limpar busca e filtros/i });
    expect(clearFiltersBtn).toBeInTheDocument();
    await user.click(clearFiltersBtn);

    expect(searchInput).toHaveValue('');
  });

  it('dynamically switches Top Nav Bar and Bottom Nav Bar between Non-Registered, Missionary, and Supporter views', async () => {
    const user = userEvent.setup();
    render(<NavigationPageContent />);

    // Default view: Não Registrado (Visitante)
    // Top Bar has login/register
    const topNav = screen.getByRole('banner');
    expect(within(topNav).getByRole('link', { name: /^entrar$/i })).toBeInTheDocument();
    expect(within(topNav).getByRole('link', { name: /cadastre-se/i })).toBeInTheDocument();
    // Bottom Bar has 3 visitor icons
    const visitorNav = screen.getByRole('navigation', { name: /navegação móvel do visitante/i });
    expect(visitorNav).toBeInTheDocument();
    expect(within(visitorNav).getByRole('link', { name: /^entrar$/i })).toBeInTheDocument();

    // Switch to Missionary view
    const missionaryChip = screen.getByRole('button', { name: 'Missionário' });
    await user.click(missionaryChip);

    // Top Bar now has account menu avatar and quick search
    expect(
      within(topNav).getByRole('button', { name: /abrir menu do perfil/i })
    ).toBeInTheDocument();
    expect(
      within(topNav).getByPlaceholderText(/buscar missionários, projetos ou campanhas/i)
    ).toBeInTheDocument();
    expect(within(topNav).queryByRole('link', { name: /^entrar$/i })).not.toBeInTheDocument();

    // Bottom Bar now has 4 missionary icons (Perfil, Navegar, Explorar, Feed)
    const missionaryNav = screen.getByRole('navigation', {
      name: /navegação móvel do missionário/i,
    });
    expect(missionaryNav).toBeInTheDocument();
    expect(within(missionaryNav).getByRole('link', { name: /^perfil$/i })).toHaveAttribute(
      'href',
      '/profile'
    );
    expect(within(missionaryNav).getByRole('link', { name: /navegar/i })).toHaveAttribute(
      'href',
      '/navegacao'
    );
    expect(within(missionaryNav).getByRole('link', { name: /^projeto$/i })).toHaveAttribute(
      'href',
      '/profile/projetos-de-impacto'
    );
    expect(within(missionaryNav).getByRole('link', { name: /feed/i })).toHaveAttribute(
      'href',
      '/profile/postagens'
    );

    // Switch to Usuário Comum (Supporter) view
    const supporterChip = screen.getByRole('button', { name: 'Usuário Comum' });
    await user.click(supporterChip);

    // Bottom Bar now has 4 supporter icons (Feed, Navegar, Campanha, Meu Perfil)
    const supporterNav = screen.getByRole('navigation', { name: /navegação móvel do apoiador/i });
    expect(supporterNav).toBeInTheDocument();
    expect(within(supporterNav).getByRole('link', { name: /feed/i })).toHaveAttribute(
      'href',
      '/profile/supporter'
    );
    expect(within(supporterNav).getByRole('link', { name: /campanha/i })).toHaveAttribute(
      'href',
      '/campanha/campanha-educacao-esperanca'
    );
    expect(within(supporterNav).getByRole('link', { name: /meu perfil/i })).toHaveAttribute(
      'href',
      '/profile/supporter/edit-profile'
    );
  });

  it('renders root NavigationPage wrapper component inside Suspense', () => {
    render(<NavigationPage />);
    expect(
      screen.getByRole('heading', { level: 1, name: /navegação & descoberta/i })
    ).toBeInTheDocument();
  });
});
