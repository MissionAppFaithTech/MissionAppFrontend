'use client';

import ImpactProjectCard from '@/components/profile/ImpactProjectCard';
import ImpactProjectStateGate from '@/components/profile/ImpactProjectStateGate';
import { useOwnerProfile } from '@/components/profile/OwnerProfileProvider';
import { ImpactProjectEditor } from '@/app/profile/(missionary)/projetos-de-impacto/edit/ImpactProjectEditPageContent';

/**
 * The tab shows the project; while there is none, the creation form is right
 * here instead of an empty state that sends the missionary to another page.
 */
export default function ImpactProjectsPageContent() {
  const displayName = useOwnerProfile().displayName;

  return (
    <ImpactProjectStateGate loadingLabel="Carregando projeto de impacto" skeletonHeight={420}>
      {(project, reload) =>
        project ? (
          <ImpactProjectCard project={project} isOwnProfile missionaryName={displayName} />
        ) : (
          <ImpactProjectEditor project={null} onDone={reload} />
        )
      }
    </ImpactProjectStateGate>
  );
}
