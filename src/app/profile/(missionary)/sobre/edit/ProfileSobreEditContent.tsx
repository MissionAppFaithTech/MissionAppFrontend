'use client';

import { useRouter } from 'next/navigation';
import ProfileAboutEditSection from '@/components/profile/ProfileAboutEditSection';
import { useOwnerProfile } from '@/components/profile/OwnerProfileProvider';
import { saveProfileAbout } from '@/services/profileSave.service';
import { useFeedbackStore } from '@/stores/feedbackStore';

const ABOUT_HREF = '/profile/sobre';

export default function ProfileSobreEditContent() {
  const router = useRouter();
  const { about } = useOwnerProfile();
  const notify = useFeedbackStore((state) => state.notify);

  return (
    <ProfileAboutEditSection
      data={about}
      onSave={saveProfileAbout}
      onDone={(saved) => {
        notify(
          saved ? 'Sobre atualizado com sucesso.' : 'Nenhuma alteração para salvar.',
          saved ? 'success' : 'info'
        );
        // The save action already re-rendered the profile with the new data (ADR-0006).
        router.push(ABOUT_HREF);
      }}
      onCancel={() => router.push(ABOUT_HREF)}
      backHref={ABOUT_HREF}
      onDiscard={() => notify('Alterações descartadas.', 'info')}
    />
  );
}
