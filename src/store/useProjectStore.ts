import { create } from 'zustand';
import { createEmptyPattern, type PatternData, type ProjectData, type SongSlot } from '../sequencer/types.ts';
import { saveProject, loadProject } from '../persistence/storage.ts';
import { PADS } from '../config/pads.ts';

const STEP_COUNT = 16;

function makePattern(name: string): PatternData {
  return {
    id: crypto.randomUUID(),
    name,
    grid: createEmptyPattern(PADS.length, STEP_COUNT),
  };
}

function buildDefaultProject(): ProjectData {
  const p = makePattern('Pattern 1');
  return {
    patterns: [p],
    song: [],
    activePatternId: p.id,
    bpm: 120,
    volume: 0.8,
  };
}

interface ProjectStore extends ProjectData {
  // Pattern actions
  addPattern: () => void;
  duplicatePattern: (id: string) => void;
  renamePattern: (id: string, name: string) => void;
  deletePattern: (id: string) => void;
  setActivePattern: (id: string) => void;
  updateGrid: (trackIndex: number, stepIndex: number, field: 'active' | 'accent', value: boolean) => void;

  // Transport/global actions
  setBpm: (bpm: number) => void;
  setVolume: (volume: number) => void;

  // Song arrangement actions
  addSongSlot: (patternId: string) => void;
  removeSongSlot: (slotId: string) => void;
  moveSongSlot: (slotId: string, direction: 'up' | 'down') => void;
  setSongSlotRepeats: (slotId: string, repeats: number) => void;

  // Demo loading
  loadDemo: (demo: ProjectData) => void;
}

const saved = loadProject();
const initial: ProjectData = saved ?? buildDefaultProject();

// Debounce helper
let saveTimer: ReturnType<typeof setTimeout> | null = null;
function debouncedSave(project: ProjectData) {
  if (saveTimer !== null) clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    saveProject(project);
    saveTimer = null;
  }, 500);
}

export const useProjectStore = create<ProjectStore>((set, get) => {
  const store: ProjectStore = {
    ...initial,

    addPattern() {
      const count = get().patterns.length + 1;
      const p = makePattern(`Pattern ${count}`);
      set((s) => ({
        patterns: [...s.patterns, p],
        activePatternId: p.id,
      }));
    },

    duplicatePattern(id) {
      const src = get().patterns.find((p) => p.id === id);
      if (!src) return;
      const copy: PatternData = {
        id: crypto.randomUUID(),
        name: `${src.name} Copy`,
        grid: src.grid.map((track) => track.map((cell) => ({ ...cell }))),
      };
      set((s) => ({
        patterns: [...s.patterns, copy],
        activePatternId: copy.id,
      }));
    },

    renamePattern(id, name) {
      set((s) => ({
        patterns: s.patterns.map((p) => (p.id === id ? { ...p, name } : p)),
      }));
    },

    deletePattern(id) {
      const { patterns, activePatternId, song } = get();
      if (patterns.length <= 1) return;

      const idx = patterns.findIndex((p) => p.id === id);
      const remaining = patterns.filter((p) => p.id !== id);
      let newActive = activePatternId;
      if (activePatternId === id) {
        // Activate adjacent pattern
        const nextIdx = Math.min(idx, remaining.length - 1);
        newActive = remaining[nextIdx].id;
      }

      set({
        patterns: remaining,
        activePatternId: newActive,
        song: song.filter((s) => s.patternId !== id),
      });
    },

    setActivePattern(id) {
      set({ activePatternId: id });
    },

    updateGrid(trackIndex, stepIndex, field, value) {
      set((s) => {
        const patterns = s.patterns.map((p) => {
          if (p.id !== s.activePatternId) return p;
          const grid = p.grid.map((track, ti) =>
            ti === trackIndex
              ? track.map((cell, si) => {
                  if (si !== stepIndex) return cell;
                  if (field === 'active') {
                    return { active: value, accent: value ? cell.accent : false };
                  }
                  return { ...cell, accent: value };
                })
              : track
          );
          return { ...p, grid };
        });
        return { patterns };
      });
    },

    setBpm(bpm) {
      set({ bpm: Math.max(20, Math.min(300, bpm)) });
    },

    setVolume(volume) {
      set({ volume: Math.max(0, Math.min(1, volume)) });
    },

    addSongSlot(patternId) {
      const slot: SongSlot = {
        id: crypto.randomUUID(),
        patternId,
        repeats: 1,
      };
      set((s) => ({ song: [...s.song, slot] }));
    },

    removeSongSlot(slotId) {
      set((s) => ({ song: s.song.filter((sl) => sl.id !== slotId) }));
    },

    moveSongSlot(slotId, direction) {
      set((s) => {
        const arr = [...s.song];
        const idx = arr.findIndex((sl) => sl.id === slotId);
        if (idx < 0) return s;
        const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
        if (swapIdx < 0 || swapIdx >= arr.length) return s;
        [arr[idx], arr[swapIdx]] = [arr[swapIdx], arr[idx]];
        return { song: arr };
      });
    },

    setSongSlotRepeats(slotId, repeats) {
      const clamped = Math.max(1, Math.min(16, repeats));
      set((s) => ({
        song: s.song.map((sl) => (sl.id === slotId ? { ...sl, repeats: clamped } : sl)),
      }));
    },

    loadDemo(demo) {
      set({
        patterns:        demo.patterns,
        song:            demo.song,
        activePatternId: demo.activePatternId,
        bpm:             demo.bpm,
        volume:          demo.volume,
      });
    },
  };

  return store;
});

// Auto-save: subscribe after store creation
useProjectStore.subscribe((state) => {
  const { patterns, song, activePatternId, bpm, volume } = state;
  debouncedSave({ patterns, song, activePatternId, bpm, volume });
});
