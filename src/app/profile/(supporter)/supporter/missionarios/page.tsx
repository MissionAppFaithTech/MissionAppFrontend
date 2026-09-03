import type { Metadata } from 'next';
import FollowedMissionariesSection from '@/components/profile/FollowedMissionariesSection';
import { mockFollowedMissionaries } from '@/mocks/profile';

export const metadata: Metadata = {
  title: 'Missionários que Acompanho | Perfil de Apoiador',
  robots: { index: false, follow: false },
};

export default function SupporterMissionariesPage() {
  return <FollowedMissionariesSection missionaries={mockFollowedMissionaries} />;
}
