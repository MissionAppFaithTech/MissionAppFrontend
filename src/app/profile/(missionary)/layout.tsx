import type { ReactNode } from 'react';
import MissionaryProfileLayout from '@/components/profile/MissionaryProfileLayout';

export default function ProfileLayout({ children }: { children: ReactNode }) {
  return <MissionaryProfileLayout>{children}</MissionaryProfileLayout>;
}
