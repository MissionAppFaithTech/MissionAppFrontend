import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import ProfileSobreEditContent from './ProfileSobreEditContent';
import { emptyProfile } from '@/services/profile.service';
import { useFeedbackStore } from '@/stores/feedbackStore';
import { OwnerProfileProvider } from '@/components/profile/OwnerProfileProvider';
import { saveProfileAbout } from '@/services/profileSave.service';

const push = vi.fn();
const refresh = vi.fn();
const router = { push, replace: vi.fn(), refresh, prefetch: vi.fn() };
vi.mock('next/navigation', () => ({
  useRouter: () => router,
  usePathname: () => '/profile/sobre/edit',
}));

vi.mock('@/services/profileSave.service', () => ({ saveProfileAbout: vi.fn() }));

const saveAbout = vi.mocked(saveProfileAbout);
const profile = {
  ...emptyProfile,
  username: 'samuel',
  about: { ...emptyProfile.about, lifeVerse: 'João 3:16' },
};
const renderContent = () =>
  render(
    <OwnerProfileProvider profile={profile}>
      <ProfileSobreEditContent />
    </OwnerProfileProvider>
  );

describe('ProfileSobreEditContent', () => {
  beforeEach(() => {
    push.mockClear();
    refresh.mockClear();
    saveAbout.mockReset();
    useFeedbackStore.setState({ current: null });
  });

  it('saves once, confirms, returns to Sobre and re-reads the profile', async () => {
    const user = userEvent.setup();
    saveAbout.mockResolvedValue(undefined);
    renderContent();

    await user.type(screen.getByLabelText(/versículo para a vida/i), '!');
    await user.click(screen.getByRole('button', { name: /salvar/i }));

    await waitFor(() => expect(push).toHaveBeenCalledWith('/profile/sobre'));
    expect(saveAbout).toHaveBeenCalledTimes(1);
    expect(saveAbout).toHaveBeenCalledWith({
      about: { lifeVerse: 'João 3:16!' },
      workAddress: undefined,
    });
    expect(useFeedbackStore.getState().current?.message).toBe('Sobre atualizado com sucesso.');
    expect(refresh).toHaveBeenCalledTimes(1);
  });

  it('cancel returns without saving', async () => {
    const user = userEvent.setup();
    renderContent();

    await user.click(screen.getByRole('button', { name: /cancelar/i }));

    expect(push).toHaveBeenCalledWith('/profile/sobre');
    expect(saveAbout).not.toHaveBeenCalled();
    expect(refresh).not.toHaveBeenCalled();
  });
});
