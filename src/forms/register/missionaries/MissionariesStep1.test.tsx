import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, it, expect } from 'vitest';
import { useMissionaryRegisterStore } from '@/stores/missionaryRegisterStore';
import MissionariesStep1 from './MissionariesStep1';
import { MissionaryRegisterWizardProvider } from '@/components/register/missionaries/MissionaryRegisterWizardContext';

function renderStep() {
  return render(
    <MissionaryRegisterWizardProvider>
      <MissionariesStep1 />
    </MissionaryRegisterWizardProvider>
  );
}

const setStepErrors = (stepErrors: Record<string, string>) =>
  useMissionaryRegisterStore.setState({ stepErrors });

describe('MissionariesStep1 component', () => {
  afterEach(() => setStepErrors({}));

  it('renders all personal fields including email and submit button', () => {
    renderStep();

    expect(screen.getByText('Dados pessoais')).toBeInTheDocument();
    expect(screen.getByLabelText(/nome completo/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/e-mail/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/data de nascimento/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/cpf ou passaporte/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /continuar/i })).toBeInTheDocument();
  });

  it('lists every error in a focused summary when continuing with empty fields', async () => {
    const user = userEvent.setup();
    renderStep();

    await user.click(screen.getByRole('button', { name: /continuar/i }));

    const summary = await screen.findByRole('alert');
    expect(summary).toHaveFocus();
    expect(summary).toHaveTextContent('Corrija 6 campos para continuar');
    expect(
      within(summary).getByText(/nome completo: informe seu nome completo/i)
    ).toBeInTheDocument();
    expect(within(summary).getByText(/e-mail: informe seu e-mail/i)).toBeInTheDocument();
    expect(
      within(summary).getByText(/cpf ou passaporte: informe cpf ou passaporte/i)
    ).toBeInTheDocument();
    // The message also stays next to its field.
    expect(screen.getAllByText(/informe seu nome completo/i)).toHaveLength(2);
  });

  it('a summary item takes the user to its field', async () => {
    const user = userEvent.setup();
    renderStep();

    await user.click(screen.getByRole('button', { name: /continuar/i }));
    await user.click(
      within(await screen.findByRole('alert')).getByRole('button', { name: /^e-mail:/i })
    );

    expect(screen.getByRole('textbox', { name: /e-mail/i })).toHaveFocus();
  });

  it('checks a field when the user leaves it, before the end of the step', async () => {
    const user = userEvent.setup();
    renderStep();

    await user.click(screen.getByRole('textbox', { name: /nome completo/i }));
    await user.tab();

    expect(await screen.findByText(/informe seu nome completo/i)).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: /nome completo/i })).toHaveAttribute(
      'aria-invalid',
      'true'
    );
    // Fields never visited stay quiet, and there is no summary before continuing.
    expect(screen.queryByText(/informe seu e-mail/i)).not.toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('waits for the user to leave the e-mail field before checking its format', async () => {
    const user = userEvent.setup();
    renderStep();

    const email = screen.getByRole('textbox', { name: /e-mail/i });
    await user.type(email, 'email-sem-arroba');
    expect(screen.queryByText(/inclua um @ no e-mail/i)).not.toBeInTheDocument();

    await user.tab();
    expect(await screen.findByText(/inclua um @ no e-mail/i)).toBeInTheDocument();

    // Once shown, the error clears as soon as the value is fixed.
    await user.clear(email);
    await user.type(email, 'ana@example.com');
    await waitFor(() =>
      expect(screen.queryByText(/inclua um @ no e-mail/i)).not.toBeInTheDocument()
    );
  });

  it('marks the required fields and announces the step position', () => {
    renderStep();

    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent(
      'Etapa 1 de 3: Dados pessoais'
    );
    expect(screen.getByText(/são obrigatórios/i)).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: /nome completo/i })).toBeRequired();
    expect(screen.getByRole('textbox', { name: /e-mail/i })).toBeRequired();
    expect(screen.getByRole('textbox', { name: /e-mail/i })).toHaveAttribute(
      'autocomplete',
      'email'
    );
    expect(screen.getByRole('radiogroup', { name: /gênero/i })).toHaveAttribute(
      'aria-required',
      'true'
    );
  });

  it('shows the errors the API sent back for this step and focuses them', async () => {
    setStepErrors({ email: 'Este e-mail já está em uso' });
    renderStep();

    const summary = await screen.findByRole('alert');
    expect(summary).toHaveFocus();
    expect(summary).toHaveTextContent('E-mail: Este e-mail já está em uso');
    expect(screen.getByRole('textbox', { name: /e-mail/i })).toHaveAccessibleDescription(
      'Este e-mail já está em uso'
    );
  });
});
