import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { CHECKLIST_PHASES } from '@/components/church/churchGuideData';

export interface ChurchChecklistState {
  completedPhases: string[];
  hasHydrated: boolean;
  togglePhase: (phaseId: string) => void;
  reset: () => void;
  isPhaseCompleted: (phaseId: string) => boolean;
  setHasHydrated: (status: boolean) => void;
}

export const useChurchChecklistStore = create<ChurchChecklistState>()(
  persist(
    (set, get) => ({
      completedPhases: [],
      hasHydrated: false,

      togglePhase: (phaseId: string) => {
        const { completedPhases } = get();
        const next = completedPhases.includes(phaseId)
          ? completedPhases.filter((id) => id !== phaseId)
          : [...completedPhases, phaseId];
        set({ completedPhases: next });
      },

      reset: () => {
        set({ completedPhases: [] });
      },

      isPhaseCompleted: (phaseId: string) => {
        return get().completedPhases.includes(phaseId);
      },

      setHasHydrated: (status: boolean) => {
        set({ hasHydrated: status });
      },
    }),
    {
      name: 'missionapp_church_council_checklist_v1',
      storage: createJSONStorage(() => {
        if (typeof window !== 'undefined') {
          return window.localStorage;
        }
        return {
          getItem: () => null,
          setItem: () => {},
          removeItem: () => {},
        };
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);

export function getChecklistProgressPercentage(completedCount: number): number {
  if (!CHECKLIST_PHASES.length) return 0;
  return Math.round((completedCount / CHECKLIST_PHASES.length) * 100);
}

export function getChecklistProgressStatus(progressPercentage: number): string {
  if (progressPercentage === 100) return 'Conselho Missionário plenamente estabelecido! 🎉';
  if (progressPercentage >= 60) return 'Fase avançada de mobilização e preparo';
  if (progressPercentage >= 20) return 'Implantação em andamento';
  return 'Primeiros passos da estruturação';
}
