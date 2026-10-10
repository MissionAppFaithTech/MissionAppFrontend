import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import GenderField from './GenderField';

describe('GenderField', () => {
  it('renders compact gender options', () => {
    render(<GenderField onChange={vi.fn()} />);

    expect(screen.getByText('Gênero')).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: /feminino/i })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: /masculino/i })).toBeInTheDocument();
  });

  it('notifies when an option is selected', async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();

    render(<GenderField onChange={handleChange} />);

    await user.click(screen.getByRole('radio', { name: /feminino/i }));
    expect(handleChange).toHaveBeenCalledWith('feminino');
  });
});
