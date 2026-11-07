import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import AdminRegistrations from './AdminRegistrations';
import AdminRegistrationsProvider from './AdminRegistrationsProvider';

const renderList = () =>
  render(
    <AdminRegistrationsProvider>
      <AdminRegistrations />
    </AdminRegistrationsProvider>
  );

describe('AdminRegistrations', () => {
  it('starts with pending reviews and opens details through named links', () => {
    renderList();
    expect(
      screen.getByRole('heading', { name: 'Missionários cadastrados', level: 1 })
    ).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Pendentes 12', selected: true })).toBeInTheDocument();
    const table = screen.getByRole('table');
    expect(
      within(table).getByRole('link', { name: 'Ver cadastro de Ana Carolina Silva' })
    ).toHaveAttribute('href', '/admin/missionarios/1');
    expect(within(table).getAllByRole('row')).toHaveLength(9);
    expect(screen.getByText('Exibindo 1–8 de 12 missionários')).toBeInTheDocument();
  });
  it('paginates, searches and resets the page when filters change', async () => {
    const user = userEvent.setup();
    renderList();
    // jsdom exposes both responsive variants; exercise the stacked mobile controls.
    const mobilePagination = screen
      .getAllByRole('navigation', { name: 'Páginas de cadastros' })
      .at(-1)!;
    await user.click(within(mobilePagination).getByRole('button', { name: 'Próxima página' }));
    expect(screen.getByText('Exibindo 9–12 de 12 missionários')).toBeInTheDocument();
    await user.click(screen.getByRole('tab', { name: 'Todos 128' }));
    expect(screen.getByText('Exibindo 1–8 de 128 missionários')).toBeInTheDocument();
    await user.type(
      screen.getByRole('textbox', { name: 'Buscar por nome ou e-mail' }),
      'ana.carolina@example.com'
    );
    expect(screen.getByText('Exibindo 1–1 de 1 missionários')).toBeInTheDocument();
    await user.click(screen.getByRole('tab', { name: 'Reprovados 8' }));
    expect(screen.getByRole('heading', { name: 'Nenhum cadastro encontrado' })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Limpar filtros' }));
    expect(screen.getByRole('textbox', { name: 'Buscar por nome ou e-mail' })).toHaveValue('');
    expect(screen.getByRole('tab', { name: 'Todos 128', selected: true })).toBeInTheDocument();
  });
  it('orders registrations by oldest date', async () => {
    const user = userEvent.setup();
    renderList();
    await user.click(screen.getByRole('combobox', { name: 'Ordenar cadastros' }));
    await user.click(screen.getByRole('option', { name: 'Mais antigos' }));
    const rows = within(screen.getByRole('table')).getAllByRole('row');
    expect(rows[1]).toHaveTextContent('Julia Souza');
  });
});
