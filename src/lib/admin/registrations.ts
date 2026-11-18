import type { MissionaryRegistration, RegistrationStatus } from '@/types/admin';

export type RegistrationFilter = RegistrationStatus | 'all';
export type RegistrationOrder = 'newest' | 'oldest';
export const REGISTRATIONS_PAGE_SIZE = 8;

const normalize = (value: string) =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();

export function filterRegistrations(
  records: MissionaryRegistration[],
  filter: RegistrationFilter,
  query: string,
  order: RegistrationOrder
) {
  const search = normalize(query.trim());
  return records
    .filter(
      (record) =>
        (filter === 'all' || record.status === filter) &&
        normalize(`${record.name} ${record.email}`).includes(search)
    )
    .sort(
      (a, b) =>
        (Date.parse(a.registeredAt) - Date.parse(b.registeredAt)) * (order === 'newest' ? -1 : 1)
    );
}

export function registrationCounts(records: MissionaryRegistration[]) {
  return records.reduce(
    (counts, record) => {
      counts[record.status] += 1;
      return counts;
    },
    { all: records.length, pending: 0, approved: 0, rejected: 0 }
  );
}

/** Local simulation only. Completed reviews cannot be applied twice. */
export function reviewRegistration(
  records: MissionaryRegistration[],
  id: string,
  status: Exclude<RegistrationStatus, 'pending'>,
  reason = ''
) {
  if (status === 'rejected' && !reason.trim()) return records;
  return records.map((record) =>
    record.id === id && record.status === 'pending'
      ? { ...record, status, rejectionReason: status === 'rejected' ? reason.trim() : undefined }
      : record
  );
}

const dateFormatter = new Intl.DateTimeFormat('pt-BR', { timeZone: 'America/Sao_Paulo' });
const timeFormatter = new Intl.DateTimeFormat('pt-BR', {
  timeZone: 'America/Sao_Paulo',
  hour: '2-digit',
  minute: '2-digit',
});
export const registrationDate = (value: string) => dateFormatter.format(new Date(value));
export const registrationTime = (value: string) => timeFormatter.format(new Date(value));
