import { screen } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { renderWithQuery } from '@/test/query';
import { emptyProfile } from '@/services/profile.service';
import { loadMyProfile } from '@/lib/server/profile';
import SupporterSettingsPage, { SupporterAccountSettings } from './page';

vi.mock('next/navigation', async () => {
  const actual = await vi.importActual('next/navigation');
  return {
    ...actual,
    useRouter: () => ({
      push: vi.fn(),
      replace: vi.fn(),
      refresh: vi.fn(),
      prefetch: vi.fn(),
    }),
  };
});

vi.mock('@/lib/server/profile', () => ({
  loadMyProfile: vi.fn(),
}));

describe('SupporterSettingsPage (/profile/supporter/settings)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the authenticated supporter email and linked faith community from the server profile', async () => {
    vi.mocked(loadMyProfile).mockResolvedValue({
      kind: 'ok',
      profile: {
        ...emptyProfile,
        role: 'supporter',
        contact: {
          publicEmail: '',
          publicPhone: '',
          accountEmail: 'apoiador.real@missao.org',
        },
        about: {
          ...emptyProfile.about,
          faithCommunity: 'Igreja do Apoiador',
          faithCommunityId: '019a0000-0000-7000-9000-00000000c001',
        },
      },
    });

    renderWithQuery(await SupporterAccountSettings());

    expect(screen.getAllByText('apoiador.real@missao.org').length).toBeGreaterThan(0);
    expect(
      screen.getByRole('combobox', { name: /comunidade de fé \(igreja\) \(opcional\)/i })
    ).toHaveValue('Igreja do Apoiador');
  });

  it('falls back to default supporter view when unauthenticated or profile fails to load', async () => {
    vi.mocked(loadMyProfile).mockResolvedValue({ kind: 'anonymous' });

    renderWithQuery(await SupporterAccountSettings());

    expect(screen.getAllByText('soraia.santos@email.com').length).toBeGreaterThan(0);
  });

  it('wraps SupporterAccountSettings in a Suspense boundary with a supporter fallback', () => {
    const tree = SupporterSettingsPage();
    expect(tree.props.fallback).toBeDefined();
  });
});
