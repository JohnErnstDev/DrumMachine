import type { SongSlot } from '../sequencer/types.ts';

interface Props {
  slot: SongSlot;
  patternName: string;
  isCurrent: boolean;
  onRemove: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onSetRepeats: (repeats: number) => void;
}

export function SongSlotCard({
  slot,
  patternName,
  isCurrent,
  onRemove,
  onMoveUp,
  onMoveDown,
  onSetRepeats,
}: Props) {
  return (
    <div className={`song-slot-card${isCurrent ? ' song-slot-card--current' : ''}`}>
      <span className="song-slot-card__name" title={patternName}>
        {patternName}
      </span>

      <div className="song-slot-card__repeats">
        <button
          className="song-slot-card__rep-btn"
          onClick={() => onSetRepeats(slot.repeats - 1)}
          disabled={slot.repeats <= 1}
          title="Fewer repeats"
        >
          −
        </button>
        <span className="song-slot-card__rep-count" title="Repeats">
          ×{slot.repeats}
        </span>
        <button
          className="song-slot-card__rep-btn"
          onClick={() => onSetRepeats(slot.repeats + 1)}
          disabled={slot.repeats >= 16}
          title="More repeats"
        >
          +
        </button>
      </div>

      <div className="song-slot-card__order">
        <button className="song-slot-card__order-btn" onClick={onMoveUp} title="Move up">
          ↑
        </button>
        <button className="song-slot-card__order-btn" onClick={onMoveDown} title="Move down">
          ↓
        </button>
      </div>

      <button className="song-slot-card__remove" onClick={onRemove} title="Remove slot">
        ✕
      </button>
    </div>
  );
}
