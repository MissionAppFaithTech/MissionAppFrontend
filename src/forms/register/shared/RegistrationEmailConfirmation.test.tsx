import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { useMissionaryRegisterStore } from '@/stores/missionaryRegisterStore';
import { useSupporterRegisterStore } from '@/stores/supporterRegisterStore';
import RegistrationEmailConfirmation from './RegistrationEmailConfirmation';

describe('RegistrationEmailConfirmation', () => {
  it('separates the success title from the e-mail confirmation subtitle', () => {
    render(<RegistrationEmailConfirmation email="ana@mission.app" requiresReview />);

    expect(screen.getByRole('heading', { name: /cadastro realizado!/i })).toBeInTheDocument();
    expect(screen.getAllByText('Confirme seu e-mail').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('ana@mission.app')).toBeInTheDocument();
  });

  it('explains the missionary review flow in three short steps', () => {
    render(<RegistrationEmailConfirmation requiresReview />);

    const nextSteps = screen.getByRole('heading', { name: /o que acontece agora\?/i });
    expect(nextSteps).toBeInTheDocument();

    expect(screen.getByText('Clique no link enviado para seu e-mail.')).toBeInTheDocument();
    expect(screen.getByText('Seu cadastro será analisado')).toBeInTheDocument();
    expect(
      screen.getByText('Nossa equipe verificará as informações cadastradas.')
    ).toBeInTheDocument();
    expect(screen.getByText('Acesso liberado')).toBeInTheDocument();
    expect(
      screen.getByText(/após confirmar seu e-mail, nossa equipe irá analisar seu cadastro/i)
    ).toBeInTheDocument();
  });

  it('omits team review for supporters who only need e-mail confirmation', () => {
    render(<RegistrationEmailConfirmation />);

    expect(screen.queryByText('Seu cadastro será analisado')).not.toBeInTheDocument();
    expect(
      screen.getByText(/após confirmar seu e-mail, o acesso à plataforma será liberado/i)
    ).toBeInTheDocument();
  });

  it('keeps the 7-day deadline and navigation actions with left Home and right Login', () => {
    render(<RegistrationEmailConfirmation requiresReview />);

    expect(screen.getByText(/7 dias/i)).toBeInTheDocument();
    const links = screen.getAllByRole('link');
    // First button (left) is Ir para início, second button (right) is Ir para login
    expect(links[0]).toHaveTextContent(/ir para início/i);
    expect(links[0]).toHaveAttribute('href', '/');
    expect(links[1]).toHaveTextContent(/ir para login/i);
    expect(links[1]).toHaveAttribute('href', '/login');
  });

  it('resets missionary and supporter registration stores on navigation or unmount', () => {
    const missionaryResetSpy = vi.spyOn(useMissionaryRegisterStore.getState(), 'reset');
    const supporterResetSpy = vi.spyOn(useSupporterRegisterStore.getState(), 'reset');

    const { unmount } = render(<RegistrationEmailConfirmation />);

    const homeLink = screen.getByRole('link', { name: /ir para início/i });
    fireEvent.click(homeLink);

    expect(missionaryResetSpy).toHaveBeenCalled();
    expect(supporterResetSpy).toHaveBeenCalled();

    const callsBeforeUnmount = missionaryResetSpy.mock.calls.length;
    unmount();
    expect(missionaryResetSpy.mock.calls.length).toBeGreaterThan(callsBeforeUnmount);
  });
});
