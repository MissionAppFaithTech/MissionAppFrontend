import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { cacheLife } from 'next/cache';
import { UserProfileBody, UserProfileContent } from './UserProfileContent';

vi.mock('next/cache', () => ({ cacheLife: vi.fn() }));

describe('UserProfileContent', () => {
  it('renders the public profile in the main landmark with the guest notices', async () => {
    render(await UserProfileContent({ username: '_SamiMendonca' }));

    expect(screen.getByRole('main')).toHaveAttribute('id', 'main-content');
    expect(screen.getByText(/crie sua conta para acompanhar/i)).toBeInTheDocument();
    expect(screen.getByText(/entre para ver o perfil completo/i)).toBeInTheDocument();
    expect(cacheLife).toHaveBeenCalledWith('public');
  });

  it('passes the username from the params promise to the cached content', async () => {
    const element = await UserProfileBody({ params: Promise.resolve({ username: 'ana' }) });
    expect(element.props).toEqual({ username: 'ana' });
  });
});
