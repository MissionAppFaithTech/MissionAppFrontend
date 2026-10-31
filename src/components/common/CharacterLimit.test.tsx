import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { CharacterCounter, characterLimitStatus, limitReachedMessage } from './CharacterLimit';

describe('characterLimitStatus', () => {
  it('is ok below 90% of the limit', () => {
    expect(characterLimitStatus(0, 70)).toBe('ok');
    expect(characterLimitStatus(62, 70)).toBe('ok');
  });

  it('is near from 90% of the limit', () => {
    expect(characterLimitStatus(63, 70)).toBe('near');
    expect(characterLimitStatus(69, 70)).toBe('near');
  });

  it('is reached at or beyond the limit', () => {
    expect(characterLimitStatus(70, 70)).toBe('reached');
    expect(characterLimitStatus(93, 70)).toBe('reached');
  });
});

describe('limitReachedMessage', () => {
  it('names the limit and how to continue', () => {
    expect(limitReachedMessage(255)).toBe(
      'Você atingiu o limite de 255 caracteres. Para escrever algo novo, apague parte do texto.'
    );
  });
});

describe('CharacterCounter', () => {
  it('uses the singular when one character is left', () => {
    render(<CharacterCounter id="c" length={69} maxLength={70} />);
    expect(screen.getByText('69/70 caracteres · resta 1')).toBeInTheDocument();
  });

  it('shows only the count below the warning zone and at the limit', () => {
    const { rerender } = render(<CharacterCounter id="c" length={10} maxLength={70} />);
    expect(screen.getByText('10/70 caracteres')).toBeInTheDocument();

    rerender(<CharacterCounter id="c" length={70} maxLength={70} />);
    expect(screen.getByText('70/70 caracteres')).toBeInTheDocument();
  });
});
