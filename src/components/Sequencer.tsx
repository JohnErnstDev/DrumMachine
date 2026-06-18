import { PADS } from '../config/pads.ts';
import { SequencerTrack } from './SequencerTrack.tsx';
import { Transport } from './Transport.tsx';
import type { useSequencer } from '../hooks/useSequencer.ts';

type SequencerProps = ReturnType<typeof useSequencer>;

export function Sequencer({
  pattern,
  transport,
  bpm,
  volume,
  loop,
  currentStep,
  play,
  pause,
  stop,
  rewind,
  setBpm,
  setVolume,
  setLoop,
  toggleStep,
  toggleAccent,
}: SequencerProps) {
  return (
    <section className="sequencer">
      <h2 className="sequencer__title">Step Sequencer</h2>

      <Transport
        transport={transport}
        bpm={bpm}
        volume={volume}
        loop={loop}
        onPlay={play}
        onPause={pause}
        onStop={stop}
        onRewind={rewind}
        onBpmChange={setBpm}
        onVolumeChange={setVolume}
        onLoopToggle={() => setLoop(!loop)}
      />

      <div className="sequencer__grid">
        {/* Beat number header */}
        <div className="seq-track seq-track--header">
          <div className="seq-track__label" />
          <div className="seq-track__steps">
            {[1, 2, 3, 4].map((beat, gi) => (
              <div key={gi} className="seq-step-group seq-step-group--header">
                <span className="seq-beat-label">{beat}</span>
                <span /><span /><span />
              </div>
            ))}
          </div>
        </div>

        {PADS.map((pad, trackIndex) => (
          <SequencerTrack
            key={pad.instrument}
            label={pad.label}
            color={pad.color}
            steps={pattern[trackIndex]}
            currentStep={currentStep}
            onToggle={(si) => toggleStep(trackIndex, si)}
            onAccentToggle={(si) => toggleAccent(trackIndex, si)}
          />
        ))}
      </div>
    </section>
  );
}
