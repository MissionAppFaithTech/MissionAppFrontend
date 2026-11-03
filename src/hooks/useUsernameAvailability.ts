'use client';

import { useEffect, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { usernameAvailabilityQuery } from '@/services/queries/username';

export type UsernameAvailabilityStatus = 'idle' | 'checking' | 'available' | 'taken' | 'error';

export const USERNAME_CHECK_DEBOUNCE_MS = 450;

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

/**
 * Checks whether a username is free while the user types (ADR-0002 island):
 * waits 450 ms after the last keystroke, then asks the BFF. Answers are cached
 * by the normalized value, so going back to a checked name answers at once.
 */
export function useUsernameAvailability({
  username,
  currentUsername,
  onTaken,
  onAvailable,
}: UseUsernameAvailabilityOptions) {
  const normalized = normalizeUsername(username);
  const current = currentUsername ? normalizeUsername(currentUsername) : '';
  const isCurrentUsername = Boolean(current && normalized === current);
  const canCheck = !isCurrentUsername && isUsernameFormatValid(normalized);

  const [debounced, setDebounced] = useState('');
  useEffect(() => {
    const timer = window.setTimeout(() => setDebounced(normalized), USERNAME_CHECK_DEBOUNCE_MS);
    return () => window.clearTimeout(timer);
  }, [normalized]);

  const settled = debounced === normalized;
  const query = useQuery({
    ...usernameAvailabilityQuery(normalized),
    enabled: canCheck && settled,
  });

  let status: UsernameAvailabilityStatus = 'idle';
  if (canCheck) {
    if (!settled || query.isFetching) status = 'checking';
    else if (query.isError) status = 'error';
    else if (query.data) status = query.data.available ? 'available' : 'taken';
  }

  const onTakenRef = useRef(onTaken);
  const onAvailableRef = useRef(onAvailable);
  useEffect(() => {
    onTakenRef.current = onTaken;
    onAvailableRef.current = onAvailable;
  }, [onTaken, onAvailable]);

  // Notify once per answered username, including answers from the cache.
  const notified = useRef('');
  useEffect(() => {
    if (status !== 'taken' && status !== 'available') return;
    const key = `${normalized}:${status}`;
    if (notified.current === key) return;
    notified.current = key;
    if (status === 'taken') onTakenRef.current?.();
    else onAvailableRef.current?.();
  }, [status, normalized]);

  const suggestions = status === 'taken' ? (query.data?.suggestions ?? []) : [];
  return { status, suggestions };
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
