import type { ProjectData, Pattern, StepCell } from '../sequencer/types.ts';

// ── Track index reference ────────────────────────────────────────────────────
// 0 bassDrum | 1 snare | 2 clap | 3 closedHiHat | 4 openHiHat
// 5 highTom  | 6 midTom | 7 lowTom | 8 crash | 9 ride
//
// Step reference (0-based):
// Beat 1: 0 1 2 3 | Beat 2: 4 5 6 7 | Beat 3: 8 9 10 11 | Beat 4: 12 13 14 15
// 8th notes: 0,2,4,6,8,10,12,14   16th notes: all 0-15

const TRACK_COUNT = 10;
const STEP_COUNT = 16;

type StepDef = { steps: number[]; accent?: number[] };

function buildGrid(def: Partial<Record<number, StepDef>>): Pattern {
  return Array.from({ length: TRACK_COUNT }, (_, ti): StepCell[] =>
    Array.from({ length: STEP_COUNT }, (_, si): StepCell => {
      const track = def[ti];
      if (!track?.steps.includes(si)) return { active: false, accent: false };
      return { active: true, accent: track.accent?.includes(si) ?? false };
    })
  );
}

// ── Demo 1: Boom Bap (Hip-Hop, 90 BPM) ─────────────────────────────────────

const boomBapVerse = buildGrid({
  0: { steps: [0, 8] },                          // kick: beats 1, 3
  1: { steps: [4, 12] },                         // snare: beats 2, 4
  3: { steps: [0, 2, 4, 6, 8, 10, 12, 14] },    // closed hat: 8th notes
  4: { steps: [10] },                            // open hat: "and of 3"
});

const boomBapChorus = buildGrid({
  0: { steps: [0, 3, 8, 11] },                   // kick: syncopated
  1: { steps: [4, 12], accent: [4, 12] },        // snare: accented
  3: { steps: [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15] }, // 16th hats
  4: { steps: [6, 14] },                         // open hat: "and of 2", "and of 4"
  8: { steps: [0], accent: [0] },                // crash: beat 1, accented
});

// ── Demo 2: Four on the Floor (House/Disco, 125 BPM) ─────────────────────────

const fourOnTheFloorGroove = buildGrid({
  0: { steps: [0, 4, 8, 12] },                  // kick: every beat
  2: { steps: [4, 12] },                        // clap: beats 2, 4
  3: { steps: [0, 2, 4, 6, 8, 10, 12, 14] },   // closed hat: 8th notes
  4: { steps: [14] },                           // open hat: "and of 4"
});

const fourOnTheFloorBuild = buildGrid({
  0: { steps: [0, 4, 8, 12] },                  // kick: four on the floor
  1: { steps: [4, 6, 8, 10, 12, 14] },          // snare: rolling build
  2: { steps: [4, 12] },                        // clap: beats 2, 4
  3: { steps: [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15] }, // 16th hats
  8: { steps: [0], accent: [0] },               // crash: beat 1, accented
});

// ── Demo 3: Breakbeat (Electronic/Funk, 110 BPM) ─────────────────────────────

const breakbeatBreak = buildGrid({
  0: { steps: [0, 3, 8, 10] },                  // kick: syncopated
  1: { steps: [4, 6, 12] },                     // snare: beat 2, syncopated, beat 4
  3: { steps: [0, 2, 4, 6, 8, 10, 12, 14] },   // closed hat: 8th notes
  4: { steps: [9] },                            // open hat: "and of 3" (step 9)
});

const breakbeatDrop = buildGrid({
  0: { steps: [0, 3, 8, 10] },                  // kick: syncopated
  1: { steps: [4, 12], accent: [12] },           // snare: beats 2+4, accent on 4
  3: { steps: [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15] }, // 16th hats
  5: { steps: [13, 14] },                       // high tom: 16th-note fill
  6: { steps: [15] },                           // mid tom: last step
  8: { steps: [0], accent: [0] },               // crash: beat 1, accented
});

// ── Assemble ProjectData objects ─────────────────────────────────────────────

function makeId() { return crypto.randomUUID(); }

export const demoBoomBap: ProjectData = (() => {
  const verse   = { id: makeId(), name: 'Verse',  grid: boomBapVerse };
  const chorus  = { id: makeId(), name: 'Chorus', grid: boomBapChorus };
  return {
    patterns: [verse, chorus],
    activePatternId: verse.id,
    bpm: 90,
    volume: 0.8,
    song: [
      { id: makeId(), patternId: verse.id,  repeats: 2 },
      { id: makeId(), patternId: chorus.id, repeats: 2 },
      { id: makeId(), patternId: verse.id,  repeats: 2 },
      { id: makeId(), patternId: chorus.id, repeats: 2 },
    ],
  };
})();

export const demoFourOnTheFloor: ProjectData = (() => {
  const groove = { id: makeId(), name: 'Groove', grid: fourOnTheFloorGroove };
  const build  = { id: makeId(), name: 'Build',  grid: fourOnTheFloorBuild };
  return {
    patterns: [groove, build],
    activePatternId: groove.id,
    bpm: 125,
    volume: 0.8,
    song: [
      { id: makeId(), patternId: groove.id, repeats: 4 },
      { id: makeId(), patternId: build.id,  repeats: 2 },
      { id: makeId(), patternId: groove.id, repeats: 4 },
    ],
  };
})();

export const demoBreakbeat: ProjectData = (() => {
  const brk  = { id: makeId(), name: 'Break', grid: breakbeatBreak };
  const drop = { id: makeId(), name: 'Drop',  grid: breakbeatDrop };
  return {
    patterns: [brk, drop],
    activePatternId: brk.id,
    bpm: 110,
    volume: 0.8,
    song: [
      { id: makeId(), patternId: brk.id,  repeats: 2 },
      { id: makeId(), patternId: drop.id, repeats: 1 },
      { id: makeId(), patternId: brk.id,  repeats: 2 },
      { id: makeId(), patternId: drop.id, repeats: 1 },
    ],
  };
})();
