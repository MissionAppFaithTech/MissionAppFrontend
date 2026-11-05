'use client';

import { useEffect, useState } from 'react';

/**
 * The value after it stops changing for `delayMs` — groups keystrokes so a
 * search runs once per pause, not once per letter.
 *
 * @example
 * const term = useDebouncedValue(input, 300)
 */
export function useDebouncedValue<Value>(value: Value, delayMs: number): Value {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(timer);
  }, [value, delayMs]);

  return debounced;
}
