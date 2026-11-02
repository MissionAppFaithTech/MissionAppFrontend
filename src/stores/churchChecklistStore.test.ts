import { describe, it, expect, beforeEach } from 'vitest';
import {
  useChurchChecklistStore,
  getChecklistProgressPercentage,
  getChecklistProgressStatus,
} from './churchChecklistStore';

describe('churchChecklistStore', () => {
  beforeEach(() => {
    useChurchChecklistStore.getState().reset();
  });

  it('starts with an empty completedPhases list', () => {
    expect(useChurchChecklistStore.getState().completedPhases).toEqual([]);
    expect(useChurchChecklistStore.getState().isPhaseCompleted('fase-1')).toBe(false);
  });

  it('toggles a phase on and off', () => {
    const { togglePhase } = useChurchChecklistStore.getState();

    togglePhase('fase-1');
    expect(useChurchChecklistStore.getState().completedPhases).toContain('fase-1');
    expect(useChurchChecklistStore.getState().isPhaseCompleted('fase-1')).toBe(true);

    togglePhase('fase-2');
    expect(useChurchChecklistStore.getState().completedPhases).toEqual(['fase-1', 'fase-2']);

    togglePhase('fase-1');
    expect(useChurchChecklistStore.getState().completedPhases).toEqual(['fase-2']);
    expect(useChurchChecklistStore.getState().isPhaseCompleted('fase-1')).toBe(false);
  });

  it('resets all completed phases', () => {
    const { togglePhase, reset } = useChurchChecklistStore.getState();

    togglePhase('fase-1');
    togglePhase('fase-2');
    expect(useChurchChecklistStore.getState().completedPhases.length).toBe(2);

    reset();
    expect(useChurchChecklistStore.getState().completedPhases).toEqual([]);
  });

  it('calculates progress percentage and human status correctly', () => {
    expect(getChecklistProgressPercentage(0)).toBe(0);
    expect(getChecklistProgressStatus(0)).toBe('Primeiros passos da estruturação');

    expect(getChecklistProgressPercentage(1)).toBe(20);
    expect(getChecklistProgressStatus(20)).toBe('Implantação em andamento');

    expect(getChecklistProgressPercentage(3)).toBe(60);
    expect(getChecklistProgressStatus(60)).toBe('Fase avançada de mobilização e preparo');

    expect(getChecklistProgressPercentage(5)).toBe(100);
    expect(getChecklistProgressStatus(100)).toBe(
      'Conselho Missionário plenamente estabelecido! 🎉'
    );
  });
});
