import type { ProjectData } from '../sequencer/types.ts';

const STORAGE_KEY = 'drum-machine-project';

export function saveProject(project: ProjectData): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(project));
  } catch {
    // Storage may be unavailable (private browsing, quota exceeded, etc.)
  }
}

export function loadProject(): ProjectData | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as ProjectData;
  } catch {
    return null;
  }
}
