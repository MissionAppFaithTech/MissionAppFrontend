export type PasswordStrengthLevel = "empty" | "weak" | "medium" | "strong";

export type PasswordStrength = {
  level: PasswordStrengthLevel;
  score: number;
  label: string;
  color: "inherit" | "error" | "warning" | "success";
};

export function getPasswordStrength(password: string): PasswordStrength {
  if (!password) {
    return { level: "empty", score: 0, label: "", color: "inherit" };
  }

  let score = 0;

  if (password.length >= 8) score += 1;
  if (password.length >= 12) score += 1;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score += 1;
  if (/\d/.test(password)) score += 1;
  if (/[^a-zA-Z0-9]/.test(password)) score += 1;

  if (score <= 2) {
    return { level: "weak", score: 33, label: "Senha fraca", color: "error" };
  }

  if (score <= 4) {
    return { level: "medium", score: 66, label: "Senha média", color: "warning" };
  }

  return { level: "strong", score: 100, label: "Senha forte", color: "success" };
}
