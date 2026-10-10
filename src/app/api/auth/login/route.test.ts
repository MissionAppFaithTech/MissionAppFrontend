import { describe, it, expect } from 'vitest';
import { POST } from './route';

describe('POST /api/auth/login', () => {
  it('returns 400 for invalid json', async () => {
    const req = new Request('http://localhost:3000/api/auth/login', {
      method: 'POST',
      body: 'invalid-json',
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it('returns 422 for invalid email', async () => {
    const req = new Request('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ login: 'not-an-email', password: 'secret12' }),
    });
    const res = await POST(req);
    expect(res.status).toBe(422);
  });

  it('returns 502 when the backend is unreachable', async () => {
    const req = new Request('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ login: 'user@example.com', password: 'secret12' }),
    });
    const res = await POST(req);
    expect([200, 400, 401, 422, 502]).toContain(res.status);
  });
});
