import { useProjectStore } from '../store/useProjectStore.ts';
import { SongSlotCard } from './SongSlotCard.tsx';

interface Props {
  currentSlotIndex: number | null;
}

export function SongArrangement({ currentSlotIndex }: Props) {
  const {
    patterns,
    song,
    activePatternId,
    addSongSlot,
    removeSongSlot,
    moveSongSlot,
    setSongSlotRepeats,
  } = useProjectStore();

  const patternNameById = Object.fromEntries(patterns.map((p) => [p.id, p.name]));

  return (
    <div className="song-arrangement">
      <div className="song-arrangement__header">
        <span className="song-arrangement__title">Song Arrangement</span>
        <button
          className="song-arrangement__add-btn"
          onClick={() => addSongSlot(activePatternId)}
          title="Add current pattern as next slot"
        >
          + Add Slot
        </button>
      </div>

      {song.length === 0 ? (
        <p className="song-arrangement__empty">
          No slots yet. Click <strong>+ Add Slot</strong> to add the active pattern.
        </p>
      ) : (
        <div className="song-arrangement__slots">
          {song.map((slot, idx) => (
            <SongSlotCard
              key={slot.id}
              slot={slot}
              patternName={patternNameById[slot.patternId] ?? '?'}
              isCurrent={currentSlotIndex === idx}
              onRemove={() => removeSongSlot(slot.id)}
              onMoveUp={() => moveSongSlot(slot.id, 'up')}
              onMoveDown={() => moveSongSlot(slot.id, 'down')}
              onSetRepeats={(r) => setSongSlotRepeats(slot.id, r)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
