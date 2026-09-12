import type { ReactNode } from 'react';
import ProfileLayoutShell from '@/components/layout/ProfileLayoutShell';
import { mockProfile } from '@/mocks/profile';

export default function ProfileLayout({ children }: { children: ReactNode }) {
  return (
    <ProfileLayoutShell profile={mockProfile} role="missionary">
      {children}
    </ProfileLayoutShell>
  );
}
