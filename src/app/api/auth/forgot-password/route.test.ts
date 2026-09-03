import { describe, it, expect } from 'vitest';
import { POST } from './route';

describe('POST /api/auth/forgot-password', () => {
  it('returns 400 for invalid json', async () => {
    const req = new Request('http://localhost:3000/api/auth/forgot-password', {
      method: 'POST',
      body: 'invalid-json',
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it('returns 422 for invalid email', async () => {
    const req = new Request('http://localhost:3000/api/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ login: 'not-an-email' }),
    });
    const res = await POST(req);
    expect(res.status).toBe(422);
  });

  it('returns 200 with confirmation message for valid email', async () => {
    const req = new Request('http://localhost:3000/api/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ login: 'valid@example.com' }),
    });
    const res = await POST(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.message).toContain('instruções');
  });
});
