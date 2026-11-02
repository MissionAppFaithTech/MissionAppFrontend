import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import ActiveSessionsSection from './ActiveSessionsSection';
import { listActiveSessions, terminateAllSessions } from '@/services/auth.service';
import { useFeedbackStore } from '@/stores/feedbackStore';
import { useSessionStore } from '@/stores/sessionStore';

const replace = vi.fn();
const router = { replace, push: vi.fn(), refresh: vi.fn(), prefetch: vi.fn() };
vi.mock('next/navigation', () => ({ useRouter: () => router }));

vi.mock('@/services/auth.service', () => ({
  listActiveSessions: vi.fn(),
  terminateAllSessions: vi.fn(),
}));

const sessions = [
  {
    id: 's1',
    deviceType: 'web' as const,
    deviceName: 'Chrome no Windows',
    ipAddress: null,
    lastUsedAt: '2026-10-30T12:00:00.000Z',
    createdAt: '2026-10-29T12:00:00.000Z',
    current: true,
  },
  {
    id: 's2',
    deviceType: 'mobile' as const,
    deviceName: null,
    ipAddress: null,
    lastUsedAt: null,
    createdAt: '2026-10-28T12:00:00.000Z',
    current: false,
  },
];

describe('ActiveSessionsSection', () => {
  const expire = vi.fn();

  beforeEach(() => {
    vi.mocked(listActiveSessions).mockReset();
    vi.mocked(terminateAllSessions).mockReset();
    replace.mockClear();
    expire.mockClear();
    useSessionStore.setState({ expire });
    useFeedbackStore.setState({ current: null });
  });

  it('lists the sessions and marks the current device with text', async () => {
    vi.mocked(listActiveSessions).mockResolvedValue(sessions);
    render(<ActiveSessionsSection />);

    expect(await screen.findByText('Chrome no Windows')).toBeInTheDocument();
    expect(screen.getByText('Celular')).toBeInTheDocument();
    expect(screen.getByText('Este aparelho')).toBeInTheDocument();
    expect(screen.getAllByRole('listitem')).toHaveLength(2);
  });

  it('shows the error with a retry action', async () => {
    const user = userEvent.setup();
    vi.mocked(listActiveSessions)
      .mockRejectedValueOnce(new Error('Não foi possível carregar as sessões'))
      .mockResolvedValueOnce(sessions);
    render(<ActiveSessionsSection />);

    expect(await screen.findByRole('alert')).toHaveTextContent(/não foi possível carregar/i);
    await user.click(screen.getByRole('button', { name: /tentar novamente/i }));

    expect(await screen.findByText('Chrome no Windows')).toBeInTheDocument();
  });

  it('ends every session, clears local data and goes to login', async () => {
    const user = userEvent.setup();
    vi.mocked(listActiveSessions).mockResolvedValue(sessions);
    vi.mocked(terminateAllSessions).mockResolvedValue({ message: 'ok' });
    render(<ActiveSessionsSection />);

    await user.click(screen.getByRole('button', { name: /encerrar todas as sessões/i }));

    await waitFor(() => expect(replace).toHaveBeenCalledWith('/login'));
    expect(expire).toHaveBeenCalled();
    expect(useFeedbackStore.getState().current?.message).toMatch(/sessões foram encerradas/i);
  });
});
