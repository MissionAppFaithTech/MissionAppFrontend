export type PhoneCountryCode =
  | "BR"
  | "US"
  | "PT"
  | "AR"
  | "ES"
  | "GB"
  | "DE"
  | "FR"
  | "MX"
  | "CO"
  | "PY"
  | "OTHER";

export type PhoneFieldValue = {
  country: PhoneCountryCode;
  number: string;
};

export type PhoneCountry = {
  code: PhoneCountryCode;
  name: string;
  dialCode: string;
  placeholder: string;
  maxDigits: number;
};

export function getCountryFlag(isoCode: string): string {
  const code = isoCode.toUpperCase();

  if (code === "OTHER" || code.length !== 2) {
    return "🌐";
  }

  return String.fromCodePoint(
    ...[...code].map((char) => 0x1f1e6 - 65 + char.charCodeAt(0))
  );
}

export const phoneCountries: PhoneCountry[] = [
  { code: "BR", name: "Brasil", dialCode: "+55", placeholder: "(11) 98765-4321", maxDigits: 11 },
  { code: "US", name: "Estados Unidos", dialCode: "+1", placeholder: "(555) 123-4567", maxDigits: 10 },
  { code: "PT", name: "Portugal", dialCode: "+351", placeholder: "912 345 678", maxDigits: 9 },
  { code: "AR", name: "Argentina", dialCode: "+54", placeholder: "(11) 1234-5678", maxDigits: 10 },
  { code: "PY", name: "Paraguai", dialCode: "+595", placeholder: "(981) 123-456", maxDigits: 9 },
  { code: "MX", name: "México", dialCode: "+52", placeholder: "(55) 1234-5678", maxDigits: 10 },
  { code: "CO", name: "Colômbia", dialCode: "+57", placeholder: "(300) 123-4567", maxDigits: 10 },
  { code: "ES", name: "Espanha", dialCode: "+34", placeholder: "612 34 56 78", maxDigits: 9 },
  { code: "GB", name: "Reino Unido", dialCode: "+44", placeholder: "07123 456789", maxDigits: 11 },
  { code: "DE", name: "Alemanha", dialCode: "+49", placeholder: "1512 3456789", maxDigits: 11 },
  { code: "FR", name: "França", dialCode: "+33", placeholder: "06 12 34 56 78", maxDigits: 10 },
  { code: "OTHER", name: "Outro", dialCode: "+", placeholder: "000 000 0000", maxDigits: 15 },
];

export function getPhoneCountry(code: PhoneCountryCode): PhoneCountry {
  return phoneCountries.find((country) => country.code === code) ?? phoneCountries[0];
}

function maskBrazilPhone(digits: string): string {
  const d = digits.slice(0, 11);

  if (d.length <= 2) return d.length ? `(${d}` : "";
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) {
    return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  }

  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

function maskNorthAmericaPhone(digits: string): string {
  const d = digits.slice(0, 10);

  if (d.length <= 3) return d.length ? `(${d}` : "";
  if (d.length <= 6) return `(${d.slice(0, 3)}) ${d.slice(3)}`;
  return `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}`;
}

function maskPortugalPhone(digits: string): string {
  const d = digits.slice(0, 9);

  if (d.length <= 3) return d;
  if (d.length <= 6) return `${d.slice(0, 3)} ${d.slice(3)}`;
  return `${d.slice(0, 3)} ${d.slice(3, 6)} ${d.slice(6)}`;
}

function maskArgentinaPhone(digits: string): string {
  const d = digits.slice(0, 10);

  if (d.length <= 2) return d.length ? `(${d}` : "";
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
}

function maskParaguayPhone(digits: string): string {
  const d = digits.slice(0, 9);

  if (d.length <= 3) return d.length ? `(${d}` : "";
  if (d.length <= 6) return `(${d.slice(0, 3)}) ${d.slice(3)}`;
  return `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}`;
}

function maskSpainPhone(digits: string): string {
  const d = digits.slice(0, 9);

  if (d.length <= 3) return d;
  if (d.length <= 5) return `${d.slice(0, 3)} ${d.slice(3)}`;
  if (d.length <= 7) return `${d.slice(0, 3)} ${d.slice(3, 5)} ${d.slice(5)}`;
  return `${d.slice(0, 3)} ${d.slice(3, 5)} ${d.slice(5, 7)} ${d.slice(7)}`;
}

function maskUkPhone(digits: string): string {
  const d = digits.slice(0, 11);

  if (d.length <= 5) return d;
  return `${d.slice(0, 5)} ${d.slice(5)}`;
}

function maskGermanyPhone(digits: string): string {
  const d = digits.slice(0, 11);

  if (d.length <= 4) return d;
  return `${d.slice(0, 4)} ${d.slice(4)}`;
}

function maskFrancePhone(digits: string): string {
  const d = digits.slice(0, 10);

  if (d.length <= 2) return d;
  return d.replace(/(\d{2})(?=\d)/g, "$1 ").trim();
}

function maskGenericPhone(digits: string, maxDigits: number): string {
  const d = digits.slice(0, maxDigits);
  return d.replace(/(\d{3})(?=\d)/g, "$1 ").trim();
}

export function maskPhoneNumber(value: string, country: PhoneCountryCode): string {
  const digits = value.replace(/\D/g, "");
  const config = getPhoneCountry(country);

  switch (country) {
    case "BR":
      return maskBrazilPhone(digits);
    case "US":
    case "MX":
    case "CO":
      return maskNorthAmericaPhone(digits.slice(0, config.maxDigits));
    case "PT":
      return maskPortugalPhone(digits);
    case "AR":
      return maskArgentinaPhone(digits);
    case "PY":
      return maskParaguayPhone(digits);
    case "ES":
      return maskSpainPhone(digits);
    case "GB":
      return maskUkPhone(digits);
    case "DE":
      return maskGermanyPhone(digits);
    case "FR":
      return maskFrancePhone(digits);
    default:
      return maskGenericPhone(digits, config.maxDigits);
  }
}

export function isValidPhoneNumber(value: string, country: PhoneCountryCode): boolean {
  const digits = value.replace(/\D/g, "");
  const config = getPhoneCountry(country);

  if (country === "BR") {
    return digits.length === 10 || digits.length === 11;
  }

  if (country === "OTHER") {
    return digits.length >= 8;
  }

  return digits.length === config.maxDigits;
}

export function formatPhoneDisplay(value: PhoneFieldValue): string {
  const country = getPhoneCountry(value.country);
  const digits = value.number.replace(/\D/g, "");

  if (!digits) return "";

  return `${country.dialCode} ${maskPhoneNumber(digits, value.country)}`;
}
