import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import BringMissionAppPage, { generateMetadata } from './page';

describe('BringMissionAppPage route (/leve-o-mission-app-para-sua-igreja)', () => {
  it('renders one main landmark with the adoption page', () => {
    render(<BringMissionAppPage />);

    expect(screen.getByRole('main')).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { level: 1, name: 'Leve o Mission App para sua igreja' })
    ).toBeInTheDocument();
  });

  it('declares its own canonical URL and title', async () => {
    const metadata = await generateMetadata();

    expect(metadata.alternates?.canonical).toBe('/leve-o-mission-app-para-sua-igreja');
    expect(metadata.title).toBe('Leve o Mission App para sua igreja | Mission App');
  });
});
