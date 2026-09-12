import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ProfileSearchField from './ProfileSearchField';

const mockPush = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: vi.fn(),
    prefetch: vi.fn(),
  }),
}));

describe('ProfileSearchField component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders search input with placeholder and search icon', () => {
    render(<ProfileSearchField placeholder="Pesquisar missionário" />);
    const input = screen.getByPlaceholderText('Pesquisar missionário');
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute('readonly');
  });

  it('navigates to /navegacao on mouse click', async () => {
    const user = userEvent.setup();
    render(<ProfileSearchField />);

    const input = screen.getByPlaceholderText('Pesquisar missionário');
    await user.click(input);

    expect(mockPush).toHaveBeenCalledWith('/navegacao');
  });

  it('navigates to /navegacao on Enter key press', () => {
    render(<ProfileSearchField />);

    const input = screen.getByPlaceholderText('Pesquisar missionário');
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });

    expect(mockPush).toHaveBeenCalledWith('/navegacao');
  });

  it('navigates to /navegacao on Space key press', () => {
    render(<ProfileSearchField />);

    const input = screen.getByPlaceholderText('Pesquisar missionário');
    fireEvent.keyDown(input, { key: ' ', code: 'Space' });

    expect(mockPush).toHaveBeenCalledWith('/navegacao');
  });

  it('navigates to custom href when provided', async () => {
    const user = userEvent.setup();
    render(<ProfileSearchField href="/custom-search" />);

    const input = screen.getByPlaceholderText('Pesquisar missionário');
    await user.click(input);

    expect(mockPush).toHaveBeenCalledWith('/custom-search');
  });
});
