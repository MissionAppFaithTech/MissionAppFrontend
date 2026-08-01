export type Gender = 'feminino' | 'masculino';

export type MissionariesStep1Values = {
  fullName: string;
  birthDate: string;
  gender: Gender | '';
  document: string;
  phone: string;
};

export type SupportersStep1Values = {
  fullName: string;
  birthDate: string;
  gender: Gender | '';
  phone: string;
  /** Opcional — use SELECT_OTHER se não encontrar na lista */
  faithCommunity: string;
  communityPhone: string;
  pastorName: string;
  pastorPhone: string;
};

export type MissionariesStep2Values = {
  missionaryAgency: string;
  /** Preenchido quando missionaryAgency === SELECT_OTHER */
  agencyCustomName: string;
  agencyPhone: string;
  missionDescription: string;
  faithCommunity: string;
  communityPhone: string;
  pastorName: string;
  pastorPhone: string;
};

/** Dados de acesso — step 3 do missionário / step 2 do apoiador */
export type AccessCredentialsValues = {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
};

export type MissionariesStep3Values = AccessCredentialsValues;

export type SupporterRegisterData = SupportersStep1Values & AccessCredentialsValues;

export type MissionaryRegisterData = MissionariesStep1Values &
  MissionariesStep2Values &
  MissionariesStep3Values;
