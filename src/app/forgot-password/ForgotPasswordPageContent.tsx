'use client';

import AuthLayout from '@/components/common/AuthLayout';
import ForgotPasswordForm from '@/forms/ForgotPasswordForm';

export default function ForgotPasswordPageContent() {
  return (
    <AuthLayout logoSize="md" title="Esqueci minha senha">
      <ForgotPasswordForm />
    </AuthLayout>
  );
}
