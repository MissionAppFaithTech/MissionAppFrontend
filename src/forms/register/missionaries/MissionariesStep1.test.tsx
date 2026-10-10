import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect } from 'vitest';
import MissionariesStep1 from './MissionariesStep1';
import { MissionaryRegisterWizardProvider } from '@/components/register/missionaries/MissionaryRegisterWizardContext';

function renderStep() {
  return render(
    <MissionaryRegisterWizardProvider>
      <MissionariesStep1 />
    </MissionaryRegisterWizardProvider>
  );
}

describe('MissionariesStep1 component', () => {
  it('renders all personal fields including email and submit button', () => {
    renderStep();

    expect(screen.getByText('Dados pessoais')).toBeInTheDocument();
    expect(screen.getByLabelText(/nome completo/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/e-mail/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/data de nascimento/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/cpf ou passaporte/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /continuar/i })).toBeInTheDocument();
  });

  it('displays validation errors when submitting empty fields', async () => {
    const user = userEvent.setup();
    renderStep();

    await user.click(screen.getByRole('button', { name: /continuar/i }));

    expect(await screen.findByText(/informe seu nome completo/i)).toBeInTheDocument();
    expect(await screen.findByText(/informe seu e-mail/i)).toBeInTheDocument();
    expect(await screen.findByText(/informe sua data de nascimento/i)).toBeInTheDocument();
    expect(await screen.findByText(/informe cpf ou passaporte/i)).toBeInTheDocument();
  });

  it('does not show required errors until submit', async () => {
    const user = userEvent.setup();
    renderStep();

    await user.click(screen.getByLabelText(/nome completo/i));
    await user.tab();
    await user.click(screen.getByLabelText(/e-mail/i));
    await user.tab();

    expect(screen.queryByText(/informe seu nome completo/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/informe seu e-mail/i)).not.toBeInTheDocument();
  });

  it('shows the @ error while typing an email without it', async () => {
    const user = userEvent.setup();
    renderStep();

    await user.type(screen.getByLabelText(/e-mail/i), 'email-sem-arroba');

    expect(await screen.findByText(/inclua um @ no e-mail/i)).toBeInTheDocument();
    expect(screen.queryByText(/informe seu nome completo/i)).not.toBeInTheDocument();
  });
});
