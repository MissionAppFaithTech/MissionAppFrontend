'use client';

import ProfileEditForm from '@/components/profile/ProfileEditForm';
import { useOwnerProfile } from '@/components/profile/OwnerProfileProvider';

/** The profile comes fresh from the server layout (ADR-0005), so the form edits real values. */
export default function EditProfilePageContent() {
  return <ProfileEditForm profile={useOwnerProfile()} />;
}
