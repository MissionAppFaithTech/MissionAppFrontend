import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { REGISTER_STEP_HEADING_ID } from '@/forms/register/shared/RegisterStepForm';
import { useStepHeadingFocus } from './useStepHeadingFocus';

function Wizard({ step, focusInside = false }: { step: number; focusInside?: boolean }) {
  useStepHeadingFocus(step);
  return (
    <div>
      <h2 id={REGISTER_STEP_HEADING_ID} tabIndex={-1}>
        Passo {step}
      </h2>
      {focusInside ? <button autoFocus>Resumo</button> : null}
    </div>
  );
}

describe('useStepHeadingFocus', () => {
  it('leaves focus alone on the first render', () => {
    render(<Wizard step={1} />);
    expect(document.body).toHaveFocus();
  });

  it('focuses the new step heading when the step changes', () => {
    const { rerender } = render(<Wizard step={1} />);
    rerender(<Wizard step={2} />);
    expect(screen.getByRole('heading', { name: 'Passo 2' })).toHaveFocus();
  });

  it('keeps the focus a step already moved (its error summary)', () => {
    const { rerender } = render(<Wizard step={2} />);
    rerender(<Wizard step={1} focusInside />);
    expect(screen.getByRole('button', { name: 'Resumo' })).toHaveFocus();
  });
});
