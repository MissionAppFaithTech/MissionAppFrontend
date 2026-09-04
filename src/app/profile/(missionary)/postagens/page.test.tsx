import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect } from 'vitest';
import ProfilePostsPage from './page';

describe('ProfilePostsPage - Postar button & collapsible Nova Postagem', () => {
  it('initially renders the full-width Postar button and hides the Nova Postagem form', () => {
    render(<ProfilePostsPage />);

    const postarButton = screen.getByRole('button', { name: /^postar$/i });
    expect(postarButton).toBeInTheDocument();
    expect(screen.queryByText(/nova postagem/i)).not.toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /meu feed/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /geral/i })).toBeInTheDocument();
  });

  it('opens Nova Postagem card when Postar button is clicked and hides the Postar button', async () => {
    const user = userEvent.setup();
    render(<ProfilePostsPage />);

    const postarButton = screen.getByRole('button', { name: /^postar$/i });
    await user.click(postarButton);

    expect(screen.getByText(/nova postagem/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/comece a escrever/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/link para o youtube/i)).toBeInTheDocument();
    expect(screen.getByText(/inserir imagens/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /cancelar/i })).toBeInTheDocument();
  });

  it('closes Nova Postagem card when Cancelar button is clicked and restores Postar button', async () => {
    const user = userEvent.setup();
    render(<ProfilePostsPage />);

    // Open card
    const postarButton = screen.getByRole('button', { name: /^postar$/i });
    await user.click(postarButton);
    expect(screen.getByText(/nova postagem/i)).toBeInTheDocument();

    // Click cancel
    const cancelButton = screen.getByRole('button', { name: /cancelar/i });
    await user.click(cancelButton);

    // Card closed, Postar button back
    expect(screen.queryByText(/nova postagem/i)).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^postar$/i })).toBeInTheDocument();
  });

  it('displays the Postar button on both Meu feed and Geral tabs', async () => {
    const user = userEvent.setup();
    render(<ProfilePostsPage />);

    // On Meu feed (default)
    expect(screen.getByRole('button', { name: /^postar$/i })).toBeInTheDocument();

    // Switch to Geral
    const geralTab = screen.getByRole('tab', { name: /geral/i });
    await user.click(geralTab);

    // Postar button is still displayed on Geral
    expect(screen.getByRole('button', { name: /^postar$/i })).toBeInTheDocument();
  });

  it('preserves open Nova Postagem card state when switching between tabs', async () => {
    const user = userEvent.setup();
    render(<ProfilePostsPage />);

    // Open card
    const postarButton = screen.getByRole('button', { name: /^postar$/i });
    await user.click(postarButton);
    expect(screen.getByText(/nova postagem/i)).toBeInTheDocument();

    // Switch to Geral tab
    const geralTab = screen.getByRole('tab', { name: /geral/i });
    await user.click(geralTab);

    // Card remains open
    expect(screen.getByText(/nova postagem/i)).toBeInTheDocument();

    // Switch back to Meu feed
    const meuFeedTab = screen.getByRole('tab', { name: /meu feed/i });
    await user.click(meuFeedTab);

    // Card remains open
    expect(screen.getByText(/nova postagem/i)).toBeInTheDocument();
  });
});
