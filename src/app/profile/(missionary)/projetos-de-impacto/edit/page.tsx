import type { Metadata } from 'next';
import ImpactProjectEditForm from '@/components/profile/ImpactProjectEditForm';
import { mockProfile } from '@/mocks/profile';

export const metadata: Metadata = {
  title: 'Editar Projeto de Impacto | Meu perfil',
  robots: { index: false, follow: false },
};

export default function EditImpactProjectPage() {
  const project = mockProfile.impactProject ?? {
    id: 'proj-1',
    title: 'Projeto social na favela do Lixão',
    description: 'Ajude-nos a construir uma escola cristã na África do Sul.',
    imageUrl: '/images/projects/projeto-impacto.jpg',
    galleryImages: [
      '/landing-page/landing-page.png',
      '/images/projects/projeto-impacto.jpg',
      '/landing-page/background.png',
    ],
    videoUrl: 'https://www.youtube.com/watch?v=5dsGWM5XGdg',
    campaignTitle: 'Campanha de Educação & Esperança',
    campaignBadge: true,
  };

  return <ImpactProjectEditForm project={project} />;
}
