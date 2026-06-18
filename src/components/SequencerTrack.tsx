import { SequencerStep } from './SequencerStep.tsx';
import type { StepCell } from '../sequencer/types.ts';

interface Props {
  label: string;
  color: string;
  steps: StepCell[];
  currentStep: number | null;
  onToggle: (stepIndex: number) => void;
  onAccentToggle: (stepIndex: number) => void;
}

// Group 16 steps into 4 beats of 4 sixteenth-notes each
const GROUPS = [[0,1,2,3],[4,5,6,7],[8,9,10,11],[12,13,14,15]];

export function SequencerTrack({ label, color, steps, currentStep, onToggle, onAccentToggle }: Props) {
  return (
    <div className="seq-track">
      <div className="seq-track__label" style={{ color }}>{label}</div>
      <div className="seq-track__steps">
        {GROUPS.map((group, gi) => (
          <div key={gi} className="seq-step-group">
            {group.map((si) => (
              <SequencerStep
                key={si}
                cell={steps[si]}
                isCurrent={currentStep === si}
                trackColor={color}
                onToggle={() => onToggle(si)}
                onAccentToggle={() => onAccentToggle(si)}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
