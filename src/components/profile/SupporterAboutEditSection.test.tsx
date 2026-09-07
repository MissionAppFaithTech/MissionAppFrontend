import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import SupporterAboutEditSection from '@/components/profile/SupporterAboutEditSection';
import type { ProfileAboutData } from '@/types/profile';

const mockData: ProfileAboutData = {
  introduction: 'Apoiador de missões há 5 anos.',
  originLocation: 'São Paulo - Brasil',
  currentLocation: 'Rio de Janeiro - Brasil',
  faithCommunity: 'Igreja Presbiteriana',
  lifeVerse: 'O Senhor é o meu pastor; de nada terei falta.',
};

describe('SupporterAboutEditSection', () => {
  it('renders all fields including RichTextEditor for introduction and lifeVerse', () => {
    render(<SupporterAboutEditSection data={mockData} onBack={vi.fn()} />);

    expect(
      screen.getByRole('heading', { name: /editar informação do sobre/i })
    ).toBeInTheDocument();
    expect(screen.getByText('Bio / Apresentação:')).toBeInTheDocument();
    expect(screen.getByText('Versículo para a vida:')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Apoiador de missões há 5 anos.')).toBeInTheDocument();
    expect(
      screen.getByDisplayValue('O Senhor é o meu pastor; de nada terei falta.')
    ).toBeInTheDocument();
  });

  it('submits updated data and clears draft storage', async () => {
    const user = userEvent.setup();
    const handleSave = vi.fn();
    const handleBack = vi.fn();

    localStorage.setItem('draft_supporter_about_intro', 'Rascunho temporário');

    render(<SupporterAboutEditSection data={mockData} onBack={handleBack} onSave={handleSave} />);

    const submitBtn = screen.getByRole('button', { name: /salvar/i });
    await user.click(submitBtn);

    await waitFor(() => {
      expect(handleSave).toHaveBeenCalledWith(
        expect.objectContaining({
          introduction: 'Apoiador de missões há 5 anos.',
          originLocation: 'São Paulo - Brasil',
          currentLocation: 'Rio de Janeiro - Brasil',
        })
      );
      expect(handleBack).toHaveBeenCalled();
      expect(localStorage.getItem('draft_supporter_about_intro')).toBeNull();
    });
  });
});
