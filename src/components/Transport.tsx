import type { TransportState } from '../sequencer/types.ts';

interface Props {
  transport: TransportState;
  bpm: number;
  volume: number;
  loop: boolean;
  isExporting: boolean;
  songMode: boolean;
  onPlay: () => void;
  onPause: () => void;
  onStop: () => void;
  onRewind: () => void;
  onBpmChange: (bpm: number) => void;
  onVolumeChange: (vol: number) => void;
  onLoopToggle: () => void;
  onSongModeToggle: () => void;
  onExport: () => void;
}

export function Transport({
  transport, bpm, volume, loop, isExporting, songMode,
  onPlay, onPause, onStop, onRewind,
  onBpmChange, onVolumeChange, onLoopToggle, onSongModeToggle, onExport,
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

      {/* Pattern / Song mode toggle */}
      <button
        className={`transport-btn transport-btn--mode${songMode ? ' transport-btn--active' : ''}`}
        onMouseDown={onSongModeToggle}
        title={songMode ? 'Switch to Pattern mode' : 'Switch to Song mode'}
      >
        {songMode ? '🎵 Song' : '🥁 Pattern'}
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

      {/* WAV Export */}
      <button
        className={`transport-btn transport-btn--export${isExporting ? ' transport-btn--loading' : ''}`}
        onMouseDown={isExporting ? undefined : onExport}
        disabled={isExporting}
        title="Export one-shot loop as WAV"
      >
        {isExporting ? '⏳ Rendering…' : songMode ? '💾 Export Song' : '💾 Export Pattern'}
      </button>
    </div>
  );
}
