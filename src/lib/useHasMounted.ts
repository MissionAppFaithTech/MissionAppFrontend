'use client';

import { useSyncExternalStore } from 'react';

const emptySubscribe = () => () => {};

/**
 * `true` on the client after hydration; `false` during SSR.
 * Prefer this over `useEffect(() => setMounted(true))` (React Compiler / eslint).
 */
export default function useHasMounted() {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
}
