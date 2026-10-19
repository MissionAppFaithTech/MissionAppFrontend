import type { FaithCommunityData, MissionaryAgencyData } from '@/types/account';

/** Valor do select quando o usuário não encontra a opção na lista. */
export const SELECT_OTHER = 'other' as const;

export const EMPTY_MISSIONARY_AGENCY: MissionaryAgencyData = {
  name: '',
  address1: '',
  address2: '',
  country: '',
  state: '',
  city: '',
  zipCode: '',
  website: '',
  phone: '',
};

export const EMPTY_FAITH_COMMUNITY: FaithCommunityData = {
  name: '',
  address1: '',
  address2: '',
  country: '',
  state: '',
  city: '',
  zipCode: '',
  website: '',
  churchPhone: '',
  pastorName: '',
  pastorPhone: '',
};
