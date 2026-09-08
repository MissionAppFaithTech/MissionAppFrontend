import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import EmptyState from './EmptyState';

describe('EmptyState component', () => {
  it('renders title and description correctly', () => {
    render(
      <EmptyState
        title="Nenhum item encontrado"
        description="Tente ajustar sua busca ou limpar os filtros para ver mais resultados."
      />
    );

    expect(
      screen.getByRole('heading', { level: 3, name: /nenhum item encontrado/i })
    ).toBeInTheDocument();
    expect(
      screen.getByText(/tente ajustar sua busca ou limpar os filtros para ver mais resultados/i)
    ).toBeInTheDocument();
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('renders action button when actionLabel and onAction are provided', async () => {
    const handleAction = vi.fn();
    const user = userEvent.setup();

    render(
      <EmptyState
        title="Sem publicações"
        description="Este missionário ainda não publicou atualizações."
        actionLabel="Voltar ao início"
        onAction={handleAction}
      />
    );

    const button = screen.getByRole('button', { name: /voltar ao início/i });
    expect(button).toBeInTheDocument();

    await user.click(button);
    expect(handleAction).toHaveBeenCalledTimes(1);
  });

  it('renders action as a link when actionHref is provided', () => {
    render(
      <EmptyState
        title="Nenhuma campanha"
        description="Conheça outras causas e faça parte."
        actionLabel="Explorar campanhas"
        actionHref="/campanhas"
      />
    );

    const link = screen.getByRole('link', { name: /explorar campanhas/i });
    expect(link).toHaveAttribute('href', '/campanhas');
  });
});
