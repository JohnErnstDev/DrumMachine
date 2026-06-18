import { BassDrum } from '../instruments/BassDrum.ts';
import { Snare } from '../instruments/Snare.ts';
import { HiHat } from '../instruments/HiHat.ts';
import { Tom } from '../instruments/Tom.ts';
import { Clap } from '../instruments/Clap.ts';
import { Cymbal } from '../instruments/Cymbal.ts';
import { PADS } from '../config/pads.ts';
import type { Pattern } from '../sequencer/types.ts';
import type { InstrumentName } from '../types.ts';

const STEP_COUNT = 16;
const ACCENT_GAIN = 1.5;
const SAMPLE_RATE = 44100;
/** Extra seconds after the last step so long sounds (crash, ride) fully decay. */
const TAIL_DURATION = 2.0;

export async function renderPattern(
  pattern: Pattern,
  bpm: number,
  volume: number,
): Promise<AudioBuffer> {
  const stepDuration = 60 / bpm / 4; // 16th-note duration in seconds
  const totalDuration = stepDuration * STEP_COUNT + TAIL_DURATION;

  const offlineCtx = new OfflineAudioContext(
    2,
    Math.ceil(SAMPLE_RATE * totalDuration),
    SAMPLE_RATE,
  );

  const masterGain = offlineCtx.createGain();
  masterGain.gain.value = volume;
  masterGain.connect(offlineCtx.destination);

  // Fresh instrument instances backed by the offline context
  const bassDrum = new BassDrum(offlineCtx, masterGain);
  const snare    = new Snare(offlineCtx, masterGain);
  const hiHat    = new HiHat(offlineCtx, masterGain);
  const tom      = new Tom(offlineCtx, masterGain);
  const clap     = new Clap(offlineCtx, masterGain);
  const cymbal   = new Cymbal(offlineCtx, masterGain);

  function scheduleNote(name: InstrumentName, time: number, gainMultiplier: number): void {
    switch (name) {
      case 'bassDrum':    bassDrum.trigger(time, gainMultiplier);          break;
      case 'snare':       snare.trigger(time, gainMultiplier);             break;
      case 'clap':        clap.trigger(time, gainMultiplier);              break;
      case 'closedHiHat': hiHat.triggerClosed(time, gainMultiplier);       break;
      case 'openHiHat':   hiHat.triggerOpen(time, gainMultiplier);         break;
      case 'highTom':     tom.trigger('high', time, gainMultiplier);       break;
      case 'midTom':      tom.trigger('mid', time, gainMultiplier);        break;
      case 'lowTom':      tom.trigger('low', time, gainMultiplier);        break;
      case 'crash':       cymbal.trigger('crash', time, gainMultiplier);   break;
      case 'ride':        cymbal.trigger('ride', time, gainMultiplier);    break;
    }
  }

  pattern.forEach((track, trackIndex) => {
    const instrument = PADS[trackIndex]?.instrument;
    if (!instrument) return;
    track.forEach((cell, stepIndex) => {
      if (cell.active) {
        scheduleNote(
          instrument,
          stepIndex * stepDuration,
          cell.accent ? ACCENT_GAIN : 1.0,
        );
      }
    });
  });

  return offlineCtx.startRendering();
}
