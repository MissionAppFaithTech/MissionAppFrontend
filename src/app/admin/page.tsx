import type { Metadata } from 'next';
import AdminRegistrations from '@/components/admin/AdminRegistrations';

export const metadata: Metadata = {
  title: 'Missionários cadastrados | Administração',
  robots: { index: false, follow: false },
};

export default function AdminPage() {
  return <AdminRegistrations />;
}
