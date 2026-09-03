import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import SelectRolePage from './page';

describe('SelectRolePage route (/select-role)', () => {
  it('renders role options for supporters and missionaries', () => {
    render(<SelectRolePage />);

    expect(screen.getByText(/como você quer usar o mission app/i)).toBeInTheDocument();

    const supporterBtn = screen.getByRole('link', { name: /sou um apoiador/i });
    expect(supporterBtn).toHaveAttribute('href', '/register/supporters');

    const missionaryBtn = screen.getByRole('link', { name: /sou um missionário/i });
    expect(missionaryBtn).toHaveAttribute('href', '/register/missionaries');
  });
});
