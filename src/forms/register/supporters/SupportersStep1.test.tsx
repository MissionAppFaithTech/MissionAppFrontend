import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect } from 'vitest';
import SupportersStep1 from './SupportersStep1';
import { SupporterRegisterWizardProvider } from '@/components/register/supporters/SupporterRegisterWizardContext';

describe('SupportersStep1 component', () => {
  it('renders all personal fields including email and submit button', () => {
    render(
      <SupporterRegisterWizardProvider>
        <SupportersStep1 />
      </SupporterRegisterWizardProvider>
    );

    expect(screen.getByText('Dados pessoais')).toBeInTheDocument();
    expect(screen.getByLabelText(/nome completo/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/e-mail/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/data de nascimento/i)).toBeInTheDocument();
    expect(screen.getByText('Gênero')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /continuar/i })).toBeInTheDocument();
  });

  it('displays validation errors when submitting empty fields', async () => {
    const user = userEvent.setup();
    render(
      <SupporterRegisterWizardProvider>
        <SupportersStep1 />
      </SupporterRegisterWizardProvider>
    );

    const submitBtn = screen.getByRole('button', { name: /continuar/i });
    await user.click(submitBtn);

    expect(await screen.findByText(/informe seu nome completo/i)).toBeInTheDocument();
    expect(await screen.findByText(/informe seu e-mail/i)).toBeInTheDocument();
    expect(await screen.findByText(/informe sua data de nascimento/i)).toBeInTheDocument();
  });
});
