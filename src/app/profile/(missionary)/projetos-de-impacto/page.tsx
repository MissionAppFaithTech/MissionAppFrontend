import type { Metadata } from 'next';
import ImpactProjectCard from '@/components/profile/ImpactProjectCard';
import { mockProfile } from '@/mocks/profile';

export const metadata: Metadata = {
  title: 'Projetos de Impacto | Meu perfil',
  robots: { index: false, follow: false },
};

export default function ImpactProjectsPage() {
  return (
    <ImpactProjectCard
      project={mockProfile.impactProject}
      isOwnProfile={true}
      missionaryName={mockProfile.displayName}
    />
  );
}
