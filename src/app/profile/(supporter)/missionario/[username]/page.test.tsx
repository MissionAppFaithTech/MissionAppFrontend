import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { getPublicProfile } from '@/lib/server/publicProfile';
import { publicProfileFixture } from '@/test/publicProfile';
import SupporterMissionaryPage, { generateMetadata } from './page';

vi.mock('@/lib/server/publicProfile', () => ({ getPublicProfile: vi.fn() }));

vi.mock('./MissionaryProfileContent', () => ({
  MissionaryProfileBody: () => <div data-testid="missionary-profile-body" />,
}));

describe('Supporter Missionary Route (/profile/supporter/missionario/[username])', () => {
  it('generates proper title metadata for missionary', async () => {
    vi.mocked(getPublicProfile).mockResolvedValue(publicProfileFixture);
    const meta = await generateMetadata({
      params: Promise.resolve({ username: '_SamiMendonca' }),
    });

    expect(meta.title).toContain('Samuel Mendonça');
  });

  it('renders the supporter navbar and the main landmark around the streamed profile', () => {
    render(SupporterMissionaryPage({ params: Promise.resolve({ username: '_SamiMendonca' }) }));

    expect(
      screen.getByPlaceholderText(/buscar missionários, projetos, campanhas/i)
    ).toBeInTheDocument();
    const main = screen.getByRole('main');
    expect(main).toHaveAttribute('id', 'main-content');
    expect(screen.getByTestId('missionary-profile-body')).toBeInTheDocument();
  });
});
