import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import InfoAlert from './InfoAlert';

describe('InfoAlert', () => {
  it('renders the message as an accessible info alert', () => {
    render(
      <InfoAlert>
        Essas informações serão exibidas publicamente para visitantes e apoiadores.
      </InfoAlert>
    );

    const alert = screen.getByRole('alert');
    expect(alert).toHaveTextContent(
      /essas informações serão exibidas publicamente para visitantes e apoiadores/i
    );
  });
});
