import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import ReportKebabMenu from './ReportKebabMenu';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
  usePathname: () => '/',
}));
vi.mock('@/services/report.service', () => ({ submitReport: vi.fn() }));

describe('ReportKebabMenu', () => {
  it('opens a menu with "Denunciar", which opens the report modal', async () => {
    const user = userEvent.setup();
    render(<ReportKebabMenu targetType="post" targetId="p1" />);

    await user.click(screen.getByRole('button', { name: 'Mais opções da postagem' }));
    await user.click(screen.getByRole('menuitem', { name: 'Denunciar' }));

    expect(screen.getByRole('dialog', { name: 'Denunciar' })).toBeInTheDocument();
  });

  it.each([
    ['profile', 'Mais opções do perfil'],
    ['project', 'Mais opções do projeto'],
  ] as const)('labels the %s kebab', (type, label) => {
    render(<ReportKebabMenu targetType={type} targetId="x" />);
    expect(screen.getByRole('button', { name: label })).toBeInTheDocument();
  });
});
