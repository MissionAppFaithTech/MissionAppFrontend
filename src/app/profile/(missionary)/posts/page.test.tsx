import { beforeEach, describe, expect, it, vi } from 'vitest';
import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithQuery } from '@/test/query';
import { postFixture, MISSIONARY_ID, IMAGE_ID } from '@/test/posts';
import { OwnerProfileProvider } from '@/components/profile/OwnerProfileProvider';
import { emptyProfile } from '@/services/profile.service';
import { listPosts, getPost, deletePost } from '@/services/post.service';
import ProfilePostsPage from './page';
vi.mock('@/services/post.service', () => ({
  listPosts: vi.fn(),
  getPost: vi.fn(),
  deletePost: vi.fn(),
  createPost: vi.fn(),
  updatePost: vi.fn(),
  uploadPostImage: vi.fn(),
}));
const foreign = {
  ...postFixture,
  id: IMAGE_ID,
  missionaryId: IMAGE_ID,
  content: '<script>alert(1)</script>',
};
beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(listPosts).mockImplementation(async ({ missionaryId } = {}) => ({
    data: { posts: missionaryId ? [postFixture] : [postFixture, foreign] },
    meta: { hasMore: false, nextCursor: null },
  }));
  vi.mocked(getPost).mockResolvedValue(postFixture);
  vi.mocked(deletePost).mockResolvedValue({ id: postFixture.id });
});
function renderPage() {
  return renderWithQuery(
    <OwnerProfileProvider
      profile={{
        ...emptyProfile,
        missionaryId: MISSIONARY_ID,
        role: 'missionary',
        displayName: 'Ana',
      }}
    >
      <ProfilePostsPage />
    </OwnerProfileProvider>
  );
}
describe('real posts UI', () => {
  it('filters own/general posts, renders content as text and hides foreign actions', async () => {
    renderPage();
    await screen.findByText(postFixture.content);
    expect(listPosts).toHaveBeenCalledWith(
      expect.objectContaining({ missionaryId: MISSIONARY_ID, limit: 20 })
    );
    await userEvent.click(screen.getByRole('tab', { name: 'Geral' }));
    await screen.findByText(foreign.content);
    expect(screen.getAllByRole('button', { name: 'Excluir postagem' })).toHaveLength(1);
    expect(document.querySelector('article script')).toBeNull();
  });
  it('loads the current post before editing and confirms deletion', async () => {
    renderPage();
    const user = userEvent.setup();
    await user.click(await screen.findByRole('button', { name: 'Editar postagem' }));
    expect(getPost).toHaveBeenCalledWith(postFixture.id);
    expect(await screen.findByRole('textbox', { name: /legenda/i })).toHaveValue(
      postFixture.content
    );
    expect(screen.getByRole('button', { name: 'Editar postagem' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Excluir postagem' })).toBeDisabled();
    await user.click(screen.getByRole('button', { name: 'Cancelar' }));
    await user.click(screen.getByRole('button', { name: 'Excluir postagem' }));
    const dialog = await screen.findByRole('dialog', { name: 'Excluir postagem?' });
    expect(deletePost).not.toHaveBeenCalled();
    await user.click(within(dialog).getByRole('button', { name: 'Excluir postagem' }));
    await waitFor(() => expect(deletePost).toHaveBeenCalledWith(postFixture.id));
  });
});
