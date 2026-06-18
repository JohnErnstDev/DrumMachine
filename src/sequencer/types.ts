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

export interface PatternData {
  id: string;
  name: string;
  grid: Pattern;
}

export interface SongSlot {
  id: string;
  patternId: string;
  repeats: number;
}

export interface ProjectData {
  patterns: PatternData[];
  song: SongSlot[];
  activePatternId: string;
  bpm: number;
  volume: number;
}
