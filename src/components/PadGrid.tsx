import { PADS } from '../config/pads.ts';
import { DrumPad } from './DrumPad.tsx';
import type { InstrumentName } from '../types.ts';

interface Props {
  activePad: InstrumentName | null;
  onTrigger: (instrument: InstrumentName) => void;
}

export function PadGrid({ activePad, onTrigger }: Props) {
  return (
    <div className="pad-grid">
      {PADS.map((pad) => (
        <DrumPad
          key={pad.instrument}
          pad={pad}
          isActive={activePad === pad.instrument}
          onTrigger={() => onTrigger(pad.instrument)}
        />
      ))}
    </div>
  );
}
