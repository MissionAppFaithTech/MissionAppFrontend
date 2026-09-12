'use client';

import { useRouter } from 'next/navigation';
import ProfileAboutSection from '@/components/profile/ProfileAboutSection';
import { mockProfile } from '@/mocks/profile';

export default function ProfilePageContent() {
  const router = useRouter();

  return (
    <ProfileAboutSection
      data={mockProfile.about}
      onEditAction={() => router.push('/profile/sobre/edit')}
    />
  );
}
