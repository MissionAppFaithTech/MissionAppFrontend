import { screen } from '@testing-library/react';
import { renderWithQuery } from '@/test/query';
import { describe, it, expect, vi } from 'vitest';
import EditProfilePageContent from './EditProfilePageContent';
import { OwnerProfileProvider } from '@/components/profile/OwnerProfileProvider';
import { emptyProfile } from '@/services/profile.service';

vi.mock('next/navigation', () => ({
  usePathname: () => '/profile/edit-profile',
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    refresh: vi.fn(),
    prefetch: vi.fn(),
  }),
}));

describe('EditProfilePageContent', () => {
  it('edits the profile the server layout loaded', () => {
    renderWithQuery(
      <OwnerProfileProvider
        profile={{ ...emptyProfile, displayName: 'Pastor Samuel Teste', username: 'samuel_teste' }}
      >
        <EditProfilePageContent />
      </OwnerProfileProvider>
    );

    expect(screen.getByRole('heading', { name: /editar perfil/i })).toBeInTheDocument();
    expect(screen.getByDisplayValue('Pastor Samuel Teste')).toBeInTheDocument();
    expect(screen.getByDisplayValue('samuel_teste')).toBeInTheDocument();
  });
});
