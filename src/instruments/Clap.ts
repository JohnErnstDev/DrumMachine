import { createNoiseBuffer } from '../utils/noise.ts';

// Simulate multiple hands clapping by firing several short noise bursts
// with slight timing offsets.
const BURST_OFFSETS = [0, 0.008, 0.018, 0.028];
const BURST_DURATION = 0.045;

export class Clap {
  constructor(private ctx: AudioContext, private destination: AudioNode) {}

  trigger(time = this.ctx.currentTime, gainMultiplier = 1.0): void {
    BURST_OFFSETS.forEach((offset, i) => {
      const burstTime = time + offset;
      const isLast = i === BURST_OFFSETS.length - 1;

      const noiseSource = this.ctx.createBufferSource();
      noiseSource.buffer = createNoiseBuffer(this.ctx, BURST_DURATION);

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.value = 1100;
      filter.Q.value = 0.6;

      const gain = this.ctx.createGain();
      const decay = isLast ? 0.18 : BURST_DURATION;
      gain.gain.setValueAtTime(0.9 * gainMultiplier, burstTime);
      gain.gain.exponentialRampToValueAtTime(0.001, burstTime + decay);

      noiseSource.connect(filter);
      filter.connect(gain);
      gain.connect(this.destination);

      noiseSource.start(burstTime);
      noiseSource.stop(burstTime + decay + 0.01);
    });
  }
}
