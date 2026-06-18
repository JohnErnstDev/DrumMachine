import { useDrumKit } from './hooks/useDrumKit.ts';
import { useSequencer } from './hooks/useSequencer.ts';
import { PadGrid } from './components/PadGrid.tsx';
import { Sequencer } from './components/Sequencer.tsx';
import { PatternLibrary } from './components/PatternLibrary.tsx';
import './style.css';

export function App() {
  const { trigger, activePad, kit } = useDrumKit();
  const sequencer = useSequencer(kit);

  return (
    <div id="app">
      <header>
        <h1>🥁 Drum Machine</h1>
        <p className="subtitle">Click a pad or use the keyboard shortcut to play</p>
      </header>

      <PadGrid activePad={activePad} onTrigger={trigger} />

      <PatternLibrary />

      <Sequencer {...sequencer} />
    </div>
  );
}
