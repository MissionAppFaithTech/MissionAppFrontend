export type Gender = "feminino" | "masculino";

export type MissionariesStep1Values = {
  fullName: string;
  birthDate: string;
  gender: Gender | "";
  document: string;
  phone: string;
};

export type MissionariesStep2Values = {
  missionaryAgency: string;
  agencyPhone: string;
  missionDescription: string;
  faithCommunity: string;
  communityPhone: string;
  pastorName: string;
  pastorPhone: string;
};

export type MissionariesStep3Values = {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
};

export type MissionaryRegisterData = MissionariesStep1Values &
  MissionariesStep2Values &
  MissionariesStep3Values;
