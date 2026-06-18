import type { TransportState } from '../sequencer/types.ts';

interface Props {
  transport: TransportState;
  bpm: number;
  volume: number;
  loop: boolean;
  onPlay: () => void;
  onPause: () => void;
  onStop: () => void;
  onRewind: () => void;
  onBpmChange: (bpm: number) => void;
  onVolumeChange: (vol: number) => void;
  onLoopToggle: () => void;
}

export function Transport({
  transport, bpm, volume, loop,
  onPlay, onPause, onStop, onRewind,
  onBpmChange, onVolumeChange, onLoopToggle,
}: Props) {
  const isPlaying = transport === 'playing';

  return (
    <div className="transport">
      {/* Playback buttons */}
      <div className="transport__btns">
        <button
          className="transport-btn transport-btn--play"
          onMouseDown={isPlaying ? onPause : onPlay}
          title={isPlaying ? 'Pause' : 'Play'}
        >
          {isPlaying ? '⏸' : '▶'}
        </button>
        <button className="transport-btn" onMouseDown={onStop}   title="Stop">⏹</button>
        <button className="transport-btn" onMouseDown={onRewind} title="Rewind">⏮</button>
      </div>

      {/* Loop */}
      <button
        className={`transport-btn transport-btn--loop${loop ? ' transport-btn--active' : ''}`}
        onMouseDown={onLoopToggle}
        title="Toggle loop"
      >
        🔁 Loop
      </button>

      {/* BPM */}
      <label className="transport__field">
        <span className="transport__field-label">BPM</span>
        <input
          className="transport__bpm-input"
          type="number"
          min={20}
          max={300}
          value={bpm}
          onChange={(e) => onBpmChange(Number(e.target.value))}
        />
      </label>

      {/* Master Volume */}
      <label className="transport__field transport__field--vol">
        <span className="transport__field-label">Vol</span>
        <input
          className="transport__vol-slider"
          type="range"
          min={0}
          max={1}
          step={0.01}
          value={volume}
          onChange={(e) => onVolumeChange(Number(e.target.value))}
        />
      </label>
    </div>
  );
}
