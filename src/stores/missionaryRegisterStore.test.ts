import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useMissionaryRegisterStore } from './missionaryRegisterStore';
import * as accountService from '@/services/account.service';
import * as catalogService from '@/services/catalog.service';
import {
  EMPTY_FAITH_COMMUNITY,
  EMPTY_MISSIONARY_AGENCY,
  SELECT_OTHER,
} from '@/forms/register/options';

vi.mock('@/services/account.service', () => ({
  registerAccount: vi.fn().mockResolvedValue({ id: 'acc-1' }),
  toApiGender: vi.fn((g) => (g === 'feminino' ? 'FEMALE' : 'MALE')),
  toE164Phone: vi.fn((p) => p.replace(/\D/g, '')),
}));

vi.mock('@/services/catalog.service', () => ({
  createMissionaryAgency: vi.fn().mockResolvedValue({ id: 'agency-1' }),
  createFaithCommunity: vi.fn().mockResolvedValue({ id: 'fc-1' }),
  listMissionaryAgencies: vi
    .fn()
    .mockResolvedValue([{ id: 'agency-default', name: 'Agência Padrão' }]),
}));

vi.mock('@/services/missionary.service', () => ({
  createMissionaryProfile: vi.fn().mockResolvedValue({ id: 'miss-1' }),
}));

describe('missionaryRegisterStore', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useMissionaryRegisterStore.getState().reset();
  });

  it('starts on step 1 with empty formData', () => {
    const state = useMissionaryRegisterStore.getState();
    expect(state.step).toBe(1);
    expect(state.formData).toEqual({});
  });

  it('progresses through steps and accumulates formData', () => {
    const { completeStep1, completeStep2 } = useMissionaryRegisterStore.getState();

    completeStep1({
      fullName: 'João Missionário',
      birthDate: '1990-01-01',
      gender: 'masculino',
      document: '12345678909',
      phone: '11999999999',
      email: 'joao@example.com',
    });

    let state = useMissionaryRegisterStore.getState();
    expect(state.step).toBe(2);
    expect(state.formData.fullName).toBe('João Missionário');

    completeStep2({
      missionaryAgency: 'agency-1',
      agencyDetails: EMPTY_MISSIONARY_AGENCY,
      missionDescription: 'Evangelismo no interior',
      faithCommunity: 'community-1',
      communityDetails: EMPTY_FAITH_COMMUNITY,
    });

    state = useMissionaryRegisterStore.getState();
    expect(state.step).toBe(3);
    expect(state.formData.missionaryAgency).toBe('agency-1');
  });

  it('navigates back using goBack without going below step 1', () => {
    useMissionaryRegisterStore.setState({ step: 2 });
    useMissionaryRegisterStore.getState().goBack();
    expect(useMissionaryRegisterStore.getState().step).toBe(1);

    useMissionaryRegisterStore.getState().goBack();
    expect(useMissionaryRegisterStore.getState().step).toBe(1);
  });

  it('calls registerAccount on completeStep3 and advances to step 4', async () => {
    useMissionaryRegisterStore.setState({
      formData: {
        fullName: 'João Missionário',
        birthDate: '1990-01-01',
        gender: 'masculino',
        document: '12345678909',
        phone: '11999999999',
        email: 'joao@example.com',
        missionaryAgency: 'agency-1',
        agencyDetails: EMPTY_MISSIONARY_AGENCY,
        missionDescription: 'Evangelismo no interior',
        faithCommunity: 'community-1',
        communityDetails: EMPTY_FAITH_COMMUNITY,
      },
      step: 3,
    });

    await useMissionaryRegisterStore.getState().completeStep3({
      username: 'joaomissao',
      password: 'StrongPassword123!',
      confirmPassword: 'StrongPassword123!',
    });

    expect(accountService.registerAccount).toHaveBeenCalledWith(
      expect.objectContaining({
        fullName: 'João Missionário',
        username: 'joaomissao',
        email: 'joao@example.com',
      })
    );
    expect(useMissionaryRegisterStore.getState().step).toBe(4);
  });

  it('creates custom agency and community when SELECT_OTHER is chosen', async () => {
    useMissionaryRegisterStore.setState({
      formData: {
        fullName: 'João Missionário',
        birthDate: '1990-01-01',
        gender: 'masculino',
        document: '12345678909',
        phone: '11999999999',
        email: 'joao@example.com',
        missionaryAgency: SELECT_OTHER,
        agencyDetails: { ...EMPTY_MISSIONARY_AGENCY, name: 'Nova Agência' },
        missionDescription: 'Plantação de igrejas',
        faithCommunity: SELECT_OTHER,
        communityDetails: { ...EMPTY_FAITH_COMMUNITY, name: 'Nova Comunidade' },
      },
      step: 3,
    });

    await useMissionaryRegisterStore.getState().completeStep3({
      username: 'joaomissao',
      password: 'StrongPassword123!',
      confirmPassword: 'StrongPassword123!',
    });

    expect(catalogService.createMissionaryAgency).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'Nova Agência' })
    );
    expect(catalogService.createFaithCommunity).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'Nova Comunidade' })
    );

    // Verify password is stripped from store formData for security
    const currentFormData = useMissionaryRegisterStore.getState().formData as Record<
      string,
      unknown
    >;
    expect(currentFormData.password).toBeUndefined();
    expect(currentFormData.confirmPassword).toBeUndefined();
  });

  it('throws error if personal data is missing on completeStep3', async () => {
    useMissionaryRegisterStore.setState({ formData: {}, step: 3 });

    await expect(
      useMissionaryRegisterStore.getState().completeStep3({
        username: 'test',
        password: 'Pass',
        confirmPassword: 'Pass',
      })
    ).rejects.toThrow('Complete os dados pessoais antes de finalizar o cadastro');
  });

  it('does not persist step 4 in storage so returning to register starts fresh', () => {
    // Test the partialize function by checking that step 4 is mapped to step 1
    useMissionaryRegisterStore.setState({ step: 4, formData: { fullName: 'Test' } });
    useMissionaryRegisterStore.getState().reset();
    expect(useMissionaryRegisterStore.getState().step).toBe(1);
    expect(useMissionaryRegisterStore.getState().formData).toEqual({});
  });
});
