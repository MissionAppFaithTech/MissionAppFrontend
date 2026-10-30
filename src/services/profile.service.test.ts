import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  changeAccountPassword,
  fetchAccountProfile,
  mapBackendToProfileData,
  updateAccountProfile,
  updateMissionaryAboutData,
  updateMissionaryIdentity,
  updateMissionaryProfileData,
  updateMissionaryWorkAddress,
} from './profile.service';
import { mockProfile } from '@/mocks/profile';

describe('profile.service', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('mapBackendToProfileData', () => {
    it('maps backend user, missionary, and workAddress to ProfileData correctly', () => {
      const backendData = {
        user: {
          id: 'u-1',
          fullName: 'Pastor Elias',
          username: 'pastor_elias',
          biography: 'Missionário no Amazonas',
        },
        missionary: {
          id: '018f1111-2222-3333-4444-555555555555',
          aboutMe: 'Trabalho com ribeirinhos',
          missionStorySummary: '10 anos de ministério',
          originLocation: 'Manaus/AM',
          faithCommunityId: 'fc-10',
          prayerRequest: 'Por sustento e saúde',
          lifeVerse: 'Isaías 6:8',
          publicEmail: 'elias@missao.org',
          publicPhone: '+5592999999999',
          donationMessage: 'Deus abençoe suas ofertas',
        },
        workAddress: {
          city: 'Parintins',
          state: 'AM',
        },
      };

      const result = mapBackendToProfileData(backendData, mockProfile);

      expect(result.displayName).toBe('Pastor Elias');
      expect(result.username).toBe('pastor_elias');
      expect(result.roleDescription).toBe('Missionário no Amazonas');
      expect(result.location).toBe('Parintins/AM');
      expect(result.about.introduction).toBe('Trabalho com ribeirinhos');
      expect(result.about.missionHistory).toBe('10 anos de ministério');
      expect(result.about.originLocation).toBe('Manaus/AM');
      expect(result.about.currentLocation).toBe('Parintins/AM');
      expect(result.about.faithCommunity).toBe('fc-10');
      expect(result.about.prayerRequests).toBe('Por sustento e saúde');
      expect(result.about.lifeVerse).toBe('Isaías 6:8');
      expect(result.contact?.publicEmail).toBe('elias@missao.org');
      expect(result.contact?.publicPhone).toBe('+5592999999999');
      expect(result.financial?.supporterMessage).toBe('Deus abençoe suas ofertas');
    });

    it('falls back to provided fallback ProfileData when fields are missing', () => {
      const result = mapBackendToProfileData({}, mockProfile);
      expect(result.displayName).toBe(mockProfile.displayName);
      expect(result.username).toBe(mockProfile.username);
    });

    it('defaults to emptyProfile when fallback is omitted and fields are missing', () => {
      const result = mapBackendToProfileData({});
      expect(result.displayName).toBe('');
      expect(result.username).toBe('');
      expect(result.roleDescription).toBe('');
      expect(result.about.introduction).toBe('');
      expect(result.projectsCount).toBe(25);
      expect(result.postsCount).toBe(3);
      expect(result.campaignsCount).toBe(4);
      expect(result.supportersCount).toBe('1.2k');
      expect(result.followingCount).toBe(12);
    });
  });

  describe('fetchAccountProfile', () => {
    it('calls /api/account/profile and returns data', async () => {
      vi.spyOn(global, 'fetch').mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: {
            user: { fullName: 'Missionário João' },
          },
        }),
      } as Response);

      const res = await fetchAccountProfile();
      expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining('/api/account/profile'), {
        method: 'GET',
        headers: { Accept: 'application/json' },
        cache: 'no-store',
      });
      expect(res.user?.fullName).toBe('Missionário João');
    });

    it('throws error when fetch fails', async () => {
      vi.spyOn(global, 'fetch').mockResolvedValueOnce({
        ok: false,
        json: async () => ({ message: 'Sessão inválida' }),
      } as Response);

      await expect(fetchAccountProfile()).rejects.toThrow('Sessão inválida');
    });
  });

  describe('updateAccountProfile', () => {
    it('sends PATCH to /api/account/profile', async () => {
      vi.spyOn(global, 'fetch').mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      } as Response);

      await updateAccountProfile({ fullName: 'Novo Nome' });

      expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining('/api/account/profile'), {
        method: 'PATCH',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ fullName: 'Novo Nome' }),
        cache: 'no-store',
      });
    });
  });

  describe('updateMissionaryAboutData', () => {
    it('sends PATCH to /api/missionaries/about', async () => {
      vi.spyOn(global, 'fetch').mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      } as Response);

      await updateMissionaryAboutData({ aboutMe: 'Nova intro' });

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/missionaries/about'),
        {
          method: 'PATCH',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ aboutMe: 'Nova intro' }),
          cache: 'no-store',
        }
      );
    });
  });

  describe('updateMissionaryProfileData', () => {
    it('sends PATCH to /api/missionaries/profile', async () => {
      vi.spyOn(global, 'fetch').mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      } as Response);

      await updateMissionaryProfileData({ publicEmail: 'email@novo.com' });

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/missionaries/profile'),
        {
          method: 'PATCH',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ publicEmail: 'email@novo.com' }),
          cache: 'no-store',
        }
      );
    });
  });

  describe('updateMissionaryWorkAddress', () => {
    it('sends PATCH to /api/missionaries/work-address', async () => {
      vi.spyOn(global, 'fetch').mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      } as Response);

      await updateMissionaryWorkAddress({
        zip: '01001-000',
        district: 'Sé',
        city: 'São Paulo',
        state: 'SP',
        country: 'Brasil',
      });

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/missionaries/work-address'),
        expect.objectContaining({
          method: 'PATCH',
        })
      );
    });

    it('throws error when request fails', async () => {
      vi.spyOn(global, 'fetch').mockResolvedValueOnce({
        ok: false,
        json: async () => ({ message: 'Endereço inválido' }),
      } as Response);

      await expect(
        updateMissionaryWorkAddress({
          zip: '01001-000',
          district: 'Sé',
          city: 'São Paulo',
          state: 'SP',
          country: 'Brasil',
        })
      ).rejects.toThrow('Endereço inválido');
    });
  });

  describe('updateMissionaryIdentity', () => {
    it('sends PATCH to /api/missionaries/identity', async () => {
      vi.spyOn(global, 'fetch').mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      } as Response);

      await updateMissionaryIdentity({
        identityType: 'CPF',
        identityDocument: '12345678901',
      });

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/missionaries/identity'),
        expect.objectContaining({
          method: 'PATCH',
        })
      );
    });
  });

  describe('changeAccountPassword', () => {
    it('sends PATCH to /api/account/password', async () => {
      vi.spyOn(global, 'fetch').mockResolvedValueOnce({
        ok: true,
        json: async () => ({ message: 'Password changed successfully' }),
      } as Response);

      await changeAccountPassword({
        currentPassword: 'OldPassword123!',
        newPassword: 'NewPassword123!',
        newPasswordConfirmation: 'NewPassword123!',
      });

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/account/password'),
        expect.objectContaining({
          method: 'PATCH',
        })
      );
    });
  });
});
