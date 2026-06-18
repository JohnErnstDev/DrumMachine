import { BassDrum } from './instruments/BassDrum.ts';
import { Snare } from './instruments/Snare.ts';
import { HiHat } from './instruments/HiHat.ts';
import { Tom } from './instruments/Tom.ts';
import { Clap } from './instruments/Clap.ts';
import { Cymbal } from './instruments/Cymbal.ts';
import type { InstrumentName } from './types.ts';

export class DrumKit {
  readonly ctx: AudioContext;
  private masterGain: GainNode;

  private bassDrum: BassDrum;
  private snare: Snare;
  private hiHat: HiHat;
  private tom: Tom;
  private clap: Clap;
  private cymbal: Cymbal;

  constructor() {
    this.ctx = new AudioContext();
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.value = 0.8;
    this.masterGain.connect(this.ctx.destination);

    this.bassDrum = new BassDrum(this.ctx, this.masterGain);
    this.snare    = new Snare(this.ctx, this.masterGain);
    this.hiHat    = new HiHat(this.ctx, this.masterGain);
    this.tom      = new Tom(this.ctx, this.masterGain);
    this.clap     = new Clap(this.ctx, this.masterGain);
    this.cymbal   = new Cymbal(this.ctx, this.masterGain);
  }

  async resume(): Promise<void> {
    if (this.ctx.state === 'suspended') {
      await this.ctx.resume();
    }
  }

  setVolume(value: number): void {
    this.masterGain.gain.setTargetAtTime(
      Math.max(0, Math.min(1, value)),
      this.ctx.currentTime,
      0.01
    );
  }

  /** Trigger at ctx.currentTime (used by pad buttons). */
  trigger(name: InstrumentName): void {
    this.triggerAt(name, this.ctx.currentTime, 1.0);
  }

  /** Trigger at a specific scheduled time with optional accent gain. */
  triggerAt(name: InstrumentName, time: number, gainMultiplier = 1.0): void {
    switch (name) {
      case 'bassDrum':    this.bassDrum.trigger(time, gainMultiplier);            break;
      case 'snare':       this.snare.trigger(time, gainMultiplier);               break;
      case 'clap':        this.clap.trigger(time, gainMultiplier);                break;
      case 'closedHiHat': this.hiHat.triggerClosed(time, gainMultiplier);         break;
      case 'openHiHat':   this.hiHat.triggerOpen(time, gainMultiplier);           break;
      case 'highTom':     this.tom.trigger('high', time, gainMultiplier);         break;
      case 'midTom':      this.tom.trigger('mid', time, gainMultiplier);          break;
      case 'lowTom':      this.tom.trigger('low', time, gainMultiplier);          break;
      case 'crash':       this.cymbal.trigger('crash', time, gainMultiplier);     break;
      case 'ride':        this.cymbal.trigger('ride', time, gainMultiplier);      break;
    }
  }
}
