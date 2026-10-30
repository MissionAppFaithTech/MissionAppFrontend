import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import MissionaryProfileLayout from './MissionaryProfileLayout';
import { useProfileStore } from '@/stores/profileStore';

vi.mock('next/navigation', () => ({
  usePathname: () => '/profile/sobre',
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
  }),
}));

describe('MissionaryProfileLayout', () => {
  beforeEach(() => {
    useProfileStore.getState().reset();
  });

  it('renders children within profile layout and triggers profile fetch', () => {
    useProfileStore.setState({
      profile: {
        ...useProfileStore.getState().profile,
        displayName: 'Missionário Daniel',
      },
    });
    const fetchSpy = vi.spyOn(useProfileStore.getState(), 'fetchProfile');

    render(
      <MissionaryProfileLayout>
        <div data-testid="child-content">Conteúdo da Aba</div>
      </MissionaryProfileLayout>
    );

    expect(screen.getByTestId('child-content')).toBeInTheDocument();
    expect(screen.getByText('Missionário Daniel')).toBeInTheDocument();
    expect(fetchSpy).toHaveBeenCalled();
  });
});
