'use client';

import { useEffect, useRef, useState } from 'react';
import type { Path, PathValue, UseFormSetValue } from 'react-hook-form';
import { cepDigits, isCompleteBrazilianCep } from '@/lib/masks';
import { lookupCep, type CepAddress } from '@/services/cep.service';

type AddressFields = {
  zipCode: string;
  address1: string;
  city: string;
  state: string;
  country: string;
};

const addressFieldOptions = { shouldDirty: true, shouldValidate: true } as const;

export function applyCepAddress<T extends AddressFields>(
  setValue: UseFormSetValue<T>,
  address: CepAddress
) {
  // NOTE: Path<T> não enxerga as chaves de um genérico que só estende AddressFields.
  const write = (field: keyof AddressFields, value: string) => {
    setValue(field as Path<T>, value as PathValue<T, Path<T>>, addressFieldOptions);
  };

  write('zipCode', address.zipCode);
  write('city', address.city);
  write('state', address.state);
  write('country', address.country);
  if (address.address1) write('address1', address.address1);
}

export type CepLookupStatus = 'idle' | 'checking' | 'found' | 'notFound' | 'error';

type UseCepAutofillOptions = {
  zipCode: string;
  enabled?: boolean;
  onAddress: (address: CepAddress) => void;
};

export function cepLookupHelper(status: CepLookupStatus, errorMessage?: string) {
  if (errorMessage) return errorMessage;
  if (status === 'checking') return 'Buscando endereço…';
  if (status === 'found') return 'Endereço preenchido. Confira os dados.';
  if (status === 'notFound') return 'CEP não encontrado';
  if (status === 'error') return 'Não foi possível buscar o CEP';
  return 'Com 8 dígitos buscamos rua, cidade e estado';
}

export function useCepAutofill({ zipCode, enabled = true, onAddress }: UseCepAutofillOptions) {
  const [status, setStatus] = useState<CepLookupStatus>('idle');
  const digits = cepDigits(zipCode);
  const [trackedDigits, setTrackedDigits] = useState(digits);
  const requestIdRef = useRef(0);
  const lastLookupRef = useRef('');
  const onAddressRef = useRef(onAddress);

  // NOTE: o CEP apagado zera o status no render. setState no efeito é proibido
  // e causaria um render em cascata.
  if (digits !== trackedDigits) {
    setTrackedDigits(digits);
    if (!digits) setStatus('idle');
  }

  useEffect(() => {
    onAddressRef.current = onAddress;
  }, [onAddress]);

  async function runLookup(value: string) {
    const digits = cepDigits(value);
    if (!isCompleteBrazilianCep(digits) || digits === lastLookupRef.current) return;

    const requestId = ++requestIdRef.current;
    lastLookupRef.current = digits;
    setStatus('checking');

    try {
      const address = await lookupCep(digits);
      if (requestId !== requestIdRef.current) return;
      setStatus('found');
      onAddressRef.current(address);
    } catch (error) {
      if (requestId !== requestIdRef.current) return;
      lastLookupRef.current = '';
      setStatus(
        error instanceof Error && error.message === 'CEP não encontrado' ? 'notFound' : 'error'
      );
    }
  }

  useEffect(() => {
    if (!enabled || !isCompleteBrazilianCep(zipCode)) {
      if (!cepDigits(zipCode)) lastLookupRef.current = '';
      return;
    }

    const timer = window.setTimeout(() => {
      void runLookup(zipCode);
    }, 400);

    return () => window.clearTimeout(timer);
  }, [enabled, zipCode]);

  return {
    status,
    message: cepLookupHelper(status),
    search: () => runLookup(zipCode),
  };
}
