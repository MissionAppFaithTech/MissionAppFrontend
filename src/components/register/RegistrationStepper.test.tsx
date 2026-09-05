import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import RegistrationStepper from './RegistrationStepper';

describe('RegistrationStepper component', () => {
  const stepLabels = ['Dados pessoais', 'Dados de acesso'];

  it('renders step text, labels and progress bar with accessible attributes', () => {
    render(
      <RegistrationStepper
        currentStep={1}
        totalSteps={2}
        stepLabels={stepLabels}
        tone="supporter"
      />
    );

    expect(screen.getByText('Etapa 1 de 2')).toBeInTheDocument();
    expect(screen.getByText('Dados pessoais')).toBeInTheDocument();

    const progressBar = screen.getByRole('progressbar');
    expect(progressBar).toHaveAttribute('aria-valuenow', '1');
    expect(progressBar).toHaveAttribute('aria-valuemin', '1');
    expect(progressBar).toHaveAttribute('aria-valuemax', '2');
  });

  it('indicates current step with aria-current="step"', () => {
    render(
      <RegistrationStepper currentStep={2} totalSteps={2} stepLabels={stepLabels} tone="mission" />
    );

    expect(screen.getByText('Etapa 2 de 2')).toBeInTheDocument();
    const currentStepPill = screen.getByText('2. Dados de acesso');
    expect(currentStepPill).toHaveAttribute('aria-current', 'step');
  });
});
