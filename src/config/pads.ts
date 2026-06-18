import type { InstrumentName } from '../types.ts';

export interface PadConfig {
  instrument: InstrumentName;
  label: string;
  key: string;
  className: string;
}

export const PADS: PadConfig[] = [
  { instrument: 'bassDrum',    label: 'Bass Drum',       key: 'q', className: 'pad--kick'    },
  { instrument: 'snare',       label: 'Snare',           key: 'w', className: 'pad--snare'   },
  { instrument: 'clap',        label: 'Clap',            key: 'e', className: 'pad--clap'    },
  { instrument: 'closedHiHat', label: 'Hi-Hat (Closed)', key: 'r', className: 'pad--hihat-c' },
  { instrument: 'openHiHat',   label: 'Hi-Hat (Open)',   key: 't', className: 'pad--hihat-o' },
  { instrument: 'highTom',     label: 'High Tom',        key: 'a', className: 'pad--tom-hi'  },
  { instrument: 'midTom',      label: 'Mid Tom',         key: 's', className: 'pad--tom-mid' },
  { instrument: 'lowTom',      label: 'Low Tom',         key: 'd', className: 'pad--tom-lo'  },
  { instrument: 'crash',       label: 'Crash',           key: 'z', className: 'pad--crash'   },
  { instrument: 'ride',        label: 'Ride',            key: 'x', className: 'pad--ride'    },
];

/** Quick lookup: keyboard key → instrument name */
export const KEY_TO_INSTRUMENT: Record<string, InstrumentName> =
  Object.fromEntries(PADS.map((p) => [p.key, p.instrument]));
