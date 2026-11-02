'use client';

import { useRouter } from 'next/navigation';
import ProfileAboutSection from '@/components/profile/ProfileAboutSection';
import { useProfileStore } from '@/stores/profileStore';

export default function ProfilePageContent() {
  const router = useRouter();
  const about = useProfileStore((state) => state.profile.about);

  return (
    <ProfileAboutSection data={about} onEditAction={() => router.push('/profile/sobre/edit')} />
  );
}
