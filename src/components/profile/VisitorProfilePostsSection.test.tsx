import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import VisitorProfilePostsSection from './VisitorProfilePostsSection';
import { mockSavedPosts } from '@/mocks/profile';

describe('VisitorProfilePostsSection Component', () => {
  it('renders visitor posts list and locked notice', () => {
    render(<VisitorProfilePostsSection posts={mockSavedPosts} />);

    expect(screen.getAllByText(mockSavedPosts[0].authorName).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(mockSavedPosts[0].content)).toBeInTheDocument();
    expect(screen.getByText(/veja todas as postagens e orações/i)).toBeInTheDocument();
  });

  it('copies current URL to clipboard and displays toast when clicking share button', async () => {
    const user = userEvent.setup();
    const writeTextMock = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText: writeTextMock },
      configurable: true,
      writable: true,
    });

    render(<VisitorProfilePostsSection posts={mockSavedPosts} />);

    const shareButtons = screen.getAllByRole('button', { name: /compartilhar/i });
    expect(shareButtons.length).toBeGreaterThan(0);
    await user.click(shareButtons[0]);

    expect(writeTextMock).toHaveBeenCalledWith(window.location.href);
    expect(
      await screen.findByText(/link copiado para a área de transferência!/i)
    ).toBeInTheDocument();
  });
});
