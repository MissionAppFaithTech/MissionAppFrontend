import { describe, expect, it } from 'vitest';
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
  it('allows a role inside its area and anyone on public pages', () => {
    expect(accessDecision('MISSIONARY', '/profile/sobre')).toEqual({ allow: true });
    expect(accessDecision(null, '/profile/missionario/samuel')).toEqual({ allow: true });
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
