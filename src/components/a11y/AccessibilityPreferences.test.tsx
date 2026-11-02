import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';
import AccessibilityPreferencesButton from './AccessibilityPreferences';
import { DEFAULT_A11Y_PREFERENCES, useA11yPreferencesStore } from '@/stores/a11yPreferencesStore';

describe('AccessibilityPreferences', () => {
  beforeEach(() => {
    localStorage.clear();
    useA11yPreferencesStore.setState({ ...DEFAULT_A11Y_PREFERENCES });
  });

  it('opens a labelled dialog from the header button', async () => {
    const user = userEvent.setup();
    render(<AccessibilityPreferencesButton />);

    await user.click(screen.getByRole('button', { name: /preferências de acessibilidade/i }));

    const dialog = screen.getByRole('dialog', { name: /acessibilidade/i });
    expect(dialog).toHaveAccessibleDescription(/ajuste a leitura/i);
    expect(within(dialog).getByRole('group', { name: /tamanho do texto/i })).toBeInTheDocument();
  });

  it('changes text size and toggles options with plain-language descriptions', async () => {
    const user = userEvent.setup();
    render(<AccessibilityPreferencesButton />);
    await user.click(screen.getByRole('button', { name: /preferências de acessibilidade/i }));

    await user.click(screen.getByRole('button', { name: /maior \(130%\)/i }));
    const reduceMotion = screen.getByRole('switch', { name: /reduzir movimento/i });
    expect(reduceMotion).toHaveAccessibleDescription(/desliga animações/i);
    await user.click(reduceMotion);

    expect(useA11yPreferencesStore.getState().fontScale).toBe(130);
    expect(useA11yPreferencesStore.getState().reduceMotion).toBe(true);
    expect(document.documentElement.getAttribute('data-a11y-font-scale')).toBe('130');
  });

  it('restores defaults and closes with Escape, returning focus to the trigger', async () => {
    const user = userEvent.setup();
    render(<AccessibilityPreferencesButton />);
    const trigger = screen.getByRole('button', { name: /preferências de acessibilidade/i });
    await user.click(trigger);

    await user.click(screen.getByRole('switch', { name: /alto contraste/i }));
    await user.click(screen.getByRole('button', { name: /restaurar padrão/i }));
    expect(useA11yPreferencesStore.getState().highContrast).toBe(false);

    await user.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(trigger).toHaveFocus();
  });
});
