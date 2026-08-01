import type { Metadata } from 'next';
import ForgotPasswordPageContent from './ForgotPasswordPageContent';

export const metadata: Metadata = {
  title: 'Esqueci minha senha',
  description: 'Redefina sua senha do Mission App com um link enviado por e-mail.',
  alternates: { canonical: '/forgot-password' },
  robots: { index: false, follow: false },
};

export default function ForgotPasswordPage() {
  return <ForgotPasswordPageContent />;
}
