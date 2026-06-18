import { useProjectStore } from '../store/useProjectStore.ts';
import { demoBoomBap, demoFourOnTheFloor, demoBreakbeat } from '../demos/demoSongs.ts';
import type { ProjectData, PatternData, StepCell } from '../sequencer/types.ts';

const DEMOS: Array<{ label: string; emoji: string; data: ProjectData }> = [
  { label: 'Boom Bap',          emoji: '🥁', data: demoBoomBap },
  { label: 'Four on the Floor', emoji: '🕺', data: demoFourOnTheFloor },
  { label: 'Breakbeat',         emoji: '🔀', data: demoBreakbeat },
];

function hasActiveSteps(patterns: PatternData[]): boolean {
  return patterns.some((p) =>
    p.grid.some((track: StepCell[]) => track.some((cell: StepCell) => cell.active))
  );
}

export function DemoButtons() {
  const store = useProjectStore();

  function handleLoad(demo: ProjectData) {
    if (
      hasActiveSteps(store.patterns) &&
      !window.confirm('Load demo? This will replace your current project.')
    ) {
      return;
    }
    store.loadDemo(demo);
  }

  return (
    <div className="demo-buttons">
      <span className="demo-buttons__label">Demos</span>
      {DEMOS.map((d) => (
        <button
          key={d.label}
          className="demo-btn"
          onClick={() => handleLoad(d.data)}
          title={`Load "${d.label}" demo`}
        >
          {d.emoji} {d.label}
        </button>
      ))}
    </div>
  );
}
