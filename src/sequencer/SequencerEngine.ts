import type { DrumKit } from "../DrumKit.ts";
import { PADS } from "../config/pads.ts";
import type { Pattern } from "./types.ts";

const LOOKAHEAD_MS = 25; // how often the scheduler runs (ms)
const SCHEDULE_AHEAD_TIME = 0.1; // how far ahead to schedule audio (seconds)
const TOTAL_STEPS = 16;
const ACCENT_GAIN = 1.5;

export class SequencerEngine {
  private schedulerTimer: ReturnType<typeof setTimeout> | null = null;
  private endTimer: ReturnType<typeof setTimeout> | null = null;

  private nextStepTime = 0;
  private currentStep = 0;
  private stepsRemaining = 0;
  private lastScheduledTime = 0;

  private bpm = 120;
  private loop = true;
  private pattern: Pattern = [];

  constructor(
    private readonly ctx: AudioContext,
    private readonly kit: DrumKit,
    private readonly onStepChange: (step: number) => void,
    private readonly onPlaybackEnd: () => void,
  ) {}

  private getStepDuration(): number {
    return 60 / this.bpm / 4; // 16th note duration in seconds
  }

  private scheduleStep(step: number, time: number): void {
    this.lastScheduledTime = time;

    this.pattern.forEach((track, trackIndex) => {
      const cell = track[step];
      if (cell?.active) {
        const instrument = PADS[trackIndex]?.instrument;
        if (instrument) {
          this.kit.triggerAt(instrument, time, cell.accent ? ACCENT_GAIN : 1.0);
        }
      }
    });

    // Fire visual update close to when audio actually plays
    const visualDelay = Math.max(0, (time - this.ctx.currentTime) * 1000);
    setTimeout(() => this.onStepChange(step), visualDelay);
  }

  private schedule(): void {
    while (this.nextStepTime < this.ctx.currentTime + SCHEDULE_AHEAD_TIME) {
      if (this.stepsRemaining <= 0) {
        // All steps scheduled; wait for the last one to play then notify
        const stepDuration = this.getStepDuration();
        const endDelay = Math.max(
          0,
          (this.lastScheduledTime + stepDuration - this.ctx.currentTime) * 1000,
        );
        this.endTimer = setTimeout(() => {
          this.endTimer = null;
          this.currentStep = 0;
          this.onPlaybackEnd();
        }, endDelay);
        this.schedulerTimer = null;
        return;
      }

      this.scheduleStep(this.currentStep, this.nextStepTime);
      this.nextStepTime += this.getStepDuration();
      this.currentStep = (this.currentStep + 1) % TOTAL_STEPS;
      this.stepsRemaining--;
    }

    this.schedulerTimer = setTimeout(() => this.schedule(), LOOKAHEAD_MS);
  }

  play(): void {
    if (this.schedulerTimer !== null) return; // already running

    // Cancel any pending end-of-pattern callback
    if (this.endTimer !== null) {
      clearTimeout(this.endTimer);
      this.endTimer = null;
    }

    this.stepsRemaining = this.loop ? Infinity : TOTAL_STEPS - this.currentStep;
    this.nextStepTime = this.ctx.currentTime;
    this.schedule();
  }

  pause(): void {
    if (this.schedulerTimer !== null) {
      clearTimeout(this.schedulerTimer);
      this.schedulerTimer = null;
    }
    if (this.endTimer !== null) {
      clearTimeout(this.endTimer);
      this.endTimer = null;
    }
  }

  stop(): void {
    this.pause();
    this.currentStep = 0;
  }

  rewind(): void {
    const wasPlaying = this.schedulerTimer !== null;
    this.stop();
    if (wasPlaying) {
      this.play();
    }
  }

  getCurrentStep(): number {
    return this.currentStep;
  }

  setPattern(pattern: Pattern): void {
    this.pattern = pattern;
  }

  setBpm(bpm: number): void {
    this.bpm = Math.max(20, Math.min(300, bpm));
  }

  setLoop(loop: boolean): void {
    this.loop = loop;
    // Update remaining steps if currently playing
    if (this.schedulerTimer !== null) {
      this.stepsRemaining = loop ? Infinity : TOTAL_STEPS - this.currentStep;
    }
  }
}
