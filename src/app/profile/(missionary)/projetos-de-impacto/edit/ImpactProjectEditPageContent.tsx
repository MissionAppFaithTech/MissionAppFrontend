'use client';

import { useRouter } from 'next/navigation';
import ImpactProjectEditForm, {
  type ImpactProjectFormValues,
} from '@/components/profile/ImpactProjectEditForm';
import ImpactProjectStateGate from '@/components/profile/ImpactProjectStateGate';
import {
  createImpactProject,
  deleteImpactProject,
  updateImpactProject,
  uploadCoverImage,
  type UpdateImpactProjectInput,
} from '@/services/impactProject.service';
import { useFeedbackStore } from '@/stores/feedbackStore';
import type { ImpactProjectData } from '@/types/profile';

const LIST_HREF = '/profile/projetos-de-impacto';

/** Only what changed: the backend treats every update field as optional. */
export function buildUpdate(
  project: ImpactProjectData,
  values: ImpactProjectFormValues,
  coverImageAssetId?: string
): UpdateImpactProjectInput {
  const update: UpdateImpactProjectInput = {};
  const video = values.videoUrl.trim();

  if (values.title.trim() !== project.title) update.title = values.title.trim();
  if (values.description.trim() !== project.description) {
    update.description = values.description.trim();
  }
  if (video !== (project.videoUrl ?? '')) update.videoUrl = video === '' ? null : video;
  if (coverImageAssetId) update.coverImageAssetId = coverImageAssetId;
  return update;
}

type ImpactProjectEditorProps = {
  /** The missionary's project, or `null` to create it. */
  project: ImpactProjectData | null;
  /** Called after a save or delete; the host decides where to go next. */
  onDone: () => void;
};

/** Create / edit / delete flow around the form, shared by the tab and the edit page. */
export function ImpactProjectEditor({ project, onDone }: ImpactProjectEditorProps) {
  const notify = useFeedbackStore((state) => state.notify);

  const finish = (message: string) => {
    notify(message);
    onDone();
  };

  const save = async (values: ImpactProjectFormValues) => {
    const coverImageAssetId = values.coverFile
      ? await uploadCoverImage(values.coverFile)
      : undefined;

    if (!project) {
      if (!coverImageAssetId) throw new Error('Selecione uma foto de capa para o projeto.');
      const video = values.videoUrl.trim();
      await createImpactProject({
        title: values.title.trim(),
        description: values.description.trim(),
        coverImageAssetId,
        ...(video ? { videoUrl: video } : {}),
      });
      finish('Projeto de impacto criado com sucesso!');
      return;
    }

    const update = buildUpdate(project, values, coverImageAssetId);
    if (Object.keys(update).length === 0) {
      notify('Nenhuma alteração para salvar.', 'info');
      onDone();
      return;
    }
    await updateImpactProject(project.id, update);
    finish('Projeto de impacto atualizado com sucesso!');
  };

  return (
    <ImpactProjectEditForm
      project={project}
      onSubmit={save}
      onDelete={
        project
          ? async () => {
              await deleteImpactProject(project.id);
              finish('Projeto de impacto excluído.');
            }
          : undefined
      }
    />
  );
}

export default function ImpactProjectEditPageContent() {
  const router = useRouter();

  return (
    <ImpactProjectStateGate loadingLabel="Carregando projeto de impacto" skeletonHeight={720}>
      {(project) => <ImpactProjectEditor project={project} onDone={() => router.push(LIST_HREF)} />}
    </ImpactProjectStateGate>
  );
}
