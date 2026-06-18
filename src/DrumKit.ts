import { BassDrum } from './instruments/BassDrum.ts';
import { Snare } from './instruments/Snare.ts';
import { HiHat } from './instruments/HiHat.ts';
import { Tom } from './instruments/Tom.ts';
import { Clap } from './instruments/Clap.ts';
import { Cymbal } from './instruments/Cymbal.ts';
import type { InstrumentName } from './types.ts';

export class DrumKit {
  readonly ctx: AudioContext;

  private bassDrum: BassDrum;
  private snare: Snare;
  private hiHat: HiHat;
  private tom: Tom;
  private clap: Clap;
  private cymbal: Cymbal;

  constructor() {
    this.ctx = new AudioContext();
    this.bassDrum = new BassDrum(this.ctx);
    this.snare    = new Snare(this.ctx);
    this.hiHat    = new HiHat(this.ctx);
    this.tom      = new Tom(this.ctx);
    this.clap     = new Clap(this.ctx);
    this.cymbal   = new Cymbal(this.ctx);
  }

  /** Resume context on first user gesture (browser autoplay policy). */
  async resume(): Promise<void> {
    if (this.ctx.state === 'suspended') {
      await this.ctx.resume();
    }
  }

  trigger(name: InstrumentName): void {
    const t = this.ctx.currentTime;
    switch (name) {
      case 'bassDrum':    this.bassDrum.trigger(t);            break;
      case 'snare':       this.snare.trigger(t);               break;
      case 'clap':        this.clap.trigger(t);                break;
      case 'closedHiHat': this.hiHat.triggerClosed(t);         break;
      case 'openHiHat':   this.hiHat.triggerOpen(t);           break;
      case 'highTom':     this.tom.trigger('high', t);         break;
      case 'midTom':      this.tom.trigger('mid', t);          break;
      case 'lowTom':      this.tom.trigger('low', t);          break;
      case 'crash':       this.cymbal.trigger('crash', t);     break;
      case 'ride':        this.cymbal.trigger('ride', t);      break;
    }
  }
}
