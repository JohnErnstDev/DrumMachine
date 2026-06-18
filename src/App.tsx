import { useDrumKit } from './hooks/useDrumKit.ts';
import { PadGrid } from './components/PadGrid.tsx';
import './style.css';

export function App() {
  const { trigger, activePad } = useDrumKit();

  return (
    <div id="app">
      <header>
        <h1>🥁 Drum Machine</h1>
        <p className="subtitle">Click a pad or use the keyboard shortcut to play</p>
      </header>

      <PadGrid activePad={activePad} onTrigger={trigger} />
    </div>
  );
}
