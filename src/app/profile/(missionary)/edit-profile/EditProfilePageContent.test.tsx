import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import EditProfilePageContent from './EditProfilePageContent';
import { useProfileStore } from '@/stores/profileStore';

vi.mock('next/navigation', () => ({
  usePathname: () => '/profile/edit-profile',
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
  }),
}));

describe('EditProfilePageContent', () => {
  beforeEach(() => {
    useProfileStore.getState().reset();
  });

  it('waits for the fresh profile instead of editing the contact-less cache', () => {
    useProfileStore.setState({
      status: 'loading',
      profile: { ...useProfileStore.getState().profile, username: 'samuel_teste' },
    });

    render(<EditProfilePageContent />);

    expect(screen.getByRole('status', { name: /carregando dados do perfil/i })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: /editar perfil/i })).not.toBeInTheDocument();
  });

  it('renders ProfileEditForm with current store profile', () => {
    useProfileStore.setState({
      status: 'ready',
      profile: {
        ...useProfileStore.getState().profile,
        displayName: 'Pastor Samuel Teste',
        username: 'samuel_teste',
      },
    });

    render(<EditProfilePageContent />);

    expect(screen.getByRole('heading', { name: /editar perfil/i })).toBeInTheDocument();
    expect(screen.getByDisplayValue('Pastor Samuel Teste')).toBeInTheDocument();
    expect(screen.getByDisplayValue('samuel_teste')).toBeInTheDocument();
  });

  it('offers a retry instead of an endless skeleton when the fresh load fails', () => {
    useProfileStore.setState({ status: 'error', error: 'Servidor indisponível' });

    render(<EditProfilePageContent />);

    expect(screen.getByRole('alert')).toHaveTextContent('Servidor indisponível');
    expect(screen.getByRole('button', { name: /tentar novamente/i })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: /editar perfil/i })).not.toBeInTheDocument();
  });
});
