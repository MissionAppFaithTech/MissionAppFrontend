'use client';

import { useSyncExternalStore } from 'react';
import { useA11yPreferencesStore } from '@/stores/a11yPreferencesStore';

const QUERY = '(prefers-reduced-motion: reduce)';

function subscribe(onChange: () => void) {
  if (typeof window === 'undefined' || !window.matchMedia) return () => {};
  const media = window.matchMedia(QUERY);
  media.addEventListener('change', onChange);
  return () => media.removeEventListener('change', onChange);
}

function getSnapshot() {
  return typeof window !== 'undefined' && Boolean(window.matchMedia?.(QUERY).matches);
}

/** True when the OS asks for less motion or the user turned on "Reduzir movimento". */
export function usePrefersReducedMotion(): boolean {
  const system = useSyncExternalStore(subscribe, getSnapshot, () => false);
  const preference = useA11yPreferencesStore((state) => state.reduceMotion);
  return system || preference;
}
