import { Suspense, type ReactNode } from 'react';
import AccountScope from '@/components/auth/AccountScope';
import RoleGate from '@/components/common/RoleGate';
import ProfileLayoutShell from '@/components/layout/ProfileLayoutShell';
import { mockSupporterProfile } from '@/mocks/profile';

export default function SupporterProfileLayout({ children }: { children: ReactNode }) {
  return (
    // The shell keeps local state (photo upload); it must restart for another account.
    <Suspense fallback={<SupporterShell>{null}</SupporterShell>}>
      <AccountScope>
        <SupporterShell>
          <RoleGate>{children}</RoleGate>
        </SupporterShell>
      </AccountScope>
    </Suspense>
  );
}

function SupporterShell({ children }: { children: ReactNode }) {
  return (
    <ProfileLayoutShell profile={mockSupporterProfile} role="supporter">
      {children}
    </ProfileLayoutShell>
  );
}
