import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import RegistrationStepper from './RegistrationStepper';

describe('RegistrationStepper component', () => {
  const stepLabels = ['Dados pessoais', 'Dados de acesso'];

  it('renders step labels and progress bar with accessible attributes', () => {
    render(
      <RegistrationStepper
        currentStep={1}
        totalSteps={2}
        stepLabels={stepLabels}
        tone="supporter"
      />
    );

    expect(screen.getByText('Dados pessoais')).toBeInTheDocument();
    expect(screen.getByText('Dados de acesso')).toBeInTheDocument();

    const progressBar = screen.getByRole('progressbar');
    expect(progressBar).toHaveAttribute('aria-valuenow', '1');
    expect(progressBar).toHaveAttribute('aria-valuemin', '1');
    expect(progressBar).toHaveAttribute('aria-valuemax', '2');
  });

  it('indicates current step with aria-current="step"', () => {
    render(
      <RegistrationStepper currentStep={2} totalSteps={2} stepLabels={stepLabels} tone="mission" />
    );

    const currentStep = screen.getByTitle('Etapa 2: Dados de acesso');
    expect(currentStep).toHaveAttribute('aria-current', 'step');
  });
});
