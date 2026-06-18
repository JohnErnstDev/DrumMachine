import { useCallback, useEffect, useRef, useState } from 'react';
import { DrumKit } from '../DrumKit.ts';
import { KEY_TO_INSTRUMENT } from '../config/pads.ts';
import type { InstrumentName } from '../types.ts';

const FLASH_DURATION_MS = 120;

export function useDrumKit() {
  const kitRef = useRef<DrumKit | null>(null);
  const [activePad, setActivePad] = useState<InstrumentName | null>(null);

  if (!kitRef.current) {
    kitRef.current = new DrumKit();
  }
  const kit = kitRef.current;

  const trigger = useCallback((name: InstrumentName) => {
    kit.resume().then(() => kit.trigger(name));
    setActivePad(name);
    setTimeout(() => setActivePad(null), FLASH_DURATION_MS);
  }, [kit]);

  useEffect(() => {
    const held = new Set<string>();

    const onKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (held.has(key)) return;
      held.add(key);
      const instrument = KEY_TO_INSTRUMENT[key];
      if (instrument) trigger(instrument);
    };

    const onKeyUp = (e: KeyboardEvent) => held.delete(e.key.toLowerCase());

    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('keyup', onKeyUp);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('keyup', onKeyUp);
    };
  }, [trigger]);

  return { trigger, activePad, kit };
}
