import { createNoiseBuffer } from '../utils/noise.ts';

export type CymbalVariant = 'crash' | 'ride';

const CYMBAL_PARAMS: Record<CymbalVariant, { decay: number; cutoff: number; pingFreq: number | null }> = {
  crash: { decay: 1.6,  cutoff: 7500, pingFreq: null  },
  ride:  { decay: 0.9,  cutoff: 6000, pingFreq: 5200  },
};

export class Cymbal {
  constructor(private ctx: AudioContext, private destination: AudioNode) {}

  trigger(variant: CymbalVariant, time = this.ctx.currentTime, gainMultiplier = 1.0): void {
    const { decay, cutoff, pingFreq } = CYMBAL_PARAMS[variant];

    const noiseSource = this.ctx.createBufferSource();
    noiseSource.buffer = createNoiseBuffer(this.ctx, decay + 0.1);

    const highpass = this.ctx.createBiquadFilter();
    highpass.type = 'highpass';
    highpass.frequency.value = cutoff;
    highpass.Q.value = 0.4;

    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(0.35 * gainMultiplier, time);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, time + decay);

    noiseSource.connect(highpass);
    highpass.connect(noiseGain);
    noiseGain.connect(this.destination);
    noiseSource.start(time);
    noiseSource.stop(time + decay + 0.1);

    if (pingFreq !== null) {
      const pingOsc = this.ctx.createOscillator();
      const pingGain = this.ctx.createGain();

      pingOsc.type = 'sine';
      pingOsc.frequency.value = pingFreq;

      pingGain.gain.setValueAtTime(0.25 * gainMultiplier, time);
      pingGain.gain.exponentialRampToValueAtTime(0.001, time + decay * 0.5);

      pingOsc.connect(pingGain);
      pingGain.connect(this.destination);
      pingOsc.start(time);
      pingOsc.stop(time + decay * 0.5 + 0.02);
    }
  }
}
