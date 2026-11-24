import type { Metadata } from 'next';
import ImpactProjectEditPageContent from './ImpactProjectEditPageContent';

export const metadata: Metadata = {
  title: 'Projeto de Impacto | Meu perfil',
  robots: { index: false, follow: false },
};

export default function EditImpactProjectPage() {
  return <ImpactProjectEditPageContent />;
}
