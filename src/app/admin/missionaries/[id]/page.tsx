import type { Metadata } from 'next';
import RegistrationReview from '@/components/admin/RegistrationReview';

export const metadata: Metadata = {
  title: 'Análise de cadastro | Administração',
  robots: { index: false, follow: false },
};

export default function RegistrationReviewPage() {
  return <RegistrationReview />;
}
