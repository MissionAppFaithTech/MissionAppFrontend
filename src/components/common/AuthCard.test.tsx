import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { colors, lightTokens } from '@/theme/theme';
import AuthCard from './AuthCard';

describe('AuthCard', () => {
  it('keeps light success and error tokens so status colors do not flip in dark mode', () => {
    render(
      <AuthCard>
        <span>conteúdo</span>
      </AuthCard>
    );

    const card = document.querySelector('[data-auth-card]') as HTMLElement | null;
    expect(card).toBeTruthy();
    const styles = getComputedStyle(card as HTMLElement);
    const normalizeColor = (value: string) => value.replace(/\s+/g, '');
    expect(styles.getPropertyValue('--mui-palette-success-main').trim()).toBe(colors.success);
    expect(styles.getPropertyValue('--mui-palette-error-main').trim()).toBe(colors.error);
    expect(styles.getPropertyValue('--mui-palette-warning-main').trim()).toBe(colors.warning);
    expect(normalizeColor(styles.getPropertyValue('--auth-placeholder-color'))).toBe(
      normalizeColor(lightTokens.textDisabled)
    );
    expect(normalizeColor(styles.getPropertyValue('--mui-palette-action2-disabledFill'))).toBe(
      normalizeColor(lightTokens.disabledFill)
    );
    expect(normalizeColor(styles.getPropertyValue('--mui-palette-action-disabledBackground'))).toBe(
      normalizeColor(lightTokens.disabledFill)
    );
  });

  it('keeps example placeholders muted so they do not look like filled values', () => {
    render(
      <AuthCard>
        <input className="MuiOutlinedInput-input" placeholder="Maria da Silva" />
      </AuthCard>
    );

    const input = document.querySelector('.MuiOutlinedInput-input') as HTMLInputElement | null;
    expect(input).toBeTruthy();
    expect(getComputedStyle(input as HTMLInputElement).webkitTextFillColor).not.toBe(
      lightTokens.textPrimary
    );
  });
});
