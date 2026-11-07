import { render, screen, within, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import RegistrationReview from './RegistrationReview';
import AdminRegistrationsProvider from './AdminRegistrationsProvider';

let id = '1';
vi.mock('next/navigation', () => ({ useParams: () => ({ id }) }));
const renderReview = () =>
  render(
    <AdminRegistrationsProvider>
      <RegistrationReview />
    </AdminRegistrationsProvider>
  );

describe('RegistrationReview', () => {
  beforeEach(() => {
    id = '1';
  });
  it('shows the selected registration with personal, ministry and access data', () => {
    renderReview();
    expect(
      screen.getByRole('heading', { name: 'Análise de cadastro', level: 1 })
    ).toBeInTheDocument();
    for (const title of ['Dados pessoais', 'Dados ministeriais', 'Dados de acesso'])
      expect(screen.getByRole('heading', { name: title, level: 2 })).toBeInTheDocument();
    expect(screen.getByText('ana.carolina')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Voltar para missionários' })).toHaveAttribute(
      'href',
      '/admin'
    );
  });
  it('approves locally and prevents a second decision', async () => {
    const user = userEvent.setup();
    renderReview();
    await user.click(screen.getByRole('button', { name: 'Aprovar cadastro' }));
    expect(screen.getByRole('status')).toHaveTextContent('Cadastro aprovado.');
    expect(screen.queryByRole('button', { name: 'Aprovar cadastro' })).not.toBeInTheDocument();
    await waitFor(() => expect(screen.getByRole('status')).toHaveFocus());
  });
  it('validates the reason, preserves input and records a rejection', async () => {
    const user = userEvent.setup();
    renderReview();
    await user.click(screen.getByRole('button', { name: 'Reprovar cadastro' }));
    const dialog = screen.getByRole('dialog', { name: 'Reprovar cadastro' });
    expect(dialog).toHaveAccessibleDescription(/Descreva o que precisa ser corrigido/);
    const reason = within(dialog).getByRole('textbox', { name: /Motivo da reprovação/ });
    await user.type(reason, '   ');
    await user.click(within(dialog).getByRole('button', { name: 'Reprovar cadastro' }));
    expect(reason).toHaveAttribute('aria-invalid', 'true');
    expect(reason).toHaveAccessibleDescription(/Informe o motivo da reprovação/);
    expect(reason).toHaveFocus();
    await user.clear(reason);
    await user.type(reason, 'Complete a descrição do projeto.');
    await user.click(within(dialog).getByRole('button', { name: 'Reprovar cadastro' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(screen.getByRole('status')).toHaveTextContent('Cadastro reprovado.');
    expect(screen.getByRole('status')).toHaveTextContent(
      'Motivo: Complete a descrição do projeto.'
    );
    await waitFor(() => expect(screen.getByRole('status')).toHaveFocus());
  });
  it('cancels via Escape and restores focus without changing the registration', async () => {
    const user = userEvent.setup();
    renderReview();
    const trigger = screen.getByRole('button', { name: 'Reprovar cadastro' });
    await user.click(trigger);
    await user.type(screen.getByRole('textbox', { name: /Motivo da reprovação/ }), 'Rascunho');
    await user.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(trigger).toHaveFocus();
    expect(screen.getByText('Pendente')).toBeInTheDocument();
    await user.click(trigger);
    expect(screen.getByRole('textbox', { name: /Motivo da reprovação/ })).toHaveValue('');
  });
  it('shows previous decisions and a useful not-found state', () => {
    id = '7';
    const result = renderReview();
    expect(screen.getByRole('status')).toHaveTextContent('Motivo: Complete a descrição');
    expect(screen.queryByRole('button', { name: 'Aprovar cadastro' })).not.toBeInTheDocument();
    result.unmount();
    id = 'missing';
    renderReview();
    expect(screen.getByRole('heading', { name: 'Cadastro não encontrado' })).toBeInTheDocument();
  });
});
