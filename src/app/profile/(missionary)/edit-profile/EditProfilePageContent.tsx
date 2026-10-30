'use client';

import ProfileEditForm from '@/components/profile/ProfileEditForm';
import { useProfileStore } from '@/stores/profileStore';

export default function EditProfilePageContent() {
  const profile = useProfileStore((state) => state.profile);
  return <ProfileEditForm profile={profile} />;
}
