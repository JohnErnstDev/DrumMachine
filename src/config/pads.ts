import type { InstrumentName } from '../types.ts';

export interface PadConfig {
  instrument: InstrumentName;
  label: string;
  key: string;
  className: string;
  color: string; // used for sequencer step active color
}

export const PADS: PadConfig[] = [
  { instrument: 'bassDrum',    label: 'Bass Drum',       key: 'q', className: 'pad--kick',    color: '#ef4444' },
  { instrument: 'snare',       label: 'Snare',           key: 'w', className: 'pad--snare',   color: '#f97316' },
  { instrument: 'clap',        label: 'Clap',            key: 'e', className: 'pad--clap',    color: '#a855f7' },
  { instrument: 'closedHiHat', label: 'Hi-Hat (Closed)', key: 'r', className: 'pad--hihat-c', color: '#eab308' },
  { instrument: 'openHiHat',   label: 'Hi-Hat (Open)',   key: 't', className: 'pad--hihat-o', color: '#f59e0b' },
  { instrument: 'highTom',     label: 'High Tom',        key: 'a', className: 'pad--tom-hi',  color: '#3b82f6' },
  { instrument: 'midTom',      label: 'Mid Tom',         key: 's', className: 'pad--tom-mid', color: '#60a5fa' },
  { instrument: 'lowTom',      label: 'Low Tom',         key: 'd', className: 'pad--tom-lo',  color: '#93c5fd' },
  { instrument: 'crash',       label: 'Crash',           key: 'z', className: 'pad--crash',   color: '#14b8a6' },
  { instrument: 'ride',        label: 'Ride',            key: 'x', className: 'pad--ride',    color: '#06b6d4' },
];

export const KEY_TO_INSTRUMENT: Record<string, InstrumentName> =
  Object.fromEntries(PADS.map((p) => [p.key, p.instrument]));
