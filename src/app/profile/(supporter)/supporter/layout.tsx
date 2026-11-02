import type { ReactNode } from 'react';
import RoleGate from '@/components/common/RoleGate';
import ProfileLayoutShell from '@/components/layout/ProfileLayoutShell';
import { mockSupporterProfile } from '@/mocks/profile';

export default function SupporterProfileLayout({ children }: { children: ReactNode }) {
  return (
    <ProfileLayoutShell profile={mockSupporterProfile} role="supporter">
      <RoleGate>{children}</RoleGate>
    </ProfileLayoutShell>
  );
}
