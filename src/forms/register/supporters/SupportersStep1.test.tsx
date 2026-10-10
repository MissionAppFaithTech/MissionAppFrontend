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

  it('does not show required errors until submit', async () => {
    const user = userEvent.setup();
    render(
      <SupporterRegisterWizardProvider>
        <SupportersStep1 />
      </SupporterRegisterWizardProvider>
    );

    await user.click(screen.getByLabelText(/nome completo/i));
    await user.tab();
    await user.click(screen.getByLabelText(/e-mail/i));
    await user.tab();

    expect(screen.queryByText(/informe seu nome completo/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/informe seu e-mail/i)).not.toBeInTheDocument();
  });

  it('shows the @ error while typing an email without it', async () => {
    const user = userEvent.setup();
    render(
      <SupporterRegisterWizardProvider>
        <SupportersStep1 />
      </SupporterRegisterWizardProvider>
    );

    await user.type(screen.getByLabelText(/e-mail/i), 'email-sem-arroba');

    expect(await screen.findByText(/inclua um @ no e-mail/i)).toBeInTheDocument();
    expect(screen.queryByText(/informe seu nome completo/i)).not.toBeInTheDocument();
  });
});
