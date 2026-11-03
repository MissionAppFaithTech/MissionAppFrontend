'use client';

import { useRouter } from 'next/navigation';
import ProfileAboutSection from '@/components/profile/ProfileAboutSection';
import { useOwnerProfile } from '@/components/profile/OwnerProfileProvider';

export default function ProfilePageContent() {
  const router = useRouter();
  const { about } = useOwnerProfile();

  return (
    <ProfileAboutSection data={about} onEditAction={() => router.push('/profile/sobre/edit')} />
  );
}
