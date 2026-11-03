import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import RouteError from './RouteError';

describe('RouteError', () => {
  it('explains the failure in a main landmark and retries on demand', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    const retry = vi.fn();
    const error = new Error('boom');
    render(<RouteError error={error} retry={retry} title="Não foi possível carregar o perfil" />);

    expect(screen.getByRole('main')).toHaveAttribute('id', 'main-content');
    expect(
      screen.getByRole('heading', { level: 1, name: 'Não foi possível carregar o perfil' })
    ).toBeInTheDocument();
    expect(screen.getByRole('alert')).toHaveTextContent(/servidor não respondeu/i);
    expect(screen.getByRole('link', { name: 'Ir para o início' })).toHaveAttribute('href', '/');
    expect(consoleError).toHaveBeenCalledWith(error);

    await userEvent.setup().click(screen.getByRole('button', { name: 'Tentar novamente' }));
    expect(retry).toHaveBeenCalledTimes(1);
    consoleError.mockRestore();
  });
});
