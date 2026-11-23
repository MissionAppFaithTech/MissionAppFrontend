'use client';

import VolunteerActivismOutlinedIcon from '@mui/icons-material/VolunteerActivismOutlined';
import EmptyState from '@/components/common/EmptyState';
import ImpactProjectCard from '@/components/profile/ImpactProjectCard';
import ImpactProjectStateGate from '@/components/profile/ImpactProjectStateGate';
import { useOwnerProfile } from '@/components/profile/OwnerProfileProvider';

export default function ImpactProjectsPageContent() {
  const displayName = useOwnerProfile().displayName;

  return (
    <ImpactProjectStateGate loadingLabel="Carregando projeto de impacto" skeletonHeight={420}>
      {(project) =>
        project ? (
          <ImpactProjectCard project={project} isOwnProfile missionaryName={displayName} />
        ) : (
          <EmptyState
            icon={VolunteerActivismOutlinedIcon}
            title="Você ainda não tem um projeto de impacto"
            description="Apresente o seu projeto com uma capa, uma descrição e, se quiser, um vídeo. Cada missionário pode ter um projeto."
            actionLabel="Criar projeto de impacto"
            actionHref="/profile/projetos-de-impacto/edit"
          />
        )
      }
    </ImpactProjectStateGate>
  );
}
