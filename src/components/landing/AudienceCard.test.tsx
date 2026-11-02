import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import AudienceCard from './AudienceCard';

describe('AudienceCard', () => {
  it('shows the audience text and icon without a phone mockup', () => {
    render(
      <AudienceCard
        label="Para Missionários"
        title="Se você está na missão"
        benefit="Compartilhe atualizações facilmente."
        accentColor="primary.main"
        icon="/icons/your-space.PNG"
        layout="row"
      />
    );

    expect(screen.getByRole('heading', { name: /para missionários/i })).toBeVisible();
    expect(screen.getByText(/compartilhe atualizações facilmente/i)).toBeVisible();

    const icons = document.querySelectorAll('img');
    expect(icons).toHaveLength(1);
    expect(icons[0]).toHaveAttribute('src', expect.stringContaining('your-space'));
    expect(icons[0]).toHaveAttribute('alt', '');
  });
});
