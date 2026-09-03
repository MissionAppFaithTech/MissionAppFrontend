import { describe, it, expect } from 'vitest';
import { POST } from './route';

describe('POST /api/auth/reset-password', () => {
  it('returns 400 for invalid json', async () => {
    const req = new Request('http://localhost:3000/api/auth/reset-password', {
      method: 'POST',
      body: 'invalid-json',
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it('returns 422 when passwords do not match', async () => {
    const req = new Request('http://localhost:3000/api/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({
        token: 'any-token',
        password: 'Password123!',
        passwordConfirmation: 'DifferentPassword456!',
      }),
    });
    const res = await POST(req);
    expect(res.status).toBe(422);
    const body = await res.json();
    expect(body.message).toContain('inválidos');
  });

  it('attempts reset when passwords match and handles external response', async () => {
    const req = new Request('http://localhost:3000/api/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({
        token: 'any-token',
        password: 'Password123!',
        passwordConfirmation: 'Password123!',
      }),
    });
    const res = await POST(req);
    // 200 on backend success or 503 if backend unreachable
    expect([200, 503]).toContain(res.status);
  });
});
