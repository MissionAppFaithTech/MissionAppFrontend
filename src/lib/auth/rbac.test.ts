import { afterEach, describe, expect, it, vi } from 'vitest';
import { accessAreaFor, accessDecision, canAccess, homePathForRole } from './rbac';

describe('homePathForRole', () => {
  it.each([
    ['MISSIONARY', '/profile'],
    ['SUPPORTER', '/profile/supporter'],
    ['ADMIN', '/admin'],
    [null, '/'],
    [undefined, '/'],
  ] as const)('%s → %s', (role, home) => {
    expect(homePathForRole(role)).toBe(home);
  });
});

describe('accessAreaFor', () => {
  it.each([
    ['/', 'public'],
    ['/login', 'public'],
    ['/campanha/1', 'public'],
    ['/profile', 'missionary'],
    ['/profile/sobre/edit', 'missionary'],
    ['/profile/supporter', 'supporter'],
    ['/profile/supporter/missionarios', 'supporter'],
    ['/profile/missionario/samuel', 'public'],
    ['/profile/missionario', 'public'],
    ['/profile/supporterx', 'missionary'],
    ['/admin', 'admin'],
    ['/admin/denuncias', 'admin'],
    ['/administracao', 'public'],
  ] as const)('%s → %s', (path, area) => {
    expect(accessAreaFor(path)).toBe(area);
  });
});

describe('canAccess', () => {
  it('opens public pages to everyone, visitors included', () => {
    expect(canAccess(null, 'public')).toBe(true);
    expect(canAccess('SUPPORTER', 'public')).toBe(true);
  });

  it('opens each private area only to its role', () => {
    expect(canAccess('MISSIONARY', 'missionary')).toBe(true);
    expect(canAccess('SUPPORTER', 'supporter')).toBe(true);
    expect(canAccess('ADMIN', 'admin')).toBe(true);

    expect(canAccess('MISSIONARY', 'supporter')).toBe(false);
    expect(canAccess('MISSIONARY', 'admin')).toBe(false);
    expect(canAccess('SUPPORTER', 'missionary')).toBe(false);
    expect(canAccess('SUPPORTER', 'admin')).toBe(false);
    expect(canAccess('ADMIN', 'missionary')).toBe(false);
    expect(canAccess('ADMIN', 'supporter')).toBe(false);
    expect(canAccess(null, 'missionary')).toBe(false);
  });
});

describe('accessDecision', () => {
  afterEach(() => vi.unstubAllEnvs());

  it('allows admin previews in development when explicitly enabled', () => {
    vi.stubEnv('NODE_ENV', 'development');
    vi.stubEnv('NEXT_PUBLIC_ADMIN_UI_PREVIEW', 'true');

    expect(accessDecision(null, '/admin')).toEqual({ allow: true });
    expect(accessDecision('SUPPORTER', '/admin/denuncias')).toEqual({ allow: true });
    expect(accessDecision(null, '/profile')).toEqual({
      allow: false,
      redirectTo: '/login?next=%2Fprofile',
    });
    expect(accessDecision('MISSIONARY', '/profile/supporter')).toEqual({
      allow: false,
      redirectTo: '/profile',
    });
  });

  it.each([
    ['production', 'true'],
    ['test', 'true'],
    ['development', undefined],
    ['development', 'false'],
  ] as const)('keeps admin access restricted with NODE_ENV=%s and preview=%s', (env, flag) => {
    vi.stubEnv('NODE_ENV', env);
    vi.stubEnv('NEXT_PUBLIC_ADMIN_UI_PREVIEW', flag);

    expect(accessDecision(null, '/admin/denuncias', '?page=2')).toEqual({
      allow: false,
      redirectTo: '/login?next=%2Fadmin%2Fdenuncias%3Fpage%3D2',
    });
    expect(accessDecision('SUPPORTER', '/admin')).toEqual({
      allow: false,
      redirectTo: '/profile/supporter',
    });
    expect(accessDecision('ADMIN', '/admin')).toEqual({ allow: true });
  });

  it('allows a role inside its area and anyone on public pages', () => {
    expect(accessDecision('MISSIONARY', '/profile/sobre')).toEqual({ allow: true });
    expect(accessDecision(null, '/profile/missionario/samuel')).toEqual({ allow: true });
  });

  it('sends visitors to login with just the path when there is no query', () => {
    expect(accessDecision(null, '/admin')).toEqual({
      allow: false,
      redirectTo: '/login?next=%2Fadmin',
    });
  });

  it('sends visitors to login, keeping the path and query in next', () => {
    expect(accessDecision(null, '/profile/sobre', '?tab=1')).toEqual({
      allow: false,
      redirectTo: `/login?next=${encodeURIComponent('/profile/sobre?tab=1')}`,
    });
  });

  it('sends a role outside its area to its own home', () => {
    expect(accessDecision('SUPPORTER', '/profile/financeiro')).toEqual({
      allow: false,
      redirectTo: '/profile/supporter',
    });
    expect(accessDecision('MISSIONARY', '/profile/supporter')).toEqual({
      allow: false,
      redirectTo: '/profile',
    });
    expect(accessDecision('ADMIN', '/profile')).toEqual({ allow: false, redirectTo: '/admin' });
    expect(accessDecision('MISSIONARY', '/admin')).toEqual({
      allow: false,
      redirectTo: '/profile',
    });
  });
});
