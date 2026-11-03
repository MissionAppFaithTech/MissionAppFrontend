import { afterEach, describe, expect, it, vi } from 'vitest';
import { environmentManager } from '@tanstack/react-query';
import { ApiError } from '@/lib/api/client';
import { DEFAULT_STALE_TIME_MS, getQueryClient, makeQueryClient, shouldRetry } from './client';

describe('shouldRetry', () => {
  it.each([400, 401, 404, 422, 423, 429])('never retries a %i', (status) => {
    expect(shouldRetry(0, new ApiError('x', status))).toBe(false);
  });

  it('retries a network error or a 5xx once', () => {
    expect(shouldRetry(0, new ApiError('x', 0))).toBe(true);
    expect(shouldRetry(0, new ApiError('x', 503))).toBe(true);
    expect(shouldRetry(0, new TypeError('Failed to fetch'))).toBe(true);
    expect(shouldRetry(1, new ApiError('x', 503))).toBe(false);
  });
});

describe('query clients', () => {
  afterEach(() => {
    environmentManager.setIsServer(() => typeof window === 'undefined');
  });

  it('uses the ADR-0002 defaults', () => {
    const options = makeQueryClient().getDefaultOptions();

    expect(options.queries?.staleTime).toBe(DEFAULT_STALE_TIME_MS);
    expect(options.queries?.retry).toBe(shouldRetry);
    expect(options.mutations?.retry).toBe(false);
  });

  it('keeps a single client in the browser', () => {
    expect(getQueryClient()).toBe(getQueryClient());
  });

  it('creates a new client per call on the server, so users never share a cache', () => {
    environmentManager.setIsServer(() => true);
    const spy = vi.fn();

    const first = getQueryClient();
    const second = getQueryClient();
    spy(first === second);

    expect(spy).toHaveBeenCalledWith(false);
  });
});
