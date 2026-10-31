export function maskBirthDate(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 8);

  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
}

export function maskCpfOrPassport(value: string): string {
  if (/[a-zA-Z]/.test(value)) {
    return value
      .replace(/[^a-zA-Z0-9]/g, '')
      .slice(0, 20)
      .toUpperCase();
  }

  const digits = value.replace(/\D/g, '').slice(0, 11);

  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`;
  if (digits.length <= 9) {
    return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
  }

  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
}

/**
 * Same split as {@link maskCpfOrPassport}: letters mean passport, exactly 11 digits
 * mean CPF, anything else (e.g. numeric passports) is a passport.
 */
export function toIdentityPayload(document: string): {
  identityType: 'CPF' | 'PASSPORT';
  identityDocument: string;
} {
  const trimmed = document.trim();
  const digits = trimmed.replace(/\D/g, '');
  if (!/[a-zA-Z]/.test(trimmed) && digits.length === 11) {
    return { identityType: 'CPF', identityDocument: digits };
  }
  return {
    identityType: 'PASSPORT',
    identityDocument: trimmed.replace(/[^a-zA-Z0-9]/g, '').toUpperCase(),
  };
}

export function normalizeEmail(value: string): string {
  return value.replace(/\s/g, '').toLowerCase();
}

export function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export function isValidBirthDate(value: string): boolean {
  const match = value.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!match) return false;

  const day = Number(match[1]);
  const month = Number(match[2]);
  const year = Number(match[3]);
  const date = new Date(year, month - 1, day);

  return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;
}
