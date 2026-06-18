export type TomVariant = 'high' | 'mid' | 'low';

const TOM_PARAMS: Record<TomVariant, { startFreq: number; endFreq: number; decay: number }> = {
  high: { startFreq: 420, endFreq: 200, decay: 0.28 },
  mid:  { startFreq: 260, endFreq: 130, decay: 0.32 },
  low:  { startFreq: 180, endFreq: 80,  decay: 0.38 },
};

export class Tom {
  constructor(private ctx: BaseAudioContext, private destination: AudioNode) {}

  trigger(variant: TomVariant, time = this.ctx.currentTime, gainMultiplier = 1.0): void {
    const { startFreq, endFreq, decay } = TOM_PARAMS[variant];

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(startFreq, time);
    osc.frequency.exponentialRampToValueAtTime(endFreq, time + decay * 0.6);

    gain.gain.setValueAtTime(1.0 * gainMultiplier, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + decay);

    osc.connect(gain);
    gain.connect(this.destination);

    osc.start(time);
    osc.stop(time + decay + 0.02);
  }
}
