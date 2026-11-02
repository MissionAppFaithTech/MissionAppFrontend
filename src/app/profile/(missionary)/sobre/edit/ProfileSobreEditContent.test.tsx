import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import ProfileSobreEditContent from './ProfileSobreEditContent';
import { emptyProfile } from '@/services/profile.service';
import { useFeedbackStore } from '@/stores/feedbackStore';
import { useProfileStore } from '@/stores/profileStore';

const push = vi.fn();
const router = { push, replace: vi.fn(), refresh: vi.fn(), prefetch: vi.fn() };
vi.mock('next/navigation', () => ({
  useRouter: () => router,
  usePathname: () => '/profile/sobre/edit',
}));

describe('ProfileSobreEditContent', () => {
  const saveAbout = vi.fn();

  beforeEach(() => {
    push.mockClear();
    saveAbout.mockReset();
    useFeedbackStore.setState({ current: null });
    useProfileStore.setState({
      status: 'ready',
      saveAbout,
      profile: {
        ...emptyProfile,
        username: 'samuel',
        about: { ...emptyProfile.about, lifeVerse: 'João 3:16' },
      },
    });
  });

  it('shows a loading state until the fresh profile arrives', () => {
    useProfileStore.setState({ status: 'loading' });
    render(<ProfileSobreEditContent />);

    expect(screen.getByRole('status', { name: /carregando dados do sobre/i })).toBeInTheDocument();
  });

  it('saves through the store once, then confirms and returns to Sobre', async () => {
    const user = userEvent.setup();
    saveAbout.mockResolvedValue(undefined);
    render(<ProfileSobreEditContent />);

    await user.type(screen.getByLabelText(/versículo para a vida/i), '!');
    await user.click(screen.getByRole('button', { name: /salvar/i }));

    await waitFor(() => expect(push).toHaveBeenCalledWith('/profile/sobre'));
    expect(saveAbout).toHaveBeenCalledTimes(1);
    expect(saveAbout).toHaveBeenCalledWith({
      about: { lifeVerse: 'João 3:16!' },
      workAddress: undefined,
    });
    expect(useFeedbackStore.getState().current?.message).toBe('Sobre atualizado com sucesso.');
  });

  it('cancel returns without saving', async () => {
    const user = userEvent.setup();
    render(<ProfileSobreEditContent />);

    await user.click(screen.getByRole('button', { name: /cancelar/i }));

    expect(push).toHaveBeenCalledWith('/profile/sobre');
    expect(saveAbout).not.toHaveBeenCalled();
  });
});
