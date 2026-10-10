import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import RegisterCatalogSelect from './RegisterCatalogSelect';

describe('RegisterCatalogSelect', () => {
  it('renders catalog options from the API', async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();

    render(
      <RegisterCatalogSelect
        id="missionaryAgency"
        label="Agência missionária"
        value=""
        onChange={handleChange}
        options={[{ id: 'agency-1', name: 'JOCUM' }]}
      />
    );

    await user.click(screen.getByLabelText(/agência missionária/i));
    expect(await screen.findByRole('option', { name: 'JOCUM' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: /não encontrei na lista/i })).toBeInTheDocument();
  });
});
