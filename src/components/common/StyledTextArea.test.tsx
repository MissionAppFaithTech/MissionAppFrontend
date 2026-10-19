import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import StyledTextArea from './StyledTextArea';

describe('StyledTextArea', () => {
  it('associates the label with the textarea and types a value', async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();

    render(
      <StyledTextArea
        label="Sobre mim"
        value=""
        onChange={handleChange}
        placeholder="Escreva sua apresentação"
      />
    );

    const field = screen.getByLabelText(/sobre mim/i);
    expect(field).toBeInTheDocument();
    expect(field.tagName).toBe('TEXTAREA');
    expect(screen.queryByRole('button', { name: /desfazer alteração/i })).not.toBeInTheDocument();

    await user.type(field, 'Olá');
    expect(handleChange).toHaveBeenCalled();
  });

  it('links the error helper to the field and shows the character count', () => {
    render(
      <StyledTextArea label="Bio" value="abc" maxLength={10} error helperText="Informe uma bio" />
    );

    const field = screen.getByLabelText(/^bio:/i);
    expect(field).toHaveAttribute('aria-invalid', 'true');
    expect(field).toHaveAccessibleDescription(/informe uma bio/i);
    expect(screen.getByText('3/10 caracteres')).toBeInTheDocument();
  });
});
