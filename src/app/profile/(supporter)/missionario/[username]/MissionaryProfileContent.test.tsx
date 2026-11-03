import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { cacheLife } from 'next/cache';
import { MissionaryProfileBody, MissionaryProfileContent } from './MissionaryProfileContent';

vi.mock('next/cache', () => ({ cacheLife: vi.fn() }));

describe('MissionaryProfileContent', () => {
  it('renders the missionary profile without the owner edit button', async () => {
    render(await MissionaryProfileContent({ username: '_SamiMendonca' }));

    expect(screen.getByText('Samuel Mendonça')).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /editar perfil/i })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /ofertar/i })).toBeInTheDocument();
    expect(cacheLife).toHaveBeenCalledWith('public');
  });

  it('passes the username from the params promise to the cached content', async () => {
    const element = await MissionaryProfileBody({ params: Promise.resolve({ username: 'ana' }) });
    expect(element.props).toEqual({ username: 'ana' });
  });
});
