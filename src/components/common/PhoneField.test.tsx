import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import PhoneField, { withDialCode } from './PhoneField';

describe('PhoneField', () => {
  it('associates the visible label with the phone input', () => {
    render(<PhoneField value="" onChange={vi.fn()} />);

    expect(screen.getByLabelText(/^telefone$/i)).toBeInTheDocument();
  });

  it('links the validation message to the input without relying on color alone', () => {
    render(<PhoneField value="" onChange={vi.fn()} error helperText="Informe seu telefone" />);

    const input = screen.getByLabelText(/^telefone$/i);
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input).toHaveAccessibleDescription(/informe seu telefone/i);
    expect(screen.getByText(/informe seu telefone/i)).toBeInTheDocument();
  });

  it('names the country selector for assistive tech', () => {
    render(<PhoneField value="" onChange={vi.fn()} />);

    expect(screen.getByRole('combobox', { name: /país do telefone/i })).toBeInTheDocument();
  });

  it('associates an external Typography label when hideLabel is set', () => {
    render(
      <>
        <label htmlFor="publicPhone">Telefone:</label>
        <PhoneField id="publicPhone" hideLabel size="small" value="" onChange={vi.fn()} />
      </>
    );

    expect(screen.getByLabelText(/^telefone:$/i)).toBeInTheDocument();
    expect(screen.queryByText(/^telefone$/i)).not.toBeInTheDocument();
  });

  it('notifies the parent when the number is typed', async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();

    render(<PhoneField value="" onChange={handleChange} />);
    await user.type(screen.getByLabelText(/^telefone$/i), '11987654321');

    expect(handleChange).toHaveBeenCalled();
  });

  it('treats a pasted or autofilled number without "+" as national (not +21…)', () => {
    const onChange = vi.fn();
    render(<PhoneField value="" onChange={onChange} />);

    fireEvent.change(screen.getByLabelText(/^telefone$/i), { target: { value: '21987654321' } });

    expect(onChange).toHaveBeenLastCalledWith('+5521987654321');
  });
});

describe('withDialCode', () => {
  it.each([
    ['21987654321', '+5521987654321'],
    ['(21) 98765-4321', '+5521987654321'],
    ['5521987654321', '+5521987654321'],
    ['+5521987654321', '+5521987654321'],
    ['+1 415 555 0100', '+1 415 555 0100'],
    ['2', '+552'],
    // DDD 55 (RS): 11 national digits that happen to start with the country code
    ['(55) 98765-4321', '+5555987654321'],
    ['55123', '+5555123'],
    [' +5521987654321', ' +5521987654321'],
    ['abc', 'abc'],
    ['', ''],
  ])('%s → %s', (raw, expected) => {
    expect(withDialCode(raw, '55')).toBe(expected);
  });
});
