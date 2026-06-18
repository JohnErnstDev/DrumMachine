import { createNoiseBuffer } from '../utils/noise.ts';

export class HiHat {
  constructor(private ctx: AudioContext, private destination: AudioNode) {}

  private triggerNoise(time: number, decayTime: number, cutoff: number, gainMultiplier: number): void {
    const noiseSource = this.ctx.createBufferSource();
    noiseSource.buffer = createNoiseBuffer(this.ctx, decayTime + 0.05);

    const highpass = this.ctx.createBiquadFilter();
    highpass.type = 'highpass';
    highpass.frequency.value = cutoff;
    highpass.Q.value = 0.5;

    const bandpass = this.ctx.createBiquadFilter();
    bandpass.type = 'bandpass';
    bandpass.frequency.value = cutoff * 1.5;
    bandpass.Q.value = 0.8;

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.4 * gainMultiplier, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + decayTime);

    noiseSource.connect(highpass);
    highpass.connect(bandpass);
    bandpass.connect(gain);
    gain.connect(this.destination);

    noiseSource.start(time);
    noiseSource.stop(time + decayTime + 0.05);
  }

  triggerClosed(time = this.ctx.currentTime, gainMultiplier = 1.0): void {
    this.triggerNoise(time, 0.05, 8000, gainMultiplier);
  }

  triggerOpen(time = this.ctx.currentTime, gainMultiplier = 1.0): void {
    this.triggerNoise(time, 0.45, 6500, gainMultiplier);
  }
}
