import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import VisitorProfilePostsSection from './VisitorProfilePostsSection';
import { mockSavedPosts } from '@/mocks/profile';
import { useFeedbackStore } from '@/stores/feedbackStore';

describe('VisitorProfilePostsSection Component', () => {
  beforeEach(() => {
    useFeedbackStore.setState({ current: null });
  });

  it('renders visitor posts list and locked notice', () => {
    render(<VisitorProfilePostsSection posts={mockSavedPosts} />);

    expect(screen.getAllByText(mockSavedPosts[0].authorName).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(mockSavedPosts[0].content)).toBeInTheDocument();
    expect(screen.getByText(/veja todas as postagens e orações/i)).toBeInTheDocument();
  });

  it('renders EmptyState when posts array is empty', () => {
    render(<VisitorProfilePostsSection posts={[]} />);

    expect(
      screen.getByRole('heading', { level: 3, name: /nenhuma publicação no momento/i })
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        /este missionário ainda não compartilhou atualizações públicas ou pedidos de oração/i
      )
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /explorar outras missões/i })).toBeInTheDocument();
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
    expect(useFeedbackStore.getState().current).toMatchObject({
      message: 'Link copiado para a área de transferência!',
      severity: 'success',
    });
  });
});
