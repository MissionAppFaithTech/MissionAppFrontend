import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { BFF_SECRET_HEADER, CLIENT_IP_HEADER, forwardedClientHeaders } from './clientIp';

const incoming = new Map<string, string>();
const headersMock = vi.fn(async () => ({ get: (name: string) => incoming.get(name) ?? null }));
vi.mock('next/headers', () => ({ headers: () => headersMock() }));

describe('forwardedClientHeaders', () => {
  beforeEach(() => {
    incoming.clear();
    headersMock.mockClear();
    vi.stubEnv('BFF_SHARED_SECRET', 'segredo');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('forwards nothing when the shared secret is not configured', async () => {
    vi.stubEnv('BFF_SHARED_SECRET', '');
    incoming.set('x-real-ip', '203.0.113.9');

    await expect(forwardedClientHeaders()).resolves.toEqual({});
  });

  it('prefers x-real-ip', async () => {
    incoming.set('x-real-ip', ' 203.0.113.9 ');
    incoming.set('x-forwarded-for', '198.51.100.1, 10.0.0.1');

    await expect(forwardedClientHeaders()).resolves.toEqual({
      [BFF_SECRET_HEADER]: 'segredo',
      [CLIENT_IP_HEADER]: '203.0.113.9',
    });
  });

  it('falls back to the first x-forwarded-for entry (the client)', async () => {
    incoming.set('x-forwarded-for', '198.51.100.1, 10.0.0.1');

    await expect(forwardedClientHeaders()).resolves.toEqual({
      [BFF_SECRET_HEADER]: 'segredo',
      [CLIENT_IP_HEADER]: '198.51.100.1',
    });
  });

  it('forwards nothing without a client IP', async () => {
    await expect(forwardedClientHeaders()).resolves.toEqual({});
  });

  it('forwards nothing outside a request', async () => {
    headersMock.mockRejectedValueOnce(new Error('outside request scope'));

    await expect(forwardedClientHeaders()).resolves.toEqual({});
  });

  it('uses the header names agreed with the backend (ADR-0032)', () => {
    expect(CLIENT_IP_HEADER).toBe('x-missionapp-client-ip');
    expect(BFF_SECRET_HEADER).toBe('x-missionapp-bff-secret');
  });
});
