import type { Metadata } from 'next';
import ProfileEditForm from '@/components/profile/ProfileEditForm';
import { mockProfile } from '@/mocks/profile';

export const metadata: Metadata = {
  title: 'Editar perfil',
  robots: { index: false, follow: false },
};

export default function EditProfilePage() {
  return <ProfileEditForm profile={mockProfile} />;
}
