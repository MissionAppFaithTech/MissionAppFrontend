import { describe, it, expect } from 'vitest';
import { GET } from './route';

describe('GET /api/accounts/username-availability', () => {
  it('returns 422 for invalid username with special characters or too short', async () => {
    const req = new Request('http://localhost:3000/api/accounts/username-availability?username=ab');
    const res = await GET(req);
    expect(res.status).toBe(422);

    const body = await res.json();
    expect(body.message).toContain('Nome de usuário inválido');
  });

  it('handles valid username pattern format checking', async () => {
    const req = new Request('http://localhost:3000/api/accounts/username-availability?username=valid_user_123');
    const res = await GET(req);
    // Even if backend is not up, it should respond with status (502 when backend down)
    expect([200, 502]).toContain(res.status);
  });
});
