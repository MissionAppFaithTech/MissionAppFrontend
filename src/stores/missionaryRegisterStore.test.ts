import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { MissionaryRegisterData } from '@/forms/register/types';
import {
  EMPTY_FAITH_COMMUNITY,
  EMPTY_MISSIONARY_AGENCY,
  SELECT_OTHER,
} from '@/forms/register/options';
import { ApiError } from '@/lib/api/client';
import * as accountService from '@/services/account.service';
import { useMissionaryRegisterStore } from './missionaryRegisterStore';

vi.mock('@/services/account.service', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/services/account.service')>();
  return {
    toApiBirthDate: actual.toApiBirthDate,
    registerMissionary: vi.fn(),
    toApiGender: vi.fn((g: string) => (g === 'feminino' ? 'FEMALE' : 'MALE')),
    toE164Phone: vi.fn((p: string) => `+55${p.replace(/\D/g, '')}`),
  };
});

const registerMissionary = vi.mocked(accountService.registerMissionary);

const STORAGE_KEY = 'missionapp_missionary_register_v1';
const PASSWORD = 'StrongPassword123!';
const credentials = { username: 'joaomissao', password: PASSWORD, confirmPassword: PASSWORD };

const draft: Partial<MissionaryRegisterData> = {
  fullName: 'João Missionário',
  birthDate: '25/12/1990',
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
    registerMissionary.mockResolvedValue({ user: {} as never });
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
      expect(registerMissionary).not.toHaveBeenCalled();
    });

    it('throws when the e-mail is only whitespace', async () => {
      startStep3({ email: '   ' });
      await expect(submit()).rejects.toThrow('Complete os dados pessoais');
      expect(registerMissionary).not.toHaveBeenCalled();
    });

    it('throws when the birth date is missing or malformed', async () => {
      startStep3({ birthDate: '' });
      await expect(submit()).rejects.toThrow('Complete os dados pessoais');

      startStep3({ birthDate: '1990-12-25' });
      await expect(submit()).rejects.toThrow('DD/MM/AAAA');
      expect(registerMissionary).not.toHaveBeenCalled();
    });

    it('throws when no agency is selected, before creating the account', async () => {
      startStep3({ missionaryAgency: '' });

      await expect(submit()).rejects.toThrow(
        'Selecione a agência missionária antes de finalizar o cadastro'
      );
      expect(registerMissionary).not.toHaveBeenCalled();
      expect(useMissionaryRegisterStore.getState().step).toBe(3);
    });

    it('throws when SELECT_OTHER agency has no name, before creating the account', async () => {
      startStep3({ missionaryAgency: SELECT_OTHER, agencyDetails: EMPTY_MISSIONARY_AGENCY });

      await expect(submit()).rejects.toThrow('Informe os dados da nova agência missionária');
      expect(registerMissionary).not.toHaveBeenCalled();
      expect(useMissionaryRegisterStore.getState().submission).toEqual({});
    });
  });

  describe('completeStep3 happy path', () => {
    it('signs up the missionary in a single request with every step of the wizard', async () => {
      startStep3();

      await submit();

      expect(registerMissionary).toHaveBeenCalledTimes(1);
      expect(registerMissionary).toHaveBeenCalledWith({
        fullName: 'João Missionário',
        username: 'joaomissao',
        phoneNumber: '+5511999999999',
        gender: 'MALE',
        email: 'joao@example.com',
        password: PASSWORD,
        passwordConfirmation: PASSWORD,
        birthDate: '1990-12-25',
        identityType: 'CPF',
        identityDocument: '12345678909',
        aboutMe: 'Evangelismo no interior',
        missionaryAgencyId: 'agency-1',
        faithCommunityId: 'community-1',
      });
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

    it('sends no community when none was chosen', async () => {
      startStep3({ faithCommunity: '' });
      await submit();

      const payload = registerMissionary.mock.calls[0][0];
      expect(payload).not.toHaveProperty('faithCommunityId');
      expect(payload).not.toHaveProperty('faithCommunity');
      expect(useMissionaryRegisterStore.getState().step).toBe(4);
    });

    it('sends the new agency and community (with the pastor) when SELECT_OTHER is chosen', async () => {
      startStep3({
        missionaryAgency: SELECT_OTHER,
        agencyDetails: { ...EMPTY_MISSIONARY_AGENCY, name: ' Nova Agência ', city: 'Recife' },
        faithCommunity: SELECT_OTHER,
        communityDetails: {
          ...EMPTY_FAITH_COMMUNITY,
          name: 'Nova Comunidade',
          pastorName: ' Pr. João ',
          pastorPhone: '+55 (21) 99876-1234',
        },
      });

      await submit();

      const payload = registerMissionary.mock.calls[0][0];
      expect(payload).not.toHaveProperty('missionaryAgencyId');
      expect(payload).not.toHaveProperty('faithCommunityId');
      expect(payload.missionaryAgency).toMatchObject({ name: 'Nova Agência', city: 'Recife' });
      expect(payload.faithCommunity).toMatchObject({
        name: 'Nova Comunidade',
        pastorName: 'Pr. João',
        pastorPhone: '+5521998761234',
      });
    });

    it('leaves out the document and the description when they are blank', async () => {
      startStep3({ document: '   ', missionDescription: '  ' });
      await submit();

      const payload = registerMissionary.mock.calls[0][0];
      expect(payload).not.toHaveProperty('identityType');
      expect(payload).not.toHaveProperty('identityDocument');
      expect(payload).not.toHaveProperty('aboutMe');
      expect(useMissionaryRegisterStore.getState().step).toBe(4);
    });

    it('trims the description before sending it as aboutMe', async () => {
      startStep3({ missionDescription: '  Plantação de igrejas  ' });
      await submit();

      expect(registerMissionary.mock.calls[0][0].aboutMe).toBe('Plantação de igrejas');
    });

    it('sends a passport when the document has letters', async () => {
      startStep3({ document: 'fx-123456' });
      await submit();

      expect(registerMissionary.mock.calls[0][0]).toMatchObject({
        identityType: 'PASSPORT',
        identityDocument: 'FX123456',
      });
    });

    it('sends no community when SELECT_OTHER has no name', async () => {
      startStep3({ faithCommunity: SELECT_OTHER, communityDetails: EMPTY_FAITH_COMMUNITY });
      await submit();

      expect(registerMissionary.mock.calls[0][0]).not.toHaveProperty('faithCommunity');
      expect(useMissionaryRegisterStore.getState().step).toBe(4);
    });
  });

  describe('completeStep3 failures and retries', () => {
    it('goes back to step 1 with the error when the API rejects a personal field', async () => {
      startStep3();
      registerMissionary.mockRejectedValueOnce(
        new ApiError('Validation failure', 422, { email: 'Este e-mail já está em uso' })
      );

      await expect(submit()).resolves.toBeUndefined();

      expect(useMissionaryRegisterStore.getState()).toMatchObject({
        step: 1,
        stepErrors: { email: 'Este e-mail já está em uso' },
        submission: {},
      });
    });

    it('maps the API field names to the form (phoneNumber → phone, identityDocument → document)', async () => {
      startStep3();
      registerMissionary.mockRejectedValueOnce(
        new ApiError('Validation failure', 422, {
          phoneNumber: 'Telefone inválido',
          identityDocument: 'Documento inválido',
          birthDate: 'Data inválida',
        })
      );

      await submit();

      expect(useMissionaryRegisterStore.getState().stepErrors).toEqual({
        phone: 'Telefone inválido',
        document: 'Documento inválido',
        birthDate: 'Data inválida',
      });
    });

    it('goes back to step 2 when the API rejects the agency, the community or the description', async () => {
      startStep3();
      registerMissionary.mockRejectedValueOnce(
        new ApiError('Validation failure', 422, {
          missionaryAgencyId: 'Agência missionária informada não existe',
          'faithCommunity.pastorPhone': 'Telefone inválido',
          aboutMe: 'Texto longo demais',
        })
      );

      await expect(submit()).resolves.toBeUndefined();

      expect(useMissionaryRegisterStore.getState()).toMatchObject({
        step: 2,
        stepErrors: {
          missionaryAgency: 'Agência missionária informada não existe',
          faithCommunity: 'Nova comunidade de fé: Telefone inválido',
          missionDescription: 'Texto longo demais',
        },
        submission: {},
      });
    });

    it('prefers step 1 when personal and ministry fields fail together', async () => {
      startStep3();
      registerMissionary.mockRejectedValueOnce(
        new ApiError('Validation failure', 422, {
          email: 'Em uso',
          missionaryAgencyId: 'Não existe',
        })
      );

      await submit();

      expect(useMissionaryRegisterStore.getState()).toMatchObject({
        step: 1,
        stepErrors: { email: 'Em uso' },
      });
    });

    it('clears the API errors once step 2 is completed again', () => {
      useMissionaryRegisterStore.setState({
        step: 2,
        stepErrors: { missionaryAgency: 'Não existe' },
      });

      useMissionaryRegisterStore.getState().completeStep2({
        missionaryAgency: 'ma-1',
        agencyDetails: EMPTY_MISSIONARY_AGENCY,
        missionDescription: 'Projeto',
        faithCommunity: '',
        communityDetails: EMPTY_FAITH_COMMUNITY,
      });

      expect(useMissionaryRegisterStore.getState()).toMatchObject({ step: 3, stepErrors: {} });
    });

    it('stays on step 3 with no progress when the error is about the credentials', async () => {
      startStep3();
      const error = new ApiError('Validation failure', 422, { username: 'Em uso' });
      registerMissionary.mockRejectedValueOnce(error);

      await expect(submit()).rejects.toBe(error);

      expect(useMissionaryRegisterStore.getState().step).toBe(3);
      expect(useMissionaryRegisterStore.getState().stepErrors).toEqual({});
      expect(useMissionaryRegisterStore.getState().submission).toEqual({});
    });

    it('clears the API errors once step 1 is completed again', () => {
      useMissionaryRegisterStore.setState({ step: 1, stepErrors: { email: 'Em uso' } });

      useMissionaryRegisterStore.getState().completeStep1({
        fullName: 'Ana',
        email: 'nova@example.com',
        birthDate: '01/01/1990',
        gender: 'feminino',
        document: '123',
        phone: '+5521999999999',
      });

      expect(useMissionaryRegisterStore.getState().stepErrors).toEqual({});
    });

    it('retries the whole sign-up after a failure, since the request is transactional', async () => {
      startStep3();
      registerMissionary.mockRejectedValueOnce(new ApiError('Falha', 500));

      await expect(submit()).rejects.toThrow('Falha');
      expect(useMissionaryRegisterStore.getState()).toMatchObject({ step: 3, submission: {} });

      await submit();

      expect(registerMissionary).toHaveBeenCalledTimes(2);
      expect(useMissionaryRegisterStore.getState().step).toBe(4);
    });

    it('sends a single request when the user submits twice in a row', async () => {
      startStep3();
      let finish: () => void = () => {};
      registerMissionary.mockImplementationOnce(
        () => new Promise((resolve) => (finish = () => resolve({ user: {} as never })))
      );

      const first = submit();
      const second = submit();
      expect(useMissionaryRegisterStore.getState().submission).toEqual({ pending: true });
      finish();
      await Promise.all([first, second]);

      expect(registerMissionary).toHaveBeenCalledTimes(1);
      expect(useMissionaryRegisterStore.getState()).toMatchObject({ step: 4, submission: {} });
    });
  });

  describe('persistence', () => {
    it('stores the draft in sessionStorage without passwords or submission progress', () => {
      useMissionaryRegisterStore.setState({
        step: 3,
        formData: { ...draft, password: PASSWORD, confirmPassword: PASSWORD },
        submission: { pending: true },
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
        submission: { pending: true },
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
