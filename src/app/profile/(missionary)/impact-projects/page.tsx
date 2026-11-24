import type { Metadata } from 'next';
import ImpactProjectsPageContent from './ImpactProjectsPageContent';

export const metadata: Metadata = {
  title: 'Projetos de Impacto | Meu perfil',
  robots: { index: false, follow: false },
};

export default function ImpactProjectsPage() {
  return <ImpactProjectsPageContent />;
}
