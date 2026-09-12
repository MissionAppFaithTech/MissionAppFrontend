'use client';

import { useRouter } from 'next/navigation';
import ProfileAboutEditSection from '@/components/profile/ProfileAboutEditSection';
import { mockProfile } from '@/mocks/profile';

export default function ProfileSobreEditContent() {
  const router = useRouter();

  return (
    <ProfileAboutEditSection 
      data={mockProfile.about} 
      onBack={() => router.push('/profile/sobre')} 
    />
  );
}
