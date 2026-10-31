import { describe, expect, it } from 'vitest';
import { homePathForRole, postLoginPath, safeNextPath } from './redirect';

describe('safeNextPath', () => {
  it.each([
    ['/profile/sobre', '/profile/sobre'],
    ['/profile?tab=1', '/profile?tab=1'],
    [null, null],
    ['', null],
    ['https://evil.example.com', null],
    ['//evil.example.com', null],
    ['/\\evil.example.com', null],
    ['profile', null],
    ['/\t/evil.example.com', null],
    ['/%0A/evil', '/%0A/evil'],
    ['/\n/evil.example.com', null],
  ])('%s → %s', (input, expected) => {
    expect(safeNextPath(input)).toBe(expected);
  });
});

describe('postLoginPath', () => {
  it('uses the role home when there is no next path', () => {
    expect(homePathForRole('MISSIONARY')).toBe('/profile');
    expect(homePathForRole('SUPPORTER')).toBe('/profile/supporter');
    expect(postLoginPath('MISSIONARY', null)).toBe('/profile');
  });

  it('keeps next inside the role area', () => {
    expect(postLoginPath('MISSIONARY', '/profile/sobre/edit')).toBe('/profile/sobre/edit');
    expect(postLoginPath('SUPPORTER', '/profile/supporter/missionarios')).toBe(
      '/profile/supporter/missionarios'
    );
    expect(postLoginPath('SUPPORTER', '/profile/missionario/samuel')).toBe(
      '/profile/missionario/samuel'
    );
  });

  it('lets any role return to public pages outside /profile', () => {
    expect(postLoginPath('SUPPORTER', '/campanha/1')).toBe('/campanha/1');
    expect(postLoginPath('MISSIONARY', '/campanha/1')).toBe('/campanha/1');
  });

  it('does not send a user into the other role area', () => {
    expect(postLoginPath('SUPPORTER', '/profile/edit-profile')).toBe('/profile/supporter');
    expect(postLoginPath('MISSIONARY', '/profile/supporter')).toBe('/profile');
  });
});
