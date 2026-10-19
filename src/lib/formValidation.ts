import type { ChangeEvent } from 'react';
import type {
  FieldPath,
  FieldValues,
  UseFormClearErrors,
  UseFormGetFieldState,
  UseFormRegisterReturn,
  UseFormTrigger,
} from 'react-hook-form';

export const validateOnSubmit = {
  mode: 'onSubmit',
  reValidateMode: 'onChange',
} as const;

type LiveEmailHandlers<TFieldValues extends FieldValues> = {
  trigger: UseFormTrigger<TFieldValues>;
  clearErrors: UseFormClearErrors<TFieldValues>;
  getFieldState: UseFormGetFieldState<TFieldValues>;
};

/**
 * Valida o formato do e-mail enquanto a pessoa digita (falta de @),
 * sem mostrar "campo obrigatório" antes do submit.
 */
export function withLiveEmailFormat<TFieldValues extends FieldValues>(
  field: UseFormRegisterReturn,
  { trigger, clearErrors, getFieldState }: LiveEmailHandlers<TFieldValues>,
  name: FieldPath<TFieldValues> = 'email' as FieldPath<TFieldValues>
) {
  return {
    ...field,
    onChange: (event: ChangeEvent<HTMLInputElement>) => {
      void field.onChange(event);
      const value = event.target.value.trim();

      if (!value) {
        clearErrors(name);
        return;
      }

      if (!value.includes('@') || getFieldState(name).invalid) {
        void trigger(name);
      }
    },
  };
}
