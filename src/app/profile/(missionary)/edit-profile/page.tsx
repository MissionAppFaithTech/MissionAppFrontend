import type { Metadata } from 'next';
import EditProfilePageContent from './EditProfilePageContent';

export const metadata: Metadata = {
  title: 'Editar perfil',
  robots: { index: false, follow: false },
};

export default function EditProfilePage() {
  return <EditProfilePageContent />;
}
