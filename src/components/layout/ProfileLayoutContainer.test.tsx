import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ProfileLayoutContainer from './ProfileLayoutContainer';

let mockPathname = '/profile';

vi.mock('next/navigation', () => ({
  usePathname: () => mockPathname,
}));

describe('ProfileLayoutContainer component', () => {
  beforeEach(() => {
    mockPathname = '/profile';
  });

  it('renders children with main landmark and standard bottom padding on non-edit pages', () => {
    mockPathname = '/profile';
    render(
      <ProfileLayoutContainer>
        <div>Content Inside Profile</div>
      </ProfileLayoutContainer>
    );

    const main = screen.getByRole('main');
    expect(main).toBeInTheDocument();
    expect(main).toHaveAttribute('id', 'main-content');
    expect(screen.getByText('Content Inside Profile')).toBeInTheDocument();
  });

  it('renders clean free layout on missionary edit profile page', () => {
    mockPathname = '/profile/edit-profile';
    render(
      <ProfileLayoutContainer>
        <div>Edit Form Screen</div>
      </ProfileLayoutContainer>
    );

    const main = screen.getByRole('main');
    expect(main).toBeInTheDocument();
    expect(screen.getByText('Edit Form Screen')).toBeInTheDocument();
  });

  it('renders clean free layout on impact project edit page', () => {
    mockPathname = '/profile/projetos-de-impacto/edit';
    render(
      <ProfileLayoutContainer>
        <div>Edit Impact Project Screen</div>
      </ProfileLayoutContainer>
    );

    const main = screen.getByRole('main');
    expect(main).toBeInTheDocument();
  });

  it('renders clean free layout on supporter edit profile page', () => {
    mockPathname = '/profile/supporter/edit-profile';
    render(
      <ProfileLayoutContainer>
        <div>Edit Supporter Profile Screen</div>
      </ProfileLayoutContainer>
    );

    const main = screen.getByRole('main');
    expect(main).toBeInTheDocument();
  });

  it('renders clean free layout on missionary financial settings page (/profile/financeiro)', () => {
    mockPathname = '/profile/financeiro';
    render(
      <ProfileLayoutContainer>
        <div>Financial Settings Form Screen</div>
      </ProfileLayoutContainer>
    );

    const main = screen.getByRole('main');
    expect(main).toBeInTheDocument();
    expect(screen.getByText('Financial Settings Form Screen')).toBeInTheDocument();
  });
});
