import type { PadConfig } from '../config/pads.ts';

interface Props {
  pad: PadConfig;
  isActive: boolean;
  onTrigger: () => void;
}

export function DrumPad({ pad, isActive, onTrigger }: Props) {
  return (
    <button
      className={`pad ${pad.className}${isActive ? ' active' : ''}`}
      onMouseDown={onTrigger}
      aria-label={`${pad.label} (key: ${pad.key.toUpperCase()})`}
    >
      <span className="key">{pad.key.toUpperCase()}</span>
      <span className="label">{pad.label}</span>
    </button>
  );
}
