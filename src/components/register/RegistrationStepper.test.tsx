import { render, screen, within } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import RegistrationStepper from './RegistrationStepper';

describe('RegistrationStepper component', () => {
  const stepLabels = ['Dados pessoais', 'Dados ministeriais', 'Dados de acesso'];

  it('is an ordered list of steps inside the progress navigation', () => {
    render(<RegistrationStepper currentStep={2} totalSteps={3} stepLabels={stepLabels} />);

    const nav = screen.getByRole('navigation', { name: 'Progresso do cadastro' });
    expect(within(nav).getByText('Etapa 2 de 3')).toBeVisible();
    const items = within(nav).getAllByRole('listitem');
    expect(items).toHaveLength(3);
    expect(nav.querySelector('ol')).not.toBeNull();
  });

  it('says in text whether each step is done, current or pending', () => {
    render(<RegistrationStepper currentStep={2} totalSteps={3} stepLabels={stepLabels} />);

    const [first, second, third] = screen.getAllByRole('listitem');
    expect(first).toHaveTextContent('Dados pessoais, etapa 1, concluída');
    expect(second).toHaveTextContent('Dados ministeriais, etapa 2, atual');
    expect(third).toHaveTextContent('Dados de acesso, etapa 3, pendente');
  });

  it('marks only the current step with aria-current="step"', () => {
    render(<RegistrationStepper currentStep={3} totalSteps={3} stepLabels={stepLabels} />);

    const items = screen.getAllByRole('listitem');
    expect(items[2]).toHaveAttribute('aria-current', 'step');
    expect(items[0]).not.toHaveAttribute('aria-current');
    expect(items[1]).not.toHaveAttribute('aria-current');
  });

  it('shows only the steps that exist', () => {
    render(
      <RegistrationStepper
        currentStep={1}
        totalSteps={2}
        stepLabels={['Dados pessoais', 'Dados de acesso', 'Extra']}
      />
    );

    expect(screen.getAllByRole('listitem')).toHaveLength(2);
    expect(screen.queryByText(/extra/i)).not.toBeInTheDocument();
  });
});
