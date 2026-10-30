import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useProfileStore } from './profileStore';
import * as profileService from '@/services/profile.service';

vi.mock('@/services/profile.service', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/services/profile.service')>();
  return {
    ...actual,
    fetchAccountProfile: vi.fn(),
    updateAccountProfile: vi.fn(),
    updateMissionaryAboutData: vi.fn(),
    updateMissionaryProfileData: vi.fn(),
    updateMissionaryWorkAddress: vi.fn(),
  };
});

describe('profileStore', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useProfileStore.getState().reset();
  });

  it('starts with initial empty profile retaining only mocked statistics', () => {
    const { profile, isLoading, error } = useProfileStore.getState();
    expect(profile).toBeDefined();
    expect(profile.displayName).toBe('');
    expect(profile.username).toBe('');
    expect(profile.roleDescription).toBe('');
    expect(profile.location).toBe('');
    expect(profile.about.introduction).toBe('');
    expect(profile.projectsCount).toBe(25);
    expect(profile.postsCount).toBe(3);
    expect(profile.supportersCount).toBe('1.2k');
    expect(isLoading).toBe(false);
    expect(error).toBeNull();
  });

  it('fetches and maps account profile from backend', async () => {
    vi.mocked(profileService.fetchAccountProfile).mockResolvedValueOnce({
      user: {
        id: 'u-1',
        fullName: 'Pr. Marcos Souza',
        username: 'marcos_souza',
        biography: 'Missionário no Sertão Nordestino',
      },
      missionary: {
        id: '018f9999-9999-7999-8999-999999999999',
        aboutMe: 'Sobre atualizado pelo backend',
        originLocation: 'Fortaleza/CE',
      },
    });

    await useProfileStore.getState().fetchProfile();

    const { profile, isLoading, error } = useProfileStore.getState();
    expect(isLoading).toBe(false);
    expect(error).toBeNull();
    expect(profile.displayName).toBe('Pr. Marcos Souza');
    expect(profile.username).toBe('marcos_souza');
    expect(profile.roleDescription).toBe('Missionário no Sertão Nordestino');
    expect(profile.about.introduction).toBe('Sobre atualizado pelo backend');
    expect(profile.about.originLocation).toBe('Fortaleza/CE');
  });

  it('updates about section and calls updateMissionaryAboutData', async () => {
    vi.mocked(profileService.updateMissionaryAboutData).mockResolvedValueOnce();

    await useProfileStore.getState().updateAbout({
      introduction: 'Nova biografia e história de vida',
      prayerRequests: 'Pelos novos convertidos',
    });

    const { profile } = useProfileStore.getState();
    expect(profileService.updateMissionaryAboutData).toHaveBeenCalledWith(
      expect.objectContaining({
        aboutMe: 'Nova biografia e história de vida',
        prayerRequest: 'Pelos novos convertidos',
      })
    );
    expect(profile.about.introduction).toBe('Nova biografia e história de vida');
    expect(profile.about.prayerRequests).toBe('Pelos novos convertidos');
  });

  it('updates header and contact fields calling backend services', async () => {
    vi.mocked(profileService.updateAccountProfile).mockResolvedValueOnce();
    vi.mocked(profileService.updateMissionaryProfileData).mockResolvedValueOnce();

    await useProfileStore.getState().updateHeaderProfile({
      displayName: 'Carlos Novo Nome',
      bio: 'Nova minibiografia de teste',
      publicEmail: 'contato@carlos.org',
      publicPhone: '+5585999999999',
    });

    expect(profileService.updateAccountProfile).toHaveBeenCalledWith({
      fullName: 'Carlos Novo Nome',
      username: undefined,
      biography: 'Nova minibiografia de teste',
    });

    expect(profileService.updateMissionaryProfileData).toHaveBeenCalledWith({
      publicEmail: 'contato@carlos.org',
      publicPhone: '+5585999999999',
    });

    const { profile } = useProfileStore.getState();
    expect(profile.displayName).toBe('Carlos Novo Nome');
    expect(profile.roleDescription).toBe('Nova minibiografia de teste');
    expect(profile.contact?.publicEmail).toBe('contato@carlos.org');
    expect(profile.contact?.publicPhone).toBe('+5585999999999');
  });

  it('updates work address and calls updateMissionaryWorkAddress', async () => {
    vi.mocked(profileService.updateMissionaryWorkAddress).mockResolvedValueOnce();

    await useProfileStore.getState().updateWorkAddress({
      city: 'Manaus',
      state: 'AM',
      country: 'Brasil',
      district: 'Centro',
      zip: '69000-000',
    });

    expect(profileService.updateMissionaryWorkAddress).toHaveBeenCalledWith({
      city: 'Manaus',
      state: 'AM',
      country: 'Brasil',
      district: 'Centro',
      zip: '69000-000',
    });

    const { profile } = useProfileStore.getState();
    expect(profile.location).toBe('Manaus/AM');
    expect(profile.about.currentLocation).toBe('Manaus/AM');
  });

  it('resets profile to initial state', () => {
    useProfileStore.setState({
      profile: {
        ...useProfileStore.getState().profile,
        displayName: 'Alterado',
      },
    });

    useProfileStore.getState().reset();
    expect(useProfileStore.getState().profile.displayName).toBe('');
  });
});
