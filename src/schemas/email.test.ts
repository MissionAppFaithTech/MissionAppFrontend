import { describe, it, expect } from 'vitest';
import { requiredEmailSchema } from './email';

describe('requiredEmailSchema', () => {
  it('requires a value', () => {
    const result = requiredEmailSchema.safeParse('');
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe('Informe seu e-mail');
    }
  });

  it('asks for @ when the value has no at-sign', () => {
    const result = requiredEmailSchema.safeParse('email-sem-arroba');
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe('Inclua um @ no e-mail');
    }
  });

  it('rejects an incomplete address that already has @', () => {
    const result = requiredEmailSchema.safeParse('teste@');
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe('Informe um e-mail válido');
    }
  });

  it('accepts a valid email', () => {
    expect(requiredEmailSchema.safeParse('pessoa@missionapp.com').success).toBe(true);
  });
});
