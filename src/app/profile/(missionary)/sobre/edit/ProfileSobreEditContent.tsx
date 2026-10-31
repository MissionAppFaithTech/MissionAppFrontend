'use client';

import { useRouter } from 'next/navigation';
import ProfileAboutEditSection from '@/components/profile/ProfileAboutEditSection';
import ProfileDataGate from '@/components/profile/ProfileDataGate';
import { useFeedbackStore } from '@/stores/feedbackStore';
import { useProfileStore } from '@/stores/profileStore';

const ABOUT_HREF = '/profile/sobre';

export default function ProfileSobreEditContent() {
  const router = useRouter();
  const about = useProfileStore((state) => state.profile.about);
  const saveAbout = useProfileStore((state) => state.saveAbout);
  const notify = useFeedbackStore((state) => state.notify);

  return (
    <ProfileDataGate loadingLabel="Carregando dados do Sobre" skeletonHeight={720}>
      <ProfileAboutEditSection
        data={about}
        onSave={saveAbout}
        onDone={(saved) => {
          notify(
            saved ? 'Sobre atualizado com sucesso.' : 'Nenhuma alteração para salvar.',
            saved ? 'success' : 'info'
          );
          router.push(ABOUT_HREF);
        }}
        onCancel={() => router.push(ABOUT_HREF)}
      />
    </ProfileDataGate>
  );
}
