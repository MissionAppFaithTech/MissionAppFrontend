export type RegistrationStatus = 'pending' | 'approved' | 'rejected';

export interface RegistrationOrganization {
  name: string;
  address?: string;
  phone?: string;
  website?: string;
  pastorName?: string;
  pastorPhone?: string;
}

export interface MissionaryRegistration {
  id: string;
  name: string;
  email: string;
  username: string;
  birthDate: string;
  gender: string;
  document: string;
  phone: string;
  location: string;
  agency: RegistrationOrganization;
  church: RegistrationOrganization;
  description: string;
  registeredAt: string;
  status: RegistrationStatus;
  rejectionReason?: string;
}
