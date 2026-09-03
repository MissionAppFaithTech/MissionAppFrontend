import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import VisitorBottomNav from './VisitorBottomNav';

describe('VisitorBottomNav component', () => {
  it('renders all 4 navigation links for mobile visitors', () => {
    render(<VisitorBottomNav />);

    expect(screen.getByRole('link', { name: /explorar/i })).toHaveAttribute('href', '/');
    expect(screen.getByRole('link', { name: /buscar/i })).toHaveAttribute('href', '/#buscar');
    expect(screen.getByRole('link', { name: /campanhas/i })).toHaveAttribute('href', '/#campanhas');
    expect(screen.getByRole('link', { name: /entrar/i })).toHaveAttribute('href', '/login');
  });
});
