import { useRef, useState } from 'react';
import { SELECT_OTHER } from '@/forms/register/options';

export function useOtherCatalogEntry() {
  const [open, setOpen] = useState(false);
  const previousValueRef = useRef('');

  const selectValue = (
    nextValue: string,
    currentValue: string,
    setValue: (value: string) => void
  ) => {
    if (nextValue === SELECT_OTHER) {
      if (currentValue !== SELECT_OTHER) {
        previousValueRef.current = currentValue;
      }
      setValue(SELECT_OTHER);
      setOpen(true);
      return;
    }

    setValue(nextValue);
  };

  const cancel = (isComplete: boolean, setValue: (value: string) => void) => {
    setOpen(false);
    if (!isComplete) {
      const previous = previousValueRef.current;
      setValue(previous === SELECT_OTHER ? '' : previous);
    }
  };

  return {
    open,
    openEditor: () => setOpen(true),
    close: () => setOpen(false),
    selectValue,
    cancel,
  };
}
