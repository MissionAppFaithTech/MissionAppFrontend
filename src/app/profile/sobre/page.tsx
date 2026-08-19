import type { Metadata } from 'next';
import ProfilePageContent from '../ProfilePageContent';

export const metadata: Metadata = {
  title: 'Sobre | Meu perfil',
  robots: { index: false, follow: false },
};

export default function ProfileAboutPage() {
  return <ProfilePageContent />;
}
