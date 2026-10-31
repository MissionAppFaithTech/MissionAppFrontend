import type { Metadata } from 'next';
import AdminComingSoon from '@/components/admin/AdminComingSoon';

export const metadata: Metadata = {
  title: 'Painel administrativo',
  robots: { index: false, follow: false },
};

export default function AdminPage() {
  return <AdminComingSoon />;
}
