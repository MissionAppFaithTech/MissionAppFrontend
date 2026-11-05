import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import RegisterMissionariesPage from './page';

describe('RegisterMissionariesPage route (/register/missionaries)', () => {
  it('renders missionaries registration wizard', () => {
    render(<RegisterMissionariesPage />);

    expect(screen.getByRole('heading', { name: /cadastro/i })).toBeInTheDocument();
    expect(screen.getAllByText(/dados pessoais/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByLabelText(/nome completo/i)).toBeInTheDocument();
  });
});

describe('missionary sign-up completion', () => {
  it('keeps the pending review screen after the last step, even under StrictMode', async () => {
    const { StrictMode } = await import('react');
    const { useMissionaryRegisterStore } = await import('@/stores/missionaryRegisterStore');
    useMissionaryRegisterStore.setState({ step: 3, formData: { email: 'ana@missao.org' } });
    const { renderWithQuery } = await import('@/test/query');
    const view = renderWithQuery(
      <StrictMode>
        <RegisterMissionariesPage />
      </StrictMode>
    );
    expect(screen.getByText(/dados de acesso/i, { selector: 'h2 *, h2' })).toBeInTheDocument();

    // completeStep3 succeeded.
    const { act } = await import('@testing-library/react');
    act(() => useMissionaryRegisterStore.setState({ step: 4 }));
    view.rerender(
      <StrictMode>
        <RegisterMissionariesPage />
      </StrictMode>
    );

    expect(screen.getByRole('heading', { name: 'Cadastro realizado!' })).toBeInTheDocument();
    expect(screen.getByText('Seu cadastro será analisado')).toBeInTheDocument();
    expect(screen.getByText('ana@missao.org')).toBeInTheDocument();
    expect(useMissionaryRegisterStore.getState().step).toBe(4);
  });

  it('starts over when the page is opened again after finishing', async () => {
    const { useMissionaryRegisterStore } = await import('@/stores/missionaryRegisterStore');
    useMissionaryRegisterStore.setState({ step: 4, formData: { email: 'ana@missao.org' } });

    render(<RegisterMissionariesPage />);

    expect(screen.queryByRole('heading', { name: 'Cadastro realizado!' })).not.toBeInTheDocument();
    expect(screen.getByLabelText(/nome completo/i)).toBeInTheDocument();
    expect(useMissionaryRegisterStore.getState().step).toBe(1);
  });
});
