import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import RegisterStepForm from './RegisterStepForm';

describe('RegisterStepForm', () => {
  it('renders section title and continue action', () => {
    render(
      <RegisterStepForm onSubmit={(event) => event.preventDefault()} sectionTitle="Dados pessoais">
        <input aria-label="Campo de teste" />
      </RegisterStepForm>
    );

    expect(screen.getByText('Dados pessoais')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /continuar/i })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /voltar/i })).not.toBeInTheDocument();
  });

  it('calls onBack when Voltar is clicked', async () => {
    const user = userEvent.setup();
    const handleBack = vi.fn();

    render(
      <RegisterStepForm
        onSubmit={(event) => event.preventDefault()}
        onBack={handleBack}
        submitLabel="Finalizar cadastro"
      >
        <input aria-label="Campo de teste" />
      </RegisterStepForm>
    );

    await user.click(screen.getByRole('button', { name: /voltar/i }));
    expect(handleBack).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('button', { name: /finalizar cadastro/i })).toBeInTheDocument();
  });

  it('uses the same border radius for Voltar and the submit action', () => {
    render(
      <RegisterStepForm onSubmit={(event) => event.preventDefault()} onBack={() => undefined}>
        <input aria-label="Campo de teste" />
      </RegisterStepForm>
    );

    const back = screen.getByRole('button', { name: /voltar/i });
    const next = screen.getByRole('button', { name: /continuar/i });

    expect(getComputedStyle(back).borderRadius).toBe(getComputedStyle(next).borderRadius);
  });

  it('keeps the submit action as a loading CTA instead of a blank disabled button', () => {
    render(
      <RegisterStepForm
        onSubmit={(event) => event.preventDefault()}
        onBack={() => undefined}
        submitLabel="Finalizar cadastro"
        submittingLabel="Finalizando..."
        isSubmitting
      >
        <input aria-label="Campo de teste" />
      </RegisterStepForm>
    );

    const submit = screen.getByRole('button', { name: /finalizando/i });
    expect(submit).toHaveClass('MuiButton-loading');
    expect(submit).not.toHaveTextContent(/^$/);
    expect(getComputedStyle(submit).getPropertyValue('--pill-bg').trim()).not.toBe('');
  });
});
