'use client';

import { useRouter } from 'next/navigation';
import ProfileAboutEditSection from '@/components/profile/ProfileAboutEditSection';
import { useProfileStore } from '@/stores/profileStore';

export default function ProfileSobreEditContent() {
  const router = useRouter();
  const profile = useProfileStore((state) => state.profile);
  const updateAbout = useProfileStore((state) => state.updateAbout);

  return (
    <ProfileAboutEditSection
      missionaryId={profile.missionaryId ?? ''}
      data={profile.about}
      onBack={() => router.push('/profile/sobre')}
      onSave={async (formData) => {
        await updateAbout(formData);
      }}
    />
  );
}
