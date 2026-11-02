import { act, render } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { SESSION_EXPIRED_EVENT } from '@/lib/api/client';
import { useSessionStore } from '@/stores/sessionStore';
import { SessionWatcher, isProtectedPath } from './SessionWatcher';

const replace = vi.fn();
const router = { replace, push: vi.fn(), refresh: vi.fn(), prefetch: vi.fn() };
vi.mock('next/navigation', () => ({
  useRouter: () => router,
  usePathname: () => window.location.pathname,
}));

describe('SessionWatcher', () => {
  const expire = vi.fn();

  beforeEach(() => {
    replace.mockClear();
    expire.mockClear();
    useSessionStore.setState({ expire });
  });

  it('wipes user data and sends the user to login from a protected page', () => {
    window.history.pushState({}, '', '/profile/sobre/edit?x=1');
    render(<SessionWatcher />);

    act(() => {
      window.dispatchEvent(new Event(SESSION_EXPIRED_EVENT));
    });

    expect(expire).toHaveBeenCalledTimes(1);
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

    expect(expire).toHaveBeenCalled();
    expect(replace).not.toHaveBeenCalled();
  });

  it('treats the public missionary view as unprotected', () => {
    expect(isProtectedPath('/profile')).toBe(true);
    expect(isProtectedPath('/profile/supporter')).toBe(true);
    expect(isProtectedPath('/profile/missionario/samuel')).toBe(false);
    expect(isProtectedPath('/profiles')).toBe(false);
  });
});
