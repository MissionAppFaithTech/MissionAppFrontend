import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { MissionaryRegisterData } from '@/forms/register/types';
import {
  EMPTY_FAITH_COMMUNITY,
  EMPTY_MISSIONARY_AGENCY,
  SELECT_OTHER,
} from '@/forms/register/options';
import { ApiError } from '@/lib/api/client';
import * as accountService from '@/services/account.service';
import * as authService from '@/services/auth.service';
import * as catalogService from '@/services/catalog.service';
import * as missionaryService from '@/services/missionary.service';
import { useMissionaryRegisterStore } from './missionaryRegisterStore';

vi.mock('@/services/account.service', () => ({
  registerAccount: vi.fn(),
  toApiGender: vi.fn((g: string) => (g === 'feminino' ? 'FEMALE' : 'MALE')),
  toE164Phone: vi.fn((p: string) => `+55${p.replace(/\D/g, '')}`),
}));

vi.mock('@/services/auth.service', () => ({
  login: vi.fn(),
}));

vi.mock('@/services/catalog.service', () => ({
  createMissionaryAgency: vi.fn(),
  createFaithCommunity: vi.fn(),
}));

vi.mock('@/services/missionary.service', () => ({
  createMissionaryProfile: vi.fn(),
  linkFaithCommunity: vi.fn(),
}));

const registerAccount = vi.mocked(accountService.registerAccount);
const login = vi.mocked(authService.login);
const createMissionaryAgency = vi.mocked(catalogService.createMissionaryAgency);
const createFaithCommunity = vi.mocked(catalogService.createFaithCommunity);
const createMissionaryProfile = vi.mocked(missionaryService.createMissionaryProfile);
const linkFaithCommunity = vi.mocked(missionaryService.linkFaithCommunity);

const STORAGE_KEY = 'missionapp_missionary_register_v1';
const PASSWORD = 'StrongPassword123!';
const credentials = { username: 'joaomissao', password: PASSWORD, confirmPassword: PASSWORD };

const draft: Partial<MissionaryRegisterData> = {
  fullName: 'João Missionário',
  birthDate: '1990-01-01',
  gender: 'masculino',
  document: '12345678909',
  phone: '(11) 99999-9999',
  email: '  Joao@Example.com ',
  missionaryAgency: 'agency-1',
  agencyDetails: EMPTY_MISSIONARY_AGENCY,
  missionDescription: 'Evangelismo no interior',
  faithCommunity: 'community-1',
  communityDetails: EMPTY_FAITH_COMMUNITY,
};

function startStep3(overrides: Partial<MissionaryRegisterData> = {}) {
  useMissionaryRegisterStore.setState({ formData: { ...draft, ...overrides }, step: 3 });
}

const submit = () => useMissionaryRegisterStore.getState().completeStep3(credentials);

function readPersisted(): { state: Record<string, unknown> } | null {
  const raw = window.sessionStorage.getItem(STORAGE_KEY);
  return raw ? JSON.parse(raw) : null;
}

describe('missionaryRegisterStore', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    registerAccount.mockResolvedValue({ user: {} as never });
    login.mockResolvedValue({ user: {} as never });
    createMissionaryAgency.mockResolvedValue({ id: 'agency-new', name: 'Nova Agência' });
    createFaithCommunity.mockResolvedValue({ id: 'community-new', name: 'Nova Comunidade' });
    createMissionaryProfile.mockResolvedValue({ id: 'missionary-1' });
    linkFaithCommunity.mockResolvedValue(undefined);
    useMissionaryRegisterStore.getState().reset();
    window.sessionStorage.clear();
    window.localStorage.clear();
  });

  afterEach(() => {
    window.sessionStorage.clear();
    window.localStorage.clear();
  });

  describe('wizard navigation', () => {
    it('starts on step 1 with an empty draft and no submission progress', () => {
      const state = useMissionaryRegisterStore.getState();
      expect(state.step).toBe(1);
      expect(state.formData).toEqual({});
      expect(state.submission).toEqual({});
    });

    it('accumulates form data through steps 1 and 2', () => {
      const { completeStep1, completeStep2 } = useMissionaryRegisterStore.getState();

      completeStep1({
        fullName: 'João Missionário',
        birthDate: '1990-01-01',
        gender: 'masculino',
        document: '12345678909',
        phone: '11999999999',
        email: 'joao@example.com',
      });
      expect(useMissionaryRegisterStore.getState().step).toBe(2);

      completeStep2({
        missionaryAgency: 'agency-1',
        agencyDetails: EMPTY_MISSIONARY_AGENCY,
        missionDescription: 'Evangelismo',
        faithCommunity: 'community-1',
        communityDetails: EMPTY_FAITH_COMMUNITY,
      });

      const state = useMissionaryRegisterStore.getState();
      expect(state.step).toBe(3);
      expect(state.formData).toMatchObject({
        fullName: 'João Missionário',
        missionaryAgency: 'agency-1',
      });
    });

    it('updateFormData merges and setStep jumps', () => {
      useMissionaryRegisterStore.getState().updateFormData({ fullName: 'A' });
      useMissionaryRegisterStore.getState().updateFormData({ email: 'a@b.c' });
      useMissionaryRegisterStore.getState().setStep(3);

      expect(useMissionaryRegisterStore.getState()).toMatchObject({
        step: 3,
        formData: { fullName: 'A', email: 'a@b.c' },
      });
    });

    it('goBack never goes below step 1', () => {
      useMissionaryRegisterStore.setState({ step: 2 });
      useMissionaryRegisterStore.getState().goBack();
      expect(useMissionaryRegisterStore.getState().step).toBe(1);
      useMissionaryRegisterStore.getState().goBack();
      expect(useMissionaryRegisterStore.getState().step).toBe(1);
    });
  });

  describe('completeStep3 validation', () => {
    it('throws when personal data is missing and calls no service', async () => {
      useMissionaryRegisterStore.setState({ formData: { missionaryAgency: 'agency-1' }, step: 3 });

      await expect(submit()).rejects.toThrow(
        'Complete os dados pessoais antes de finalizar o cadastro'
      );
      expect(registerAccount).not.toHaveBeenCalled();
    });

    it('throws when the e-mail is only whitespace', async () => {
      startStep3({ email: '   ' });
      await expect(submit()).rejects.toThrow('Complete os dados pessoais');
      expect(registerAccount).not.toHaveBeenCalled();
    });

    it('throws when no agency is selected, before creating the account', async () => {
      startStep3({ missionaryAgency: '' });

      await expect(submit()).rejects.toThrow(
        'Selecione a agência missionária antes de finalizar o cadastro'
      );
      expect(registerAccount).not.toHaveBeenCalled();
      expect(createMissionaryProfile).not.toHaveBeenCalled();
      expect(useMissionaryRegisterStore.getState().step).toBe(3);
    });
  });

  describe('completeStep3 happy path', () => {
    it('registers, creates the missionary, logs in again, then links the community', async () => {
      startStep3();

      await submit();

      expect(registerAccount).toHaveBeenCalledWith({
        fullName: 'João Missionário',
        username: 'joaomissao',
        phoneNumber: '+5511999999999',
        gender: 'MALE',
        email: 'joao@example.com',
        password: PASSWORD,
        passwordConfirmation: PASSWORD,
      });
      expect(createMissionaryProfile).toHaveBeenCalledWith('agency-1');
      expect(login).toHaveBeenCalledWith({ login: 'joao@example.com', password: PASSWORD });
      expect(linkFaithCommunity).toHaveBeenCalledWith('community-1');

      const order = [registerAccount, createMissionaryProfile, login, linkFaithCommunity].map(
        (fn) => fn.mock.invocationCallOrder[0]
      );
      expect(order).toEqual([...order].sort((a, b) => a - b));

      expect(createMissionaryAgency).not.toHaveBeenCalled();
      expect(createFaithCommunity).not.toHaveBeenCalled();
    });

    it('advances to step 4, clears submission progress and drops the password', async () => {
      startStep3();
      await submit();

      const state = useMissionaryRegisterStore.getState();
      expect(state.step).toBe(4);
      expect(state.submission).toEqual({});
      expect(state.formData).toMatchObject({
        fullName: 'João Missionário',
        username: 'joaomissao',
      });
      expect(state.formData).not.toHaveProperty('password');
      expect(state.formData).not.toHaveProperty('confirmPassword');
    });

    it('logs in but does not link a community when none was chosen', async () => {
      startStep3({ faithCommunity: '' });
      await submit();

      expect(login).toHaveBeenCalledTimes(1);
      expect(linkFaithCommunity).not.toHaveBeenCalled();
      expect(useMissionaryRegisterStore.getState().step).toBe(4);
    });

    it('creates the new agency and community when SELECT_OTHER is chosen', async () => {
      startStep3({
        missionaryAgency: SELECT_OTHER,
        agencyDetails: { ...EMPTY_MISSIONARY_AGENCY, name: 'Nova Agência' },
        faithCommunity: SELECT_OTHER,
        communityDetails: { ...EMPTY_FAITH_COMMUNITY, name: 'Nova Comunidade' },
      });

      await submit();

      expect(createMissionaryAgency).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'Nova Agência' })
      );
      expect(createFaithCommunity).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'Nova Comunidade' })
      );
      expect(createMissionaryProfile).toHaveBeenCalledWith('agency-new');
      expect(linkFaithCommunity).toHaveBeenCalledWith('community-new');
    });

    it('skips the community when SELECT_OTHER has no name', async () => {
      startStep3({ faithCommunity: SELECT_OTHER, communityDetails: EMPTY_FAITH_COMMUNITY });
      await submit();

      expect(createFaithCommunity).not.toHaveBeenCalled();
      expect(linkFaithCommunity).not.toHaveBeenCalled();
      expect(useMissionaryRegisterStore.getState().step).toBe(4);
    });

    it('throws when SELECT_OTHER agency has no name, keeping the account progress', async () => {
      startStep3({ missionaryAgency: SELECT_OTHER, agencyDetails: EMPTY_MISSIONARY_AGENCY });

      await expect(submit()).rejects.toThrow('Informe os dados da nova agência missionária');
      expect(createMissionaryAgency).not.toHaveBeenCalled();
      expect(createMissionaryProfile).not.toHaveBeenCalled();
      expect(useMissionaryRegisterStore.getState().submission).toEqual({ accountCreated: true });
      expect(useMissionaryRegisterStore.getState().step).toBe(3);
    });
  });

  describe('completeStep3 failures and retries', () => {
    it('stays on step 3 with no progress when registerAccount fails', async () => {
      startStep3();
      const error = new ApiError('E-mail já cadastrado', 409, { email: 'Em uso' });
      registerAccount.mockRejectedValueOnce(error);

      await expect(submit()).rejects.toBe(error);

      expect(useMissionaryRegisterStore.getState().step).toBe(3);
      expect(useMissionaryRegisterStore.getState().submission).toEqual({});
      expect(createMissionaryProfile).not.toHaveBeenCalled();
      expect(login).not.toHaveBeenCalled();
    });

    it('does not re-create the account or catalog items when retrying after createMissionaryProfile fails', async () => {
      startStep3({
        missionaryAgency: SELECT_OTHER,
        agencyDetails: { ...EMPTY_MISSIONARY_AGENCY, name: 'Nova Agência' },
        faithCommunity: SELECT_OTHER,
        communityDetails: { ...EMPTY_FAITH_COMMUNITY, name: 'Nova Comunidade' },
      });
      createMissionaryProfile.mockRejectedValueOnce(new ApiError('Falha', 500));

      await expect(submit()).rejects.toThrow('Falha');
      expect(useMissionaryRegisterStore.getState()).toMatchObject({
        step: 3,
        submission: { accountCreated: true, agencyId: 'agency-new', communityId: 'community-new' },
      });
      expect(login).not.toHaveBeenCalled();

      await submit();

      expect(registerAccount).toHaveBeenCalledTimes(1);
      expect(createMissionaryAgency).toHaveBeenCalledTimes(1);
      expect(createFaithCommunity).toHaveBeenCalledTimes(1);
      expect(createMissionaryProfile).toHaveBeenCalledTimes(2);
      expect(createMissionaryProfile).toHaveBeenLastCalledWith('agency-new');
      expect(login).toHaveBeenCalledTimes(1);
      expect(linkFaithCommunity).toHaveBeenCalledWith('community-new');
      expect(useMissionaryRegisterStore.getState().step).toBe(4);
    });

    it('does not re-create the missionary when retrying after login fails', async () => {
      startStep3();
      login.mockRejectedValueOnce(new Error('E-mail ou senha inválidos'));

      await expect(submit()).rejects.toThrow('E-mail ou senha inválidos');
      expect(useMissionaryRegisterStore.getState().submission).toMatchObject({
        accountCreated: true,
        missionaryCreated: true,
      });
      expect(linkFaithCommunity).not.toHaveBeenCalled();

      await submit();

      expect(registerAccount).toHaveBeenCalledTimes(1);
      expect(createMissionaryProfile).toHaveBeenCalledTimes(1);
      expect(login).toHaveBeenCalledTimes(2);
      expect(linkFaithCommunity).toHaveBeenCalledTimes(1);
      expect(useMissionaryRegisterStore.getState().step).toBe(4);
    });

    it('retries only login + link when linkFaithCommunity fails', async () => {
      startStep3();
      linkFaithCommunity.mockRejectedValueOnce(new ApiError('Comunidade inválida', 422));

      await expect(submit()).rejects.toThrow('Comunidade inválida');
      expect(useMissionaryRegisterStore.getState().step).toBe(3);

      await submit();

      expect(registerAccount).toHaveBeenCalledTimes(1);
      expect(createMissionaryProfile).toHaveBeenCalledTimes(1);
      expect(linkFaithCommunity).toHaveBeenCalledTimes(2);
      expect(useMissionaryRegisterStore.getState().step).toBe(4);
    });
  });

  describe('persistence', () => {
    it('stores the draft in sessionStorage without passwords or submission progress', () => {
      useMissionaryRegisterStore.setState({
        step: 3,
        formData: { ...draft, password: PASSWORD, confirmPassword: PASSWORD },
        submission: { accountCreated: true },
      });

      const persisted = readPersisted();
      expect(persisted?.state).toMatchObject({
        step: 3,
        formData: { fullName: 'João Missionário' },
      });
      expect(persisted?.state).not.toHaveProperty('submission');
      expect(window.sessionStorage.getItem(STORAGE_KEY)).not.toContain(PASSWORD);
      expect(window.localStorage.getItem(STORAGE_KEY)).toBeNull();
    });

    it('never writes the password to storage during a submission', async () => {
      const setItem = vi.spyOn(Storage.prototype, 'setItem');
      startStep3();

      await submit();

      for (const [, value] of setItem.mock.calls) {
        expect(value).not.toContain(PASSWORD);
      }
      setItem.mockRestore();
    });

    it('persists the completion screen as a fresh step 1', async () => {
      startStep3();
      await submit();

      expect(useMissionaryRegisterStore.getState().step).toBe(4);
      expect(readPersisted()?.state).toEqual({ step: 1, formData: {} });
    });

    it('reset clears state, submission progress and sessionStorage', () => {
      useMissionaryRegisterStore.setState({
        step: 3,
        formData: { fullName: 'Test' },
        submission: { accountCreated: true },
      });
      expect(readPersisted()).not.toBeNull();

      useMissionaryRegisterStore.getState().reset();

      expect(useMissionaryRegisterStore.getState()).toMatchObject({
        step: 1,
        formData: {},
        submission: {},
      });
      expect(readPersisted()).toBeNull();
    });
  });
});
