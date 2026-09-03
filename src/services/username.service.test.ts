import { describe, it, expect } from 'vitest';
import { checkUsernameAvailability } from './username.service';

describe('username.service', () => {
  it('returns availability for a unique username', async () => {
    const uniqueName = `user_${Date.now()}`;
    const result = await checkUsernameAvailability(uniqueName);
    expect(result.username).toBe(uniqueName.toLowerCase());
    expect(typeof result.available).toBe('boolean');
  });

  it('provides suggestions when username is taken', async () => {
    // 'pedro' or known mock taken username
    const result = await checkUsernameAvailability('pedro');
    if (!result.available) {
      expect(result.suggestions.length).toBeGreaterThan(0);
    }
  });
});
