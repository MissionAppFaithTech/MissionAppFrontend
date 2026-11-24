import type { Metadata } from 'next';
import FinancialSettingsForm from '@/components/profile/FinancialSettingsForm';
import { mockProfile } from '@/mocks/profile';

export const metadata: Metadata = {
  title: 'Configurações Financeiras | Meu perfil',
  description:
    'Gerencie suas informações financeiras para recebimento de ofertas e doações voluntárias.',
  robots: { index: false, follow: false },
};

export default function FinancialSettingsPage() {
  return (
    <FinancialSettingsForm
      initialData={mockProfile.financial}
      missionaryName={mockProfile.displayName}
    />
  );
}
