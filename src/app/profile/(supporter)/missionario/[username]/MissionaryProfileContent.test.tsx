import { render, screen } from '@testing-library/react';
import { beforeEach, describe, it, expect, vi } from 'vitest';
import { getPublicProfile } from '@/lib/server/publicProfile';
import { publicProfileFixture } from '@/test/publicProfile';
import { MissionaryProfileBody, MissionaryProfileContent } from './MissionaryProfileContent';

vi.mock('@/lib/server/publicProfile', () => ({ getPublicProfile: vi.fn() }));
vi.mock('next/navigation', async () => ({
  ...(await vi.importActual('next/navigation')),
  notFound: vi.fn(() => {
    throw new Error('NEXT_NOT_FOUND');
  }),
}));

describe('MissionaryProfileContent', () => {
  beforeEach(() => {
    vi.mocked(getPublicProfile).mockReset();
  });

  it('renders the backend profile without the owner edit button', async () => {
    vi.mocked(getPublicProfile).mockResolvedValue(publicProfileFixture);

    render(await MissionaryProfileContent({ username: 'samuel_missionary' }));

    expect(screen.getByRole('heading', { level: 1, name: /samuel mendonça/i })).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /editar perfil/i })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /ofertar/i })).toBeInTheDocument();
  });

  it('answers 404 when there is no visible profile', async () => {
    vi.mocked(getPublicProfile).mockResolvedValue(null);

    await expect(MissionaryProfileContent({ username: 'x_y_z' })).rejects.toThrow('NEXT_NOT_FOUND');
  });

  it('passes the username from the params promise to the content', async () => {
    const element = await MissionaryProfileBody({ params: Promise.resolve({ username: 'ana' }) });
    expect(element.props).toEqual({ username: 'ana' });
  });
});
