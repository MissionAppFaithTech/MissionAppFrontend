import { create } from 'zustand';

export type FeedbackSeverity = 'success' | 'error' | 'info';

export type FeedbackMessage = {
  id: number;
  message: string;
  severity: FeedbackSeverity;
};

export interface FeedbackState {
  current: FeedbackMessage | null;
  /** Shows a toast that survives client-side navigation (rendered in the root providers). */
  notify: (message: string, severity?: FeedbackSeverity) => void;
  dismiss: () => void;
}

let nextId = 1;

export const useFeedbackStore = create<FeedbackState>()((set) => ({
  current: null,
  notify: (message, severity = 'success') => set({ current: { id: nextId++, message, severity } }),
  dismiss: () => set({ current: null }),
}));
