import { Suspense } from 'react';
import { OwnerProfileProvider } from '@/components/profile/OwnerProfileProvider';
import AccountSettingsView from '@/components/profile/settings/AccountSettingsView';
import { loadMyProfile } from '@/lib/server/profile';

export default function SupporterSettingsPage() {
  return (
    <Suspense fallback={<AccountSettingsView role="supporter" />}>
      <SupporterAccountSettings />
    </Suspense>
  );
}

export async function SupporterAccountSettings() {
  const result = await loadMyProfile();
  if (result.kind !== 'ok') {
    return <AccountSettingsView role="supporter" />;
  }

  return (
    <OwnerProfileProvider profile={result.profile}>
      <AccountSettingsView role="supporter" />
    </OwnerProfileProvider>
  );
}
