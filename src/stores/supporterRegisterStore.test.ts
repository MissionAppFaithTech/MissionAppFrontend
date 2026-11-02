import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useSupporterRegisterStore } from './supporterRegisterStore';
import * as accountService from '@/services/account.service';
import * as catalogService from '@/services/catalog.service';
import { EMPTY_FAITH_COMMUNITY, SELECT_OTHER } from '@/forms/register/options';

vi.mock('@/services/account.service', () => ({
  registerAccount: vi.fn().mockResolvedValue({ id: 'acc-2' }),
  toApiGender: vi.fn((g) => (g === 'feminino' ? 'FEMALE' : 'MALE')),
  toE164Phone: vi.fn((p) => p.replace(/\D/g, '')),
}));

vi.mock('@/services/catalog.service', () => ({
  createFaithCommunity: vi.fn().mockResolvedValue({ id: 'fc-2' }),
}));

describe('supporterRegisterStore', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useSupporterRegisterStore.getState().reset();
  });

  it('starts on step 1 with empty formData', () => {
    const state = useSupporterRegisterStore.getState();
    expect(state.step).toBe(1);
    expect(state.formData).toEqual({});
  });

  it('progresses to step 2 on completeStep1', () => {
    const { completeStep1 } = useSupporterRegisterStore.getState();

    completeStep1({
      fullName: 'Maria Apoiadora',
      birthDate: '1995-05-10',
      gender: 'feminino',
      phone: '11988888888',
      email: 'maria@example.com',
      faithCommunity: 'comunidade-1',
      communityDetails: EMPTY_FAITH_COMMUNITY,
    });

    const state = useSupporterRegisterStore.getState();
    expect(state.step).toBe(2);
    expect(state.formData.fullName).toBe('Maria Apoiadora');
    expect(state.formData.email).toBe('maria@example.com');
  });

  it('navigates back using goBack', () => {
    useSupporterRegisterStore.setState({ step: 2 });
    useSupporterRegisterStore.getState().goBack();
    expect(useSupporterRegisterStore.getState().step).toBe(1);

    useSupporterRegisterStore.getState().goBack();
    expect(useSupporterRegisterStore.getState().step).toBe(1);
  });

  it('calls registerAccount and advances to step 3 on completeStep2', async () => {
    useSupporterRegisterStore.setState({
      formData: {
        fullName: 'Maria Apoiadora',
        birthDate: '1995-05-10',
        gender: 'feminino',
        phone: '11988888888',
        email: 'maria@example.com',
        faithCommunity: 'comunidade-1',
        communityDetails: EMPTY_FAITH_COMMUNITY,
      },
      step: 2,
    });

    await useSupporterRegisterStore.getState().completeStep2({
      username: 'mariaapoiadora',
      password: 'StrongPassword123!',
      confirmPassword: 'StrongPassword123!',
    });

    expect(accountService.registerAccount).toHaveBeenCalledWith(
      expect.objectContaining({
        fullName: 'Maria Apoiadora',
        username: 'mariaapoiadora',
        email: 'maria@example.com',
      })
    );
    expect(useSupporterRegisterStore.getState().step).toBe(3);
  });

  it('creates custom community when SELECT_OTHER is chosen', async () => {
    useSupporterRegisterStore.setState({
      formData: {
        fullName: 'Maria Apoiadora',
        birthDate: '1995-05-10',
        gender: 'feminino',
        phone: '11988888888',
        email: 'maria@example.com',
        faithCommunity: SELECT_OTHER,
        communityDetails: { ...EMPTY_FAITH_COMMUNITY, name: 'Igreja Local' },
      },
      step: 2,
    });

    await useSupporterRegisterStore.getState().completeStep2({
      username: 'mariaapoiadora',
      password: 'StrongPassword123!',
      confirmPassword: 'StrongPassword123!',
    });

    expect(catalogService.createFaithCommunity).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'Igreja Local' })
    );

    // Verify password is stripped from store formData for security
    const currentFormData = useSupporterRegisterStore.getState().formData as Record<
      string,
      unknown
    >;
    expect(currentFormData.password).toBeUndefined();
    expect(currentFormData.confirmPassword).toBeUndefined();
  });

  it('throws error if personal data is missing on completeStep2', async () => {
    useSupporterRegisterStore.setState({ formData: {}, step: 2 });

    await expect(
      useSupporterRegisterStore.getState().completeStep2({
        username: 'test',
        password: 'Pass',
        confirmPassword: 'Pass',
      })
    ).rejects.toThrow('Complete os dados pessoais antes de finalizar o cadastro');
  });

  it('persists the draft to sessionStorage (not localStorage) without passwords', () => {
    window.localStorage.clear();
    useSupporterRegisterStore.setState({
      step: 2,
      formData: {
        fullName: 'Maria Apoiadora',
        password: 'StrongPassword123!',
        confirmPassword: 'StrongPassword123!',
      },
    });

    const raw = window.sessionStorage.getItem('missionapp_supporter_register_v1');
    expect(raw).toBeTruthy();
    expect(JSON.parse(raw!).state).toEqual({ step: 2, formData: { fullName: 'Maria Apoiadora' } });
    expect(window.localStorage.getItem('missionapp_supporter_register_v1')).toBeNull();

    useSupporterRegisterStore.getState().reset();
    expect(window.sessionStorage.getItem('missionapp_supporter_register_v1')).toBeNull();
  });

  it('does not persist step 3 in storage so returning to register starts fresh', () => {
    useSupporterRegisterStore.setState({ step: 3, formData: { fullName: 'Maria' } });
    useSupporterRegisterStore.getState().reset();
    expect(useSupporterRegisterStore.getState().step).toBe(1);
    expect(useSupporterRegisterStore.getState().formData).toEqual({});
  });
});
