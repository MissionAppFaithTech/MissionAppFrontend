import { describe, expect, it } from 'vitest';
import { mockMissionaryRegistrations } from '@/mocks/admin';
import {
  filterRegistrations,
  registrationCounts,
  registrationDate,
  registrationTime,
  reviewRegistration,
} from './registrations';

const records = mockMissionaryRegistrations;
describe('mock registration review', () => {
  it('provides unique fixtures and consistent totals for the full paginated list', () => {
    expect(registrationCounts(records)).toEqual({
      all: 128,
      pending: 12,
      approved: 108,
      rejected: 8,
    });
    expect(new Set(records.map((record) => record.id)).size).toBe(128);
    expect(new Set(records.map((record) => record.email)).size).toBe(128);
  });
  it('combines status and accent-insensitive name or email search', () => {
    expect(
      filterRegistrations(records, 'approved', ' mendonca ', 'newest').map((record) => record.name)
    ).toEqual(['Samuel Mendonça']);
    expect(
      filterRegistrations(records, 'pending', 'ana.carolina@example.com', 'newest')
    ).toHaveLength(1);
    expect(filterRegistrations(records, 'rejected', 'Ana Carolina', 'newest')).toHaveLength(0);
  });
  it('sorts oldest and newest without mutating fixtures', () => {
    const originalIds = records.map((record) => record.id);
    const oldest = filterRegistrations(records, 'all', '', 'oldest');
    const newest = filterRegistrations(records, 'all', '', 'newest');
    expect(oldest.map((record) => record.id)).toEqual(newest.map((record) => record.id).reverse());
    expect(records.map((record) => record.id)).toEqual(originalIds);
  });
  it('approves a pending registration once and updates counts immutably', () => {
    const approved = reviewRegistration(records, '1', 'approved');
    expect(registrationCounts(approved)).toEqual({
      all: 128,
      pending: 11,
      approved: 109,
      rejected: 8,
    });
    expect(records[0].status).toBe('pending');
    expect(reviewRegistration(approved, '1', 'rejected', 'Outro motivo')).toEqual(approved);
  });
  it('requires a nonblank reason and keeps the trimmed rejection reason', () => {
    expect(reviewRegistration(records, '1', 'rejected', '   ')).toBe(records);
    const rejected = reviewRegistration(records, '1', 'rejected', '  Complete o projeto.  ');
    expect(rejected[0]).toMatchObject({
      status: 'rejected',
      rejectionReason: 'Complete o projeto.',
    });
    expect(reviewRegistration(records, 'missing', 'approved')).toEqual(records);
  });
  it('formats dates consistently in the reference timezone', () => {
    expect(registrationDate(records[0].registeredAt)).toBe('02/11/2026');
    expect(registrationTime(records[0].registeredAt)).toBe('09:42');
  });
});
