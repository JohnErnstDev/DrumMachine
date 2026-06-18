export interface StepCell {
  active: boolean;
  accent: boolean;
}

/** 2D array: [trackIndex][stepIndex] */
export type Pattern = StepCell[][];

export type TransportState = 'stopped' | 'playing' | 'paused';

export function createEmptyPattern(tracks: number, steps: number): Pattern {
  return Array.from({ length: tracks }, () =>
    Array.from({ length: steps }, () => ({ active: false, accent: false }))
  );
}
