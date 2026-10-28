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
  createFaithCommunity: vi.fn().mockResolvedValue({ id: 'fc-1' }),
  createMissionaryAgency: vi.fn().mockResolvedValue({ id: 'ma-1' }),
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

  it('progresses to step 2 on completeStep1', () => {
    const { completeStep1 } = useMissionaryRegisterStore.getState();

    completeStep1({
      fullName: 'João Missionário',
      birthDate: '1990-01-01',
      gender: 'masculino',
      document: '12345678900',
      phone: '11999999999',
      email: 'joao@example.com',
    });

    const state = useMissionaryRegisterStore.getState();
    expect(state.step).toBe(2);
    expect(state.formData.fullName).toBe('João Missionário');
    expect(state.formData.email).toBe('joao@example.com');
  });

  it('progresses to step 3 on completeStep2', () => {
    const { completeStep2 } = useMissionaryRegisterStore.getState();

    completeStep2({
      missionaryAgency: 'agency-1',
      agencyDetails: EMPTY_MISSIONARY_AGENCY,
      missionDescription: 'Plantação de igrejas',
      faithCommunity: 'community-1',
      communityDetails: EMPTY_FAITH_COMMUNITY,
    });

    const state = useMissionaryRegisterStore.getState();
    expect(state.step).toBe(3);
    expect(state.formData.missionaryAgency).toBe('agency-1');
  });

  it('navigates back using goBack', () => {
    useMissionaryRegisterStore.setState({ step: 3 });
    useMissionaryRegisterStore.getState().goBack();
    expect(useMissionaryRegisterStore.getState().step).toBe(2);

    useMissionaryRegisterStore.getState().goBack();
    expect(useMissionaryRegisterStore.getState().step).toBe(1);

    // Cannot go below 1
    useMissionaryRegisterStore.getState().goBack();
    expect(useMissionaryRegisterStore.getState().step).toBe(1);
  });

  it('calls registerAccount and advances to step 4 on completeStep3', async () => {
    useMissionaryRegisterStore.setState({
      formData: {
        fullName: 'João Missionário',
        birthDate: '1990-01-01',
        gender: 'masculino',
        document: '12345678900',
        phone: '11999999999',
        email: 'joao@example.com',
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
        document: '12345678900',
        phone: '11999999999',
        email: 'joao@example.com',
        missionaryAgency: SELECT_OTHER,
        agencyDetails: { ...EMPTY_MISSIONARY_AGENCY, name: 'Nova Agência' },
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
});
