'use client';

import ProfileDataGate from '@/components/profile/ProfileDataGate';
import ProfileEditForm from '@/components/profile/ProfileEditForm';
import { useProfileStore } from '@/stores/profileStore';

export default function EditProfilePageContent() {
  const profile = useProfileStore((state) => state.profile);

  return (
    <ProfileDataGate loadingLabel="Carregando dados do perfil" skeletonHeight={560}>
      <ProfileEditForm profile={profile} />
    </ProfileDataGate>
  );
}
