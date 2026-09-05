import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import SavedPostsSection from './SavedPostsSection';
import { mockSavedPosts } from '@/mocks/profile';

describe('SavedPostsSection Component', () => {
  it('renders saved posts list and handles prayer toggle', async () => {
    const user = userEvent.setup();
    render(<SavedPostsSection posts={mockSavedPosts} />);

    expect(screen.getAllByText(mockSavedPosts[0].authorName).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(mockSavedPosts[0].content)).toBeInTheDocument();

    const prayButtons = screen.getAllByRole('button', { name: /orei/i });
    expect(prayButtons.length).toBeGreaterThan(0);
    await user.click(prayButtons[0]);
  });

  it('copies current URL to clipboard and displays toast when clicking share button', async () => {
    const user = userEvent.setup();
    const writeTextMock = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText: writeTextMock },
      configurable: true,
      writable: true,
    });

    render(<SavedPostsSection posts={mockSavedPosts} />);

    const shareButtons = screen.getAllByRole('button', { name: /compartilhar/i });
    expect(shareButtons.length).toBeGreaterThan(0);
    await user.click(shareButtons[0]);

    expect(writeTextMock).toHaveBeenCalledWith(window.location.href);
    expect(
      await screen.findByText(/link copiado para a área de transferência!/i)
    ).toBeInTheDocument();
  });
});
