'use client';

import { createContext, useContext, useState, type ReactNode } from 'react';
import { mockMissionaryRegistrations } from '@/mocks/admin';
import { reviewRegistration } from '@/lib/admin/registrations';
import type { MissionaryRegistration, RegistrationStatus } from '@/types/admin';

type AdminRegistrationsContextValue = {
  records: MissionaryRegistration[];
  review: (id: string, status: Exclude<RegistrationStatus, 'pending'>, reason?: string) => void;
};
const AdminRegistrationsContext = createContext<AdminRegistrationsContextValue | null>(null);

/** Scoped to the admin layout: survives navigation, resets on reload or leaving admin. */
export default function AdminRegistrationsProvider({ children }: { children: ReactNode }) {
  const [records, setRecords] = useState(mockMissionaryRegistrations);
  const review: AdminRegistrationsContextValue['review'] = (id, status, reason) => {
    setRecords((current) => reviewRegistration(current, id, status, reason));
  };
  return (
    <AdminRegistrationsContext value={{ records, review }}>{children}</AdminRegistrationsContext>
  );
}

export function useAdminRegistrations() {
  const context = useContext(AdminRegistrationsContext);
  if (!context) throw new Error('AdminRegistrationsProvider is required');
  return context;
}
