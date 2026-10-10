'use client';

import { useEffect, useRef, useState } from 'react';
import { checkUsernameAvailability } from '@/services/username.service';

export type UsernameAvailabilityStatus = 'idle' | 'checking' | 'available' | 'taken' | 'error';

export function isUsernameFormatValid(value: string) {
  return value.length >= 3 && value.length <= 32 && /^[a-z0-9_]+$/.test(value);
}

export function normalizeUsername(value: string) {
  return value.trim().toLowerCase();
}

type UseUsernameAvailabilityOptions = {
  username: string;
  currentUsername?: string;
  onTaken?: () => void;
  onAvailable?: () => void;
};

export function useUsernameAvailability({
  username,
  currentUsername,
  onTaken,
  onAvailable,
}: UseUsernameAvailabilityOptions) {
  const [fetchedStatus, setFetchedStatus] = useState<UsernameAvailabilityStatus>('idle');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const requestIdRef = useRef(0);
  const onTakenRef = useRef(onTaken);
  const onAvailableRef = useRef(onAvailable);

  const normalized = normalizeUsername(username);
  const current = currentUsername ? normalizeUsername(currentUsername) : '';
  const isCurrentUsername = Boolean(current && normalized === current);
  const canCheck = !isCurrentUsername && isUsernameFormatValid(normalized);
  const status: UsernameAvailabilityStatus = canCheck ? fetchedStatus : 'idle';

  useEffect(() => {
    onTakenRef.current = onTaken;
    onAvailableRef.current = onAvailable;
  }, [onTaken, onAvailable]);

  useEffect(() => {
    if (!canCheck) {
      return;
    }

    const requestId = ++requestIdRef.current;
    const timer = window.setTimeout(async () => {
      setFetchedStatus('checking');
      setSuggestions([]);

      try {
        const result = await checkUsernameAvailability(normalized);
        if (requestId !== requestIdRef.current) return;

        if (result.available) {
          setFetchedStatus('available');
          setSuggestions([]);
          onAvailableRef.current?.();
          return;
        }

        setFetchedStatus('taken');
        setSuggestions(result.suggestions ?? []);
        onTakenRef.current?.();
      } catch {
        if (requestId !== requestIdRef.current) return;
        setFetchedStatus('error');
        setSuggestions([]);
      }
    }, 450);

    return () => window.clearTimeout(timer);
  }, [normalized, canCheck]);

  return { status, suggestions: canCheck ? suggestions : [], setSuggestions };
}

export function usernameAvailabilityHelper(
  status: UsernameAvailabilityStatus,
  errorMessage?: string
) {
  if (errorMessage) return errorMessage;
  if (status === 'checking') return 'Verificando disponibilidade…';
  if (status === 'available') return 'Nome de usuário disponível';
  if (status === 'taken') return 'Este nome de usuário já está em uso';
  if (status === 'error') return 'Não foi possível verificar o nome de usuário';
  return undefined;
}
