import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import MissionaryProfileLayout, { MissionaryProfileLoading } from './MissionaryProfileLayout';
import { useOwnerProfile } from './OwnerProfileProvider';
import { emptyProfile } from '@/services/profile.service';

const refresh = vi.fn();
const router = { push: vi.fn(), replace: vi.fn(), prefetch: vi.fn(), refresh };
vi.mock('next/navigation', () => ({
  usePathname: () => '/profile/sobre',
  useRouter: () => router,
  useSearchParams: () => new URLSearchParams(),
}));

const loadedProfile = { ...emptyProfile, username: 'daniel', displayName: 'Missionário Daniel' };

function OwnerName() {
  return <p>Dono: {useOwnerProfile().displayName}</p>;
}

describe('MissionaryProfileLayout', () => {
  beforeEach(() => {
    refresh.mockClear();
  });

  it('shows the area and shares the server-loaded profile with the page', () => {
    render(
      <MissionaryProfileLayout profile={loadedProfile}>
        <OwnerName />
      </MissionaryProfileLayout>
    );

    expect(screen.getByText('Dono: Missionário Daniel')).toBeInTheDocument();
    expect(screen.getAllByText('Missionário Daniel').length).toBeGreaterThan(0);
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('explains a failed load and retries by re-rendering on the server', async () => {
    const user = userEvent.setup();
    render(
      <MissionaryProfileLayout error="Servidor indisponível">
        <OwnerName />
      </MissionaryProfileLayout>
    );

    expect(screen.getByRole('alert')).toHaveTextContent('Servidor indisponível');
    expect(screen.queryByText(/Dono:/)).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Tentar novamente' }));
    expect(refresh).toHaveBeenCalledTimes(1);
  });

  it('falls back to a generic message when the error has no text', () => {
    render(
      <MissionaryProfileLayout>
        <OwnerName />
      </MissionaryProfileLayout>
    );

    expect(screen.getByRole('alert')).toHaveTextContent('Não foi possível carregar o seu perfil.');
  });

  it('announces the loading state while the profile streams in', () => {
    render(<MissionaryProfileLoading />);

    expect(screen.getByRole('status')).toHaveTextContent('Carregando seu perfil…');
    expect(screen.getByRole('status')).toHaveAttribute('aria-busy', 'true');
  });
});
