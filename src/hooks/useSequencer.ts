import { useCallback, useEffect, useRef, useState } from 'react';
import { SequencerEngine } from '../sequencer/SequencerEngine.ts';
import type { DrumKit } from '../DrumKit.ts';
import type { TransportState } from '../sequencer/types.ts';
import { renderPattern } from '../export/renderPattern.ts';
import { renderSong } from '../export/renderSong.ts';
import { encodeWav, downloadBlob } from '../export/encodeWav.ts';
import { useProjectStore } from '../store/useProjectStore.ts';

// ── Hook ─────────────────────────────────────────────────────────────────────

export function useSequencer(kit: DrumKit) {
  const store = useProjectStore();

  // Derive active pattern from store
  const activePatternData = store.patterns.find((p) => p.id === store.activePatternId);
  const activeGrid = activePatternData?.grid ?? [];

  const [transport, setTransport] = useState<TransportState>('stopped');
  const [loop, setLoopState] = useState(true);
  const [currentStep, setCurrentStep] = useState<number | null>(null);
  const [songMode, setSongModeState] = useState(false);
  const [currentSlotIndex, setCurrentSlotIndex] = useState<number | null>(null);

  const engineRef = useRef<SequencerEngine | null>(null);

  // Ref so callbacks always see latest store state without recreating the engine
  const storeRef = useRef(store);
  useEffect(() => { storeRef.current = store; });

  // Create engine once
  useEffect(() => {
    engineRef.current = new SequencerEngine(
      kit.ctx,
      kit,
      (step) => setCurrentStep(step),
      () => {
        setTransport('stopped');
        setCurrentStep(null);
        setCurrentSlotIndex(null);
      },
      (slotIdx) => {
        setCurrentSlotIndex(slotIdx);
        // Load the now-playing pattern into the sequencer view
        const slot = storeRef.current.song[slotIdx];
        if (slot) storeRef.current.setActivePattern(slot.patternId);
      },
    );
    return () => engineRef.current?.stop();
  }, [kit]);

  // Sync active grid → engine
  useEffect(() => {
    engineRef.current?.setPattern(activeGrid);
  }, [activeGrid]);

  // Sync bpm → engine
  useEffect(() => {
    engineRef.current?.setBpm(store.bpm);
  }, [store.bpm]);

  // Sync loop → engine
  useEffect(() => {
    engineRef.current?.setLoop(loop);
  }, [loop]);

  // Sync volume → kit
  useEffect(() => {
    kit.setVolume(store.volume);
  }, [store.volume, kit]);

  // Sync song data → engine
  useEffect(() => {
    const patternMap = new Map(store.patterns.map((p) => [p.id, p.grid]));
    engineRef.current?.setSong(store.song, patternMap);
  }, [store.song, store.patterns]);

  // Sync song mode → engine
  useEffect(() => {
    engineRef.current?.setSongMode(songMode);
  }, [songMode]);

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
    setCurrentSlotIndex(null);
  }, []);

  const rewind = useCallback(() => {
    engineRef.current?.rewind();
    if (transport !== 'playing') setCurrentStep(null);
  }, [transport]);

  const setBpm = useCallback((v: number) => store.setBpm(v), [store]);
  const setVolume = useCallback((v: number) => store.setVolume(v), [store]);
  const setLoop = useCallback((v: boolean) => setLoopState(v), []);
  const setSongMode = useCallback((v: boolean) => setSongModeState(v), []);

  const toggleStep = useCallback(
    (trackIndex: number, stepIndex: number) => {
      const current = activeGrid[trackIndex]?.[stepIndex]?.active ?? false;
      store.updateGrid(trackIndex, stepIndex, 'active', !current);
    },
    [store, activeGrid],
  );

  const toggleAccent = useCallback(
    (trackIndex: number, stepIndex: number) => {
      const current = activeGrid[trackIndex]?.[stepIndex]?.accent ?? false;
      store.updateGrid(trackIndex, stepIndex, 'accent', !current);
    },
    [store, activeGrid],
  );

  // ── WAV export ───────────────────────────────────────────────────────────

  const [isExporting, setIsExporting] = useState(false);

  const exportWav = useCallback(async () => {
    if (isExporting) return;
    setIsExporting(true);
    try {
      let audioBuffer: AudioBuffer;
      let filename: string;

      if (songMode && store.song.length > 0) {
        audioBuffer = await renderSong(store.song, store.patterns, store.bpm, store.volume);
        filename = 'drum-song.wav';
      } else {
        audioBuffer = await renderPattern(activeGrid, store.bpm, store.volume);
        filename = 'drum-loop.wav';
      }

      const blob = encodeWav(audioBuffer);
      downloadBlob(blob, filename);
    } finally {
      setIsExporting(false);
    }
  }, [isExporting, songMode, store.song, store.patterns, activeGrid, store.bpm, store.volume]);

  return {
    pattern: activeGrid,
    transport,
    bpm: store.bpm,
    volume: store.volume,
    loop,
    currentStep,
    isExporting,
    songMode,
    currentSlotIndex,
    play,
    pause,
    stop,
    rewind,
    setBpm,
    setVolume,
    setLoop,
    setSongMode,
    toggleStep,
    toggleAccent,
    exportWav,
  };
}
