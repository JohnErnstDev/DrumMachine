import { createNoiseBuffer } from '../utils/noise.ts';

export class BassDrum {
  constructor(private ctx: BaseAudioContext, private destination: AudioNode) {}

  trigger(time = this.ctx.currentTime, gainMultiplier = 1.0): void {
    const osc = this.ctx.createOscillator();
    const oscGain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(160, time);
    osc.frequency.exponentialRampToValueAtTime(35, time + 0.08);

    oscGain.gain.setValueAtTime(1.0 * gainMultiplier, time);
    oscGain.gain.exponentialRampToValueAtTime(0.001, time + 0.5);

    osc.connect(oscGain);
    oscGain.connect(this.destination);
    osc.start(time);
    osc.stop(time + 0.5);

    // Short noise click for transient punch
    const noiseSource = this.ctx.createBufferSource();
    noiseSource.buffer = createNoiseBuffer(this.ctx, 0.05);

    const clickGain = this.ctx.createGain();
    clickGain.gain.setValueAtTime(0.6 * gainMultiplier, time);
    clickGain.gain.exponentialRampToValueAtTime(0.001, time + 0.02);

    const clickFilter = this.ctx.createBiquadFilter();
    clickFilter.type = 'bandpass';
    clickFilter.frequency.value = 1200;
    clickFilter.Q.value = 0.8;

    noiseSource.connect(clickFilter);
    clickFilter.connect(clickGain);
    clickGain.connect(this.destination);
    noiseSource.start(time);
    noiseSource.stop(time + 0.05);
  }
}
