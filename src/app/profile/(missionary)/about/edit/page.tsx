import type { Metadata } from 'next';
import ProfileSobreEditContent from './ProfileSobreEditContent';

export const metadata: Metadata = {
  title: 'Editar Sobre | Meu perfil',
  robots: { index: false, follow: false },
};

export default function ProfileAboutEditPage() {
  return <ProfileSobreEditContent />;
}
