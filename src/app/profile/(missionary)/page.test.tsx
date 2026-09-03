import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import ProfileAboutPage from './sobre/page';

describe('Missionary Profile routes', () => {
  it('renders missionary profile with summary and navigation tabs', () => {
    render(<ProfileAboutPage />);

    expect(screen.getByRole('button', { name: /editar/i })).toBeInTheDocument();
    expect(screen.getByText('Sobre')).toBeInTheDocument();
  });
});
