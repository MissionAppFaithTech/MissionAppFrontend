import { describe, it, expect } from 'vitest';
import { POST } from './route.accounts';

describe('POST /api/accounts', () => {
  it('returns 400 for invalid json', async () => {
    const req = new Request('http://localhost:3000/api/accounts', {
      method: 'POST',
      body: 'invalid-json',
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it('returns 422 for incomplete payload', async () => {
    const req = new Request('http://localhost:3000/api/accounts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'user@example.com' }),
    });
    const res = await POST(req);
    expect(res.status).toBe(422);
  });

  it('returns 422 when passwords do not match', async () => {
    const req = new Request('http://localhost:3000/api/accounts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullName: 'Ana Silva',
        username: 'ana_silva',
        phoneNumber: '+5511999999999',
        gender: 'FEMALE',
        email: 'ana@example.com',
        password: 'Senha@123',
        passwordConfirmation: 'Outra@123',
      }),
    });
    const res = await POST(req);
    expect(res.status).toBe(422);
    const body = await res.json();
    expect(body.message).toContain('senhas');
  });
});
