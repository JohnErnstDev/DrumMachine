import { useCallback, useEffect, useReducer, useRef, useState } from 'react';
import { SequencerEngine } from '../sequencer/SequencerEngine.ts';
import { createEmptyPattern } from '../sequencer/types.ts';
import { PADS } from '../config/pads.ts';
import { renderPattern } from '../export/renderPattern.ts';
import { encodeWav, downloadBlob } from '../export/encodeWav.ts';
import type { DrumKit } from '../DrumKit.ts';
import type { Pattern, StepCell, TransportState } from '../sequencer/types.ts';

const STEP_COUNT = 16;

// ── Pattern reducer ──────────────────────────────────────────────────────────

type PatternAction =
  | { type: 'TOGGLE_STEP';   trackIndex: number; stepIndex: number }
  | { type: 'TOGGLE_ACCENT'; trackIndex: number; stepIndex: number };

function updateCell(
  state: Pattern,
  trackIndex: number,
  stepIndex: number,
  updater: (cell: StepCell) => StepCell,
): Pattern {
  return state.map((track, ti) =>
    ti === trackIndex
      ? track.map((cell, si) => (si === stepIndex ? updater(cell) : cell))
      : track,
  );
}

function patternReducer(state: Pattern, action: PatternAction): Pattern {
  switch (action.type) {
    case 'TOGGLE_STEP':
      return updateCell(state, action.trackIndex, action.stepIndex, (c) => ({
        ...c,
        active: !c.active,
        // Clear accent when deactivating a step
        accent: !c.active ? c.accent : false,
      }));
    case 'TOGGLE_ACCENT':
      return updateCell(state, action.trackIndex, action.stepIndex, (c) => ({
        ...c,
        accent: !c.accent,
      }));
    default:
      return state;
  }
}

// ── Hook ─────────────────────────────────────────────────────────────────────

export function useSequencer(kit: DrumKit) {
  const [pattern, dispatch] = useReducer(
    patternReducer,
    undefined,
    () => createEmptyPattern(PADS.length, STEP_COUNT),
  );
  const [transport, setTransport] = useState<TransportState>('stopped');
  const [bpm, setBpmState] = useState(120);
  const [volume, setVolumeState] = useState(0.8);
  const [loop, setLoopState] = useState(true);
  const [currentStep, setCurrentStep] = useState<number | null>(null);

  const engineRef = useRef<SequencerEngine | null>(null);

  // Create engine once
  useEffect(() => {
    engineRef.current = new SequencerEngine(
      kit.ctx,
      kit,
      (step) => setCurrentStep(step),
      () => {
        setTransport('stopped');
        setCurrentStep(null);
      },
    );
    return () => engineRef.current?.stop();
  }, [kit]);

  // Sync pattern → engine (engine reads pattern per-step, so pass latest ref)
  useEffect(() => {
    engineRef.current?.setPattern(pattern);
  }, [pattern]);

  useEffect(() => {
    engineRef.current?.setBpm(bpm);
  }, [bpm]);

  useEffect(() => {
    engineRef.current?.setLoop(loop);
  }, [loop]);

  useEffect(() => {
    kit.setVolume(volume);
  }, [volume, kit]);

  // ── Transport actions ────────────────────────────────────────────────────

  const play = useCallback(() => {
    kit.resume().then(() => {
      engineRef.current?.play();
      setTransport('playing');
    });
  }, [kit]);

  const pause = useCallback(() => {
    engineRef.current?.pause();
    setTransport('paused');
  }, []);

  const stop = useCallback(() => {
    engineRef.current?.stop();
    setTransport('stopped');
    setCurrentStep(null);
  }, []);

  const rewind = useCallback(() => {
    engineRef.current?.rewind();
    if (transport !== 'playing') setCurrentStep(null);
  }, [transport]);

  const setBpm = useCallback((v: number) => setBpmState(Math.max(20, Math.min(300, v))), []);
  const setVolume = useCallback((v: number) => setVolumeState(v), []);
  const setLoop = useCallback((v: boolean) => setLoopState(v), []);

  const toggleStep = useCallback((trackIndex: number, stepIndex: number) => {
    dispatch({ type: 'TOGGLE_STEP', trackIndex, stepIndex });
  }, []);

  const toggleAccent = useCallback((trackIndex: number, stepIndex: number) => {
    dispatch({ type: 'TOGGLE_ACCENT', trackIndex, stepIndex });
  }, []);

  // ── WAV export ───────────────────────────────────────────────────────────

  const [isExporting, setIsExporting] = useState(false);

  const exportWav = useCallback(async () => {
    if (isExporting) return;
    setIsExporting(true);
    try {
      const audioBuffer = await renderPattern(pattern, bpm, volume);
      const blob = encodeWav(audioBuffer);
      downloadBlob(blob, 'drum-loop.wav');
    } finally {
      setIsExporting(false);
    }
  }, [isExporting, pattern, bpm, volume]);

  return {
    pattern,
    transport,
    bpm,
    volume,
    loop,
    currentStep,
    isExporting,
    play,
    pause,
    stop,
    rewind,
    setBpm,
    setVolume,
    setLoop,
    toggleStep,
    toggleAccent,
    exportWav,
  };
}
