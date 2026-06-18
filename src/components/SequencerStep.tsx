import type { StepCell } from '../sequencer/types.ts';

interface Props {
  cell: StepCell;
  isCurrent: boolean;
  trackColor: string;
  onToggle: () => void;
  onAccentToggle: () => void;
}

export function SequencerStep({ cell, isCurrent, trackColor, onToggle, onAccentToggle }: Props) {
  const classes = [
    'seq-step',
    cell.active  ? 'seq-step--active'  : '',
    isCurrent    ? 'seq-step--current' : '',
  ].filter(Boolean).join(' ');

  return (
    <div className={classes} style={{ '--track-color': trackColor } as React.CSSProperties}>
      {/* Main toggle — top area */}
      <div className="seq-step__body" onMouseDown={onToggle} />

      {/* Accent toggle — bottom strip */}
      <div
        className={`seq-step__accent${cell.accent ? ' seq-step__accent--on' : ''}`}
        onMouseDown={(e) => { e.stopPropagation(); onAccentToggle(); }}
        title="Accent"
      />
    </div>
  );
}
