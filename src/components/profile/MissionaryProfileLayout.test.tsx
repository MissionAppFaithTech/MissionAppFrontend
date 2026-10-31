import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import MissionaryProfileLayout from './MissionaryProfileLayout';
import { emptyProfile } from '@/services/profile.service';
import { useProfileStore } from '@/stores/profileStore';
import { useSessionStore, type SessionStatus } from '@/stores/sessionStore';

const replace = vi.fn();
const router = { push: vi.fn(), replace, prefetch: vi.fn(), refresh: vi.fn() };
vi.mock('next/navigation', () => ({
  usePathname: () => '/profile/sobre',
  useRouter: () => router,
  useSearchParams: () => new URLSearchParams(),
}));

const loadedProfile = { ...emptyProfile, username: 'daniel', displayName: 'Missionário Daniel' };

type SetupOptions = {
  session?: SessionStatus;
  role?: 'MISSIONARY' | 'SUPPORTER';
  fetchResult?: 'ready' | 'error';
};

function setup({
  session = 'authenticated',
  role = 'MISSIONARY',
  fetchResult = 'ready',
}: SetupOptions = {}) {
  const fetchProfile = vi.fn(async () => {
    if (fetchResult === 'ready') {
      useProfileStore.setState({ profile: loadedProfile, status: 'ready' });
      return loadedProfile;
    }
    useProfileStore.setState({ status: 'error', error: 'Servidor indisponível' });
    return null;
  });
  useProfileStore.setState({ fetchProfile });
  useSessionStore.setState({
    loadSession: vi.fn(async () => {
      useSessionStore.setState({ status: session, role: session === 'anonymous' ? null : role });
      return session;
    }),
  });
  return { fetchProfile };
}

function renderLayout() {
  return render(
    <MissionaryProfileLayout>
      <div data-testid="child-content">Conteúdo da aba</div>
    </MissionaryProfileLayout>
  );
}

describe('MissionaryProfileLayout', () => {
  beforeEach(() => {
    replace.mockClear();
    sessionStorage.clear();
    useProfileStore.setState({ profile: emptyProfile, status: 'idle', error: null });
  });

  it('shows an accessible loading state, then the page once the profile loads', async () => {
    const { fetchProfile } = setup();
    renderLayout();

    expect(screen.getByRole('status')).toHaveAttribute('aria-busy', 'true');
    expect(await screen.findByTestId('child-content')).toBeInTheDocument();
    expect(fetchProfile).toHaveBeenCalledTimes(1);
    expect(screen.getAllByText('Missionário Daniel').length).toBeGreaterThan(0);
  });

  it('offers a retry when the first load fails', async () => {
    setup({ fetchResult: 'error' });
    renderLayout();

    expect(await screen.findByRole('alert')).toHaveTextContent('Servidor indisponível');
    expect(screen.getByRole('button', { name: /tentar novamente/i })).toBeInTheDocument();
    expect(screen.queryByTestId('child-content')).not.toBeInTheDocument();
  });

  it('sends logged-out visitors to login', async () => {
    const { fetchProfile } = setup({ session: 'anonymous' });
    renderLayout();

    await waitFor(() => expect(replace).toHaveBeenCalledWith('/login?next=/profile'));
    expect(fetchProfile).not.toHaveBeenCalled();
  });

  it('sends supporters to the supporter area', async () => {
    const { fetchProfile } = setup({ role: 'SUPPORTER' });
    renderLayout();

    await waitFor(() => expect(replace).toHaveBeenCalledWith('/profile/supporter'));
    expect(fetchProfile).not.toHaveBeenCalled();
  });
});
