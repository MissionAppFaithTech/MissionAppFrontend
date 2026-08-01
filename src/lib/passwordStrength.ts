export type PasswordStrengthLevel = 'empty' | 'weak' | 'medium' | 'strong';

export type PasswordStrength = {
  level: PasswordStrengthLevel;
  score: number;
  label: string;
  color: 'inherit' | 'error' | 'warning' | 'success';
};

const HAS_LOWER = /[a-z]/;
const HAS_UPPER = /[A-Z]/;
const HAS_DIGIT = /\d/;
const HAS_SPECIAL = /[^a-zA-Z0-9]/;

/** Requisitos mínimos para aceitar a senha no cadastro. */
export const passwordRequirements = [
  { id: 'length', label: 'Pelo menos 8 caracteres', test: (p: string) => p.length >= 8 },
  { id: 'lower', label: 'Uma letra minúscula', test: (p: string) => HAS_LOWER.test(p) },
  { id: 'upper', label: 'Uma letra maiúscula', test: (p: string) => HAS_UPPER.test(p) },
  { id: 'digit', label: 'Um número', test: (p: string) => HAS_DIGIT.test(p) },
  {
    id: 'special',
    label: 'Um caractere especial (!@#$…)',
    test: (p: string) => HAS_SPECIAL.test(p),
  },
] as const;

export function getPasswordStrength(password: string): PasswordStrength {
  if (!password) {
    return { level: 'empty', score: 0, label: '', color: 'inherit' };
  }

  const met = passwordRequirements.filter((rule) => rule.test(password)).length;
  const bonusLong = password.length >= 12 ? 1 : 0;
  const scorePoints = met + bonusLong;

  if (met < 3) {
    return { level: 'weak', score: 33, label: 'Senha fraca', color: 'error' };
  }

  if (met < 5) {
    return { level: 'medium', score: 66, label: 'Senha média', color: 'warning' };
  }

  return {
    level: 'strong',
    score: scorePoints >= 6 ? 100 : 85,
    label: 'Senha forte',
    color: 'success',
  };
}

/**
 * Valida senha forte para cadastro.
 * @returns `true` se ok, ou mensagem de erro.
 */
export function validateStrongPassword(password: string): true | string {
  if (!password) return 'Informe sua senha';

  const missing = passwordRequirements.filter((rule) => !rule.test(password));
  if (missing.length === 0) return true;

  if (missing.length === passwordRequirements.length) {
    return 'Informe sua senha';
  }

  return `Senha fraca: inclua ${missing.map((r) => r.label.toLowerCase()).join(', ')}`;
}
