import { act, render } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { SESSION_EXPIRED_EVENT } from '@/lib/api/client';
import { clearUserStores, purgeLegacyProfileCache } from '@/stores/sessionStore';
import { SessionWatcher, isProtectedPath } from './SessionWatcher';

const replace = vi.fn();
const refresh = vi.fn();
const router = { replace, push: vi.fn(), refresh, prefetch: vi.fn() };
vi.mock('next/navigation', () => ({
  useRouter: () => router,
  usePathname: () => window.location.pathname,
}));

vi.mock('@/stores/sessionStore', () => ({
  clearUserStores: vi.fn(),
  purgeLegacyProfileCache: vi.fn(),
}));

describe('SessionWatcher', () => {
  beforeEach(() => {
    replace.mockClear();
    refresh.mockClear();
    vi.mocked(clearUserStores).mockClear();
  });

  it('wipes user data and sends the user to login from a protected page', () => {
    window.history.pushState({}, '', '/profile/sobre/edit?x=1');
    render(<SessionWatcher />);

    act(() => {
      window.dispatchEvent(new Event(SESSION_EXPIRED_EVENT));
    });

    expect(clearUserStores).toHaveBeenCalledTimes(1);
    expect(refresh).toHaveBeenCalledTimes(1);
    expect(replace).toHaveBeenCalledWith(
      `/login?reason=expired&next=${encodeURIComponent('/profile/sobre/edit?x=1')}`
    );
  });

  it('only wipes data on public pages', () => {
    window.history.pushState({}, '', '/campanha/1');
    render(<SessionWatcher />);

    act(() => {
      window.dispatchEvent(new Event(SESSION_EXPIRED_EVENT));
    });

    expect(clearUserStores).toHaveBeenCalled();
    expect(replace).not.toHaveBeenCalled();
    // The server re-reads the session so the header shows the visitor view.
    expect(refresh).toHaveBeenCalled();
  });

  it('drops the old profile caches on mount', () => {
    render(<SessionWatcher />);
    expect(purgeLegacyProfileCache).toHaveBeenCalled();
  });

  it('treats the public missionary view as unprotected', () => {
    expect(isProtectedPath('/profile')).toBe(true);
    expect(isProtectedPath('/profile/supporter')).toBe(true);
    expect(isProtectedPath('/profile/missionario/samuel')).toBe(false);
    expect(isProtectedPath('/profiles')).toBe(false);
  });
});
