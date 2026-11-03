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
        router.push(ABOUT_HREF);
        // The profile layout re-reads the saved data on the server (ADR-0005).
        if (saved) router.refresh();
      }}
      onCancel={() => router.push(ABOUT_HREF)}
    />
  );
}
