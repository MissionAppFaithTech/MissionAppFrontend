import type { FaithCommunityData, MissionaryAgencyData } from '@/types/account';

export type Gender = 'feminino' | 'masculino';

export type MissionariesStep1Values = {
  fullName: string;
  birthDate: string;
  gender: Gender | '';
  document: string;
  phone: string;
  email: string;
};

export type SupportersStep1Values = {
  fullName: string;
  birthDate: string;
  gender: Gender | '';
  phone: string;
  email: string;
  /** Opcional — use SELECT_OTHER se não encontrar na lista */
  faithCommunity: string;
  /** Nome do item escolhido (a busca não carrega o catálogo inteiro). */
  faithCommunityName?: string;
  communityDetails: FaithCommunityData;
};

export type MissionariesStep2Values = {
  missionaryAgency: string;
  /** Nome da agência escolhida (a busca não carrega o catálogo inteiro). */
  missionaryAgencyName?: string;
  /** Preenchido quando missionaryAgency === SELECT_OTHER */
  agencyDetails: MissionaryAgencyData;
  missionDescription: string;
  faithCommunity: string;
  /** Nome da comunidade escolhida. */
  faithCommunityName?: string;
  communityDetails: FaithCommunityData;
};

/** Dados de acesso — step 3 do missionário / step 2 do apoiador */
export type AccessCredentialsValues = {
  username: string;
  email?: string;
  password: string;
  confirmPassword: string;
};

export type MissionariesStep3Values = AccessCredentialsValues;

export type SupporterRegisterData = SupportersStep1Values & AccessCredentialsValues;

export type MissionaryRegisterData = MissionariesStep1Values &
  MissionariesStep2Values &
  MissionariesStep3Values;
