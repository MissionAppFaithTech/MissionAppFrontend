import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import SupporterMissionariesPage from './supporter/missionarios/page';

describe('Supporter Profile routes', () => {
  it('renders followed missionaries list for supporter', () => {
    render(<SupporterMissionariesPage />);

    expect(screen.getByText(/missionários em destaque/i)).toBeInTheDocument();
  });
});
