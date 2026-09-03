'use client';

import { useState } from 'react';
import ProfileAboutEditSection from '@/components/profile/ProfileAboutEditSection';
import ProfileAboutSection from '@/components/profile/ProfileAboutSection';
import { mockProfile } from '@/mocks/profile';

type ProfileView = 'about' | 'edit-about';

export default function ProfilePageContent() {
  const [profileView, setProfileView] = useState<ProfileView>('about');

  return profileView === 'about' ? (
    <ProfileAboutSection
      data={mockProfile.about}
      onEditAction={() => setProfileView('edit-about')}
    />
  ) : (
    <ProfileAboutEditSection data={mockProfile.about} onBack={() => setProfileView('about')} />
  );
}
