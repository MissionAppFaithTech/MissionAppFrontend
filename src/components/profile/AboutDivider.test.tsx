import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import AboutDivider from './AboutDivider';

/** The emotion rule of an element (jsdom does not resolve CSS variables). */
const cssFor = (element: Element) => {
  const emotionClass = [...element.classList].find((name) => name.startsWith('css-'));
  return [...document.querySelectorAll('style')]
    .map((style) => style.textContent ?? '')
    .find((css) => emotionClass && css.includes(`.${emotionClass}`));
};

describe('AboutDivider', () => {
  it('is a separator drawn with the darker field border token', () => {
    render(<AboutDivider />);

    expect(cssFor(screen.getByRole('separator'))).toContain(
      'border-color:var(--mui-palette-action2-fieldBorder)'
    );
  });
});
