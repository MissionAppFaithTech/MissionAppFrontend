import { screen, waitFor, within } from '@testing-library/react';
import { renderWithQuery } from '@/test/query';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import ActiveSessionsSection from './ActiveSessionsSection';
import { endSession, listActiveSessions, terminateAllSessions } from '@/services/auth.service';
import { useFeedbackStore } from '@/stores/feedbackStore';
import { clearUserStores } from '@/stores/sessionStore';

const replace = vi.fn();
const refresh = vi.fn();
const router = { replace, push: vi.fn(), refresh, prefetch: vi.fn() };
vi.mock('next/navigation', () => ({ useRouter: () => router }));
vi.mock('@/stores/sessionStore', () => ({ clearUserStores: vi.fn() }));

vi.mock('@/services/auth.service', () => ({
  listActiveSessions: vi.fn(),
  terminateAllSessions: vi.fn(),
  endSession: vi.fn(),
}));

const sessions = [
  {
    id: 's1',
    deviceType: 'web' as const,
    deviceKind: 'desktop' as const,
    deviceName: 'Chrome no Windows',
    ipAddress: null,
    lastUsedAt: '2026-10-30T12:00:00.000Z',
    createdAt: '2026-10-29T12:00:00.000Z',
    startedAt: '2026-10-20T12:00:00.000Z',
    current: true,
  },
  {
    id: 's2',
    deviceType: 'web' as const,
    deviceKind: 'mobile' as const,
    deviceName: 'Mobile Safari no iOS',
    ipAddress: null,
    lastUsedAt: '2026-10-31T12:00:00.000Z',
    createdAt: '2026-10-31T12:00:00.000Z',
    startedAt: '2026-10-28T12:00:00.000Z',
    current: false,
  },
  {
    id: 's3',
    deviceType: 'mobile' as const,
    deviceKind: 'unknown' as const,
    deviceName: null,
    ipAddress: null,
    lastUsedAt: null,
    createdAt: '2026-10-27T12:00:00.000Z',
    startedAt: '2026-10-27T12:00:00.000Z',
    current: false,
  },
];

const formatDate = (iso: string) =>
  new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' }).format(
    new Date(iso)
  );

describe('ActiveSessionsSection', () => {
  beforeEach(() => {
    vi.mocked(listActiveSessions).mockReset();
    vi.mocked(terminateAllSessions).mockReset();
    vi.mocked(endSession).mockReset();
    replace.mockClear();
    refresh.mockClear();
    vi.mocked(clearUserStores).mockClear();
    useFeedbackStore.setState({ current: null });
  });

  it('lists the sessions and marks the current device with text', async () => {
    vi.mocked(listActiveSessions).mockResolvedValue(sessions);
    renderWithQuery(<ActiveSessionsSection />);

    expect(await screen.findByText('Chrome no Windows')).toBeInTheDocument();
    expect(screen.getByText('Este aparelho')).toBeInTheDocument();
    expect(screen.getAllByRole('listitem')).toHaveLength(3);
  });

  it('names the device kind in text, with the session start and last use', async () => {
    vi.mocked(listActiveSessions).mockResolvedValue(sessions);
    renderWithQuery(<ActiveSessionsSection />);

    const [pc, phone, app] = await screen.findAllByRole('listitem');
    expect(pc).toHaveTextContent(
      `Computador · Conectado desde ${formatDate(sessions[0].startedAt)}`
    );
    expect(pc).toHaveTextContent(`Último acesso: ${formatDate(sessions[0].lastUsedAt!)}`);
    expect(phone).toHaveTextContent('Mobile Safari no iOS');
    expect(phone).toHaveTextContent('Celular · Conectado desde');
    // NOTE: sessions without a kind fall back to the client type (app → phone).
    expect(app).toHaveTextContent('Celular');
    expect(app).toHaveTextContent(`Último acesso: ${formatDate(sessions[2].createdAt)}`);
  });

  it('lists this device first even when another one was used later', async () => {
    vi.mocked(listActiveSessions).mockResolvedValue([sessions[1], sessions[0]]);
    renderWithQuery(<ActiveSessionsSection />);

    const [first] = await screen.findAllByRole('listitem');
    expect(first).toHaveTextContent('Este aparelho');
  });

  it('labels a session with no kind or name as a generic device', async () => {
    vi.mocked(listActiveSessions).mockResolvedValue([
      { ...sessions[2], deviceType: 'web' as const, id: 's4' },
    ]);
    renderWithQuery(<ActiveSessionsSection />);

    const [item] = await screen.findAllByRole('listitem');
    expect(item).toHaveTextContent('Aparelho');
    expect(item).toHaveTextContent('Aparelho · Conectado desde');
  });

  it('offers "Encerrar" only on other devices', async () => {
    vi.mocked(listActiveSessions).mockResolvedValue(sessions);
    renderWithQuery(<ActiveSessionsSection />);

    const [current] = await screen.findAllByRole('listitem');
    expect(within(current).queryByRole('button')).not.toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Encerrar sessão: Mobile Safari no iOS' })
    ).toBeVisible();
    expect(screen.getByRole('button', { name: 'Encerrar sessão: Celular' })).toBeVisible();
  });

  it('confirms in a dialog, ends the other session and refreshes the list', async () => {
    const user = userEvent.setup();
    vi.mocked(listActiveSessions)
      .mockResolvedValueOnce(sessions)
      .mockResolvedValue([sessions[0], sessions[2]]);
    vi.mocked(endSession).mockResolvedValue({ message: 'Sessão encerrada.' });
    renderWithQuery(<ActiveSessionsSection />);

    await user.click(
      await screen.findByRole('button', { name: 'Encerrar sessão: Mobile Safari no iOS' })
    );

    const dialog = screen.getByRole('dialog', { name: 'Encerrar esta sessão?' });
    expect(dialog).toHaveAccessibleDescription(
      'Mobile Safari no iOS (celular) será desconectado e precisará entrar novamente.'
    );
    expect(within(dialog).getByRole('button', { name: 'Cancelar' })).toHaveFocus();

    await user.click(within(dialog).getByRole('button', { name: 'Encerrar sessão' }));

    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(endSession).toHaveBeenCalledWith('s2');
    expect(await screen.findAllByRole('listitem')).toHaveLength(2);
    expect(screen.queryByText('Mobile Safari no iOS')).not.toBeInTheDocument();
    expect(useFeedbackStore.getState().current?.message).toBe(
      'Sessão encerrada: Mobile Safari no iOS.'
    );
    expect(replace).not.toHaveBeenCalled();
  });

  it('closes the dialog without ending the session on Cancelar or Escape', async () => {
    const user = userEvent.setup();
    vi.mocked(listActiveSessions).mockResolvedValue(sessions);
    renderWithQuery(<ActiveSessionsSection />);

    const trigger = await screen.findByRole('button', {
      name: 'Encerrar sessão: Mobile Safari no iOS',
    });
    await user.click(trigger);
    await user.click(screen.getByRole('button', { name: 'Cancelar' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());

    await user.click(trigger);
    await user.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    await waitFor(() => expect(trigger).toHaveFocus());

    expect(endSession).not.toHaveBeenCalled();
  });

  it('keeps the dialog open with the error when ending fails', async () => {
    const user = userEvent.setup();
    vi.mocked(listActiveSessions).mockResolvedValue(sessions);
    vi.mocked(endSession).mockRejectedValue(new Error('Sessão não encontrada'));
    renderWithQuery(<ActiveSessionsSection />);

    await user.click(
      await screen.findByRole('button', { name: 'Encerrar sessão: Mobile Safari no iOS' })
    );
    await user.click(screen.getByRole('button', { name: 'Encerrar sessão' }));

    const dialog = screen.getByRole('dialog');
    expect(await within(dialog).findByRole('alert')).toHaveTextContent('Sessão não encontrada');
    expect(useFeedbackStore.getState().current).toBeNull();
  });

  it('uses a generic message when ending fails without one', async () => {
    const user = userEvent.setup();
    vi.mocked(listActiveSessions).mockResolvedValue(sessions);
    vi.mocked(endSession).mockRejectedValue('boom');
    renderWithQuery(<ActiveSessionsSection />);

    await user.click(await screen.findByRole('button', { name: 'Encerrar sessão: Celular' }));
    await user.click(screen.getByRole('button', { name: 'Encerrar sessão' }));

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Não foi possível encerrar a sessão'
    );
  });

  it('shows the error with a retry action', async () => {
    const user = userEvent.setup();
    vi.mocked(listActiveSessions)
      .mockRejectedValueOnce(new Error('Não foi possível carregar as sessões'))
      .mockResolvedValueOnce(sessions);
    renderWithQuery(<ActiveSessionsSection />);

    expect(await screen.findByRole('alert')).toHaveTextContent(/não foi possível carregar/i);
    await user.click(screen.getByRole('button', { name: /tentar novamente/i }));

    expect(await screen.findByText('Chrome no Windows')).toBeInTheDocument();
  });

  it('ends every session, clears local data and goes to login', async () => {
    const user = userEvent.setup();
    vi.mocked(listActiveSessions).mockResolvedValue(sessions);
    vi.mocked(terminateAllSessions).mockResolvedValue({ message: 'ok' });
    renderWithQuery(<ActiveSessionsSection />);

    await user.click(screen.getByRole('button', { name: /encerrar todas as sessões/i }));

    await waitFor(() => expect(replace).toHaveBeenCalledWith('/login'));
    expect(clearUserStores).toHaveBeenCalled();
    expect(refresh).toHaveBeenCalled();
    expect(useFeedbackStore.getState().current?.message).toMatch(/sessões foram encerradas/i);
  });
});
