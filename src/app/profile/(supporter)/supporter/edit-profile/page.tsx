import type { Metadata } from 'next';
import SupporterEditForm from '@/components/profile/SupporterEditForm';
import { mockSupporterProfile } from '@/mocks/profile';

export const metadata: Metadata = {
  title: 'Editar Perfil de Apoiador',
  robots: { index: false, follow: false },
};

export default function SupporterEditProfilePage() {
  return <SupporterEditForm profile={mockSupporterProfile} />;
}
