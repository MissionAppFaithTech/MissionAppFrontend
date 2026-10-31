import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import LimitedTextField from './LimitedTextField';

describe('LimitedTextField', () => {
  it('caps the input natively and stays quiet below the limit', () => {
    render(<LimitedTextField id="city" label="Cidade" value="Rio" maxLength={5} />);

    expect(screen.getByLabelText('Cidade')).toHaveAttribute('maxlength', '5');
    expect(screen.getByRole('status')).toBeEmptyDOMElement();
  });

  it('explains the limit and links the message to the input once it is reached', () => {
    render(<LimitedTextField id="zip" label="CEP" value="12345" maxLength={5} />);

    expect(screen.getByRole('status')).toHaveTextContent('Você atingiu o limite de 5 caracteres');
    expect(screen.getByLabelText('CEP')).toHaveAccessibleDescription(
      expect.stringContaining('Você atingiu o limite de 5 caracteres')
    );
  });

  it('keeps the validation error described alongside the limit', () => {
    render(
      <LimitedTextField
        id="state"
        label="Estado"
        value="SP"
        maxLength={255}
        error
        helperText="Informe o estado"
        htmlInputProps={{ 'aria-invalid': true }}
      />
    );

    const input = screen.getByLabelText('Estado');
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input).toHaveAccessibleDescription(expect.stringContaining('Informe o estado'));
  });
});
