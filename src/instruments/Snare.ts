import { createNoiseBuffer } from '../utils/noise.ts';

export class Snare {
  constructor(private ctx: BaseAudioContext, private destination: AudioNode) {}

  trigger(time = this.ctx.currentTime, gainMultiplier = 1.0): void {
    const osc = this.ctx.createOscillator();
    const oscGain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(200, time);
    osc.frequency.exponentialRampToValueAtTime(100, time + 0.15);

    oscGain.gain.setValueAtTime(0.7 * gainMultiplier, time);
    oscGain.gain.exponentialRampToValueAtTime(0.001, time + 0.15);

    osc.connect(oscGain);
    oscGain.connect(this.destination);
    osc.start(time);
    osc.stop(time + 0.15);

    const noiseSource = this.ctx.createBufferSource();
    noiseSource.buffer = createNoiseBuffer(this.ctx, 0.25);

    const noiseFilter = this.ctx.createBiquadFilter();
    noiseFilter.type = 'highpass';
    noiseFilter.frequency.value = 1500;
    noiseFilter.Q.value = 0.5;

    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(1.0 * gainMultiplier, time);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, time + 0.2);

    noiseSource.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(this.destination);
    noiseSource.start(time);
    noiseSource.stop(time + 0.25);
  }
}
