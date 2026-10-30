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

  it('renders ProfileEditForm with current store profile', () => {
    useProfileStore.setState({
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
});
