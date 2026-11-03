import { mapPublicProfile } from '@/services/profile.service';
import type { PublicMissionaryProfile } from '@/types/backend';

/** What `GET /public/missionaries/:username` answers for an approved missionary. */
export const publicMissionaryPayload: PublicMissionaryProfile = {
  username: 'samuel_missionary',
  fullName: 'Samuel Mendonça',
  biography: 'Missionário na África do Sul',
  role: 'MISSIONARY',
  missionaryAgency: { id: 'agency-1', name: 'JOCUM' },
  faithCommunity: { id: 'community-1', name: 'Igreja Batista Central' },
  about: {
    aboutMe: 'Sirvo comunidades rurais há dez anos.',
    missionStorySummary: 'Comecei em 2015 no sertão nordestino.',
    originLocation: 'Recife - Brasil',
    prayerRequest: 'Pela saúde da equipe.',
    lifeVerse: 'Filipenses 4:13',
  },
  workLocation: { city: 'Juazeiro', state: 'BA', country: 'Brasil' },
  followersCount: 12,
  followingCount: 3,
  contact: {
    publicEmail: 'contato@missao.test',
    publicPhone: '+5521912345678',
    publicPhoneIsWhatsapp: true,
  },
};

export const publicProfileFixture = mapPublicProfile(publicMissionaryPayload);
