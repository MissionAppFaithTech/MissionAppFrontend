import type { ReactNode } from 'react';
import ProfileLayoutShell from '@/components/layout/ProfileLayoutShell';
import { mockSupporterProfile } from '@/mocks/profile';

export default function SupporterProfileLayout({ children }: { children: ReactNode }) {
  return (
    <ProfileLayoutShell profile={mockSupporterProfile} role="supporter">
      {children}
    </ProfileLayoutShell>
  );
}
