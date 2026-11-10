import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ApiError } from '@/lib/api/client';
import { useFeedbackStore } from '@/stores/feedbackStore';
import ReportDialog, {
  REPORT_DUPLICATE_MESSAGE,
  REPORT_FAILURE_MESSAGE,
  REPORT_SUCCESS_MESSAGE,
} from './ReportDialog';

const push = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push }),
  usePathname: () => '/user/maria',
}));
const submitReport = vi.fn();
vi.mock('@/services/report.service', () => ({
  submitReport: (...args: unknown[]) => submitReport(...args),
}));

function setup(targetType: 'profile' | 'project' | 'post' = 'profile') {
  const onClose = vi.fn();
  render(<ReportDialog open targetType={targetType} targetId="t1" onClose={onClose} />);
  return { onClose, user: userEvent.setup() };
}

beforeEach(() => {
  vi.clearAllMocks();
  useFeedbackStore.setState({ current: null });
});

describe('ReportDialog', () => {
  it('shows the title, X, question, 5 reasons and a disabled DENUNCIAR', () => {
    setup();
    expect(screen.getByRole('dialog', { name: 'Denunciar' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Fechar' })).toBeInTheDocument();
    expect(
      screen.getByRole('radiogroup', { name: /Por que você está denunciando este perfil\?/ })
    ).toBeInTheDocument();
    expect(screen.getAllByRole('radio')).toHaveLength(5);
    expect(screen.getByRole('button', { name: 'DENUNCIAR' })).toBeDisabled();
  });

  it.each([
    ['project', /este projeto\?/],
    ['post', /esta postagem\?/],
  ] as const)('words the question for a %s', (type, pattern) => {
    setup(type);
    expect(screen.getByRole('radiogroup', { name: pattern })).toBeInTheDocument();
  });

  it('reveals the free text only for "Outro" and requires it', async () => {
    const { user } = setup();
    expect(screen.queryByLabelText(/Escreva a razão da Denúncia/)).not.toBeInTheDocument();
    await user.click(screen.getByRole('radio', { name: 'Outro' }));
    expect(screen.getByLabelText(/Escreva a razão da Denúncia/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'DENUNCIAR' })).toBeDisabled();
    await user.type(screen.getByLabelText(/Escreva a razão da Denúncia/), 'motivo');
    expect(screen.getByRole('button', { name: 'DENUNCIAR' })).toBeEnabled();
  });

  it('blocks more than 250 words and flags the field', async () => {
    const { user } = setup();
    await user.click(screen.getByRole('radio', { name: 'Outro' }));
    const field = screen.getByLabelText(/Escreva a razão da Denúncia/);
    await act(async () => {
      await user.click(field);
      await user.paste(Array(251).fill('a').join(' '));
    });
    expect(field).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByRole('alert')).toHaveTextContent('251 de 250');
    expect(screen.getByRole('button', { name: 'DENUNCIAR' })).toBeDisabled();
  });

  it('sends, closes and shows the success toast', async () => {
    submitReport.mockResolvedValue(undefined);
    const { user, onClose } = setup('post');
    await user.click(screen.getByRole('radio', { name: 'Spam ou conteúdo indesejado' }));
    await user.click(screen.getByRole('button', { name: 'DENUNCIAR' }));

    await waitFor(() => expect(onClose).toHaveBeenCalled());
    expect(submitReport).toHaveBeenCalledWith({
      targetType: 'post',
      targetId: 't1',
      reason: 'spam',
    });
    expect(useFeedbackStore.getState().current).toMatchObject({
      message: REPORT_SUCCESS_MESSAGE,
      severity: 'success',
    });
  });

  it('sends the details with "Outro"', async () => {
    submitReport.mockResolvedValue(undefined);
    const { user } = setup();
    await user.click(screen.getByRole('radio', { name: 'Outro' }));
    await user.type(screen.getByLabelText(/Escreva a razão da Denúncia/), ' golpe ');
    await user.click(screen.getByRole('button', { name: 'DENUNCIAR' }));
    await waitFor(() =>
      expect(submitReport).toHaveBeenCalledWith({
        targetType: 'profile',
        targetId: 't1',
        reason: 'other',
        details: 'golpe',
      })
    );
  });

  it('closes and shows the error toast when the request fails', async () => {
    submitReport.mockRejectedValue(new ApiError('boom', 500));
    const { user, onClose } = setup();
    await user.click(screen.getByRole('radio', { name: 'Assédio ou bullying' }));
    await user.click(screen.getByRole('button', { name: 'DENUNCIAR' }));

    await waitFor(() => expect(onClose).toHaveBeenCalled());
    expect(useFeedbackStore.getState().current).toMatchObject({
      message: REPORT_FAILURE_MESSAGE,
      severity: 'error',
    });
  });

  it('tells the user when the content was already reported (409)', async () => {
    submitReport.mockRejectedValue(new ApiError('dup', 409));
    const { user } = setup();
    await user.click(screen.getByRole('radio', { name: 'Assédio ou bullying' }));
    await user.click(screen.getByRole('button', { name: 'DENUNCIAR' }));
    await waitFor(() =>
      expect(useFeedbackStore.getState().current?.message).toBe(REPORT_DUPLICATE_MESSAGE)
    );
  });

  it('sends anonymous visitors (401) to the login', async () => {
    submitReport.mockRejectedValue(new ApiError('no', 401));
    const { user } = setup();
    await user.click(screen.getByRole('radio', { name: 'Assédio ou bullying' }));
    await user.click(screen.getByRole('button', { name: 'DENUNCIAR' }));
    await waitFor(() => expect(push).toHaveBeenCalledWith('/login?next=%2Fuser%2Fmaria'));
  });

  it('closes with the X', async () => {
    const { user, onClose } = setup();
    await user.click(screen.getByRole('button', { name: 'Fechar' }));
    expect(onClose).toHaveBeenCalled();
  });
});
