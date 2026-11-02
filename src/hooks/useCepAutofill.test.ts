import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { applyCepAddress, cepLookupHelper, useCepAutofill } from './useCepAutofill';
import { lookupCep } from '@/services/cep.service';

vi.mock('@/services/cep.service', () => ({
  lookupCep: vi.fn(),
}));

const mockedLookup = vi.mocked(lookupCep);

describe('cepLookupHelper', () => {
  it('explains the idle, found and missing states', () => {
    expect(cepLookupHelper('idle')).toMatch(/8 dígitos/i);
    expect(cepLookupHelper('found')).toMatch(/preenchido/i);
    expect(cepLookupHelper('notFound')).toMatch(/não encontrado/i);
  });
});

describe('useCepAutofill', () => {
  beforeEach(() => {
    mockedLookup.mockReset();
  });

  it('looks up a complete CEP and forwards the address', async () => {
    const onAddress = vi.fn();
    mockedLookup.mockResolvedValue({
      zipCode: '01310-100',
      address1: 'Avenida Paulista',
      city: 'São Paulo',
      state: 'SP',
      country: 'Brasil',
    });

    const { result, rerender } = renderHook(
      ({ zipCode }) => useCepAutofill({ zipCode, onAddress }),
      { initialProps: { zipCode: '01310' } }
    );

    expect(result.current.status).toBe('idle');
    rerender({ zipCode: '01310-100' });

    await waitFor(() => expect(result.current.status).toBe('found'));
    expect(onAddress).toHaveBeenCalledWith(
      expect.objectContaining({ city: 'São Paulo', state: 'SP' })
    );
  });

  it('fills the address fields through applyCepAddress', () => {
    const setValue = vi.fn();
    applyCepAddress(setValue, {
      zipCode: '01310-100',
      address1: 'Avenida Paulista',
      city: 'São Paulo',
      state: 'SP',
      country: 'Brasil',
    });

    expect(setValue).toHaveBeenCalledWith('city', 'São Paulo', expect.any(Object));
    expect(setValue).toHaveBeenCalledWith('address1', 'Avenida Paulista', expect.any(Object));
  });

  it('returns to idle when the CEP is cleared and keeps the result while editing', async () => {
    const onAddress = vi.fn();
    mockedLookup.mockResolvedValue({
      zipCode: '01310-100',
      address1: 'Avenida Paulista',
      city: 'São Paulo',
      state: 'SP',
      country: 'Brasil',
    });

    const { result, rerender } = renderHook(
      ({ zipCode }) => useCepAutofill({ zipCode, onAddress }),
      { initialProps: { zipCode: '01310-100' } }
    );

    await waitFor(() => expect(result.current.status).toBe('found'));

    rerender({ zipCode: '01310-10' });
    expect(result.current.status).toBe('found');

    rerender({ zipCode: '' });
    expect(result.current.status).toBe('idle');

    rerender({ zipCode: '01' });
    expect(result.current.status).toBe('idle');
  });

  it('can be triggered manually', async () => {
    const onAddress = vi.fn();
    mockedLookup.mockResolvedValue({
      zipCode: '80010-000',
      address1: '',
      city: 'Curitiba',
      state: 'PR',
      country: 'Brasil',
    });

    const { result } = renderHook(() =>
      useCepAutofill({ zipCode: '80010000', enabled: false, onAddress })
    );

    await act(async () => {
      await result.current.search();
    });

    await waitFor(() => expect(onAddress).toHaveBeenCalled());
  });
});
