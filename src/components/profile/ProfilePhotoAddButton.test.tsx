import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import ProfilePhotoAddButton from './ProfilePhotoAddButton';

describe('ProfilePhotoAddButton', () => {
  it('renders the add-photo control with an accessible name', () => {
    render(
      <div style={{ position: 'relative' }}>
        <ProfilePhotoAddButton />
      </div>
    );

    expect(screen.getByRole('button', { name: /adicionar foto de perfil/i })).toBeInTheDocument();
  });

  it('keeps a custom label when used as a file picker', () => {
    render(
      <div style={{ position: 'relative' }}>
        <ProfilePhotoAddButton component="label" aria-label="Alterar foto de perfil">
          <input type="file" accept="image/*" hidden />
        </ProfilePhotoAddButton>
      </div>
    );

    expect(screen.getByLabelText(/alterar foto de perfil/i)).toBeInTheDocument();
  });
});
