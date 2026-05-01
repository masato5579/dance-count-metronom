'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { audioEngine, VoiceType, SoundName, COUNT_SOUNDS } from '@/lib/audioEngine';

export interface MetronomeState {
  bpm: number;
  isPlaying: boolean;
  currentCount: number; // 0-7 (index into COUNT_SOUNDS)
  withAnd: boolean;
  voice: VoiceType;
  isLoading: boolean;
}

export interface MetronomeActions {
  setBpm: (bpm: number) => void;
  togglePlay: () => void;
  reset: () => void;
  setWithAnd: (withAnd: boolean) => void;
  setVoice: (voice: VoiceType) => void;
}

const LOOKAHEAD_MS = 25; // How often to check for scheduled notes (ms)
const SCHEDULE_AHEAD = 0.1; // How far ahead to schedule audio (seconds)

export function useMetronome(): [MetronomeState, MetronomeActions] {
  const [bpm, setBpmState] = useState(120);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentCount, setCurrentCount] = useState(0);
  const [withAnd, setWithAndState] = useState(false);
  const [voice, setVoiceState] = useState<VoiceType>('male');
  const [isLoading, setIsLoading] = useState(false);

  // Refs for scheduler state (avoid stale closures)
  const bpmRef = useRef(bpm);
  const withAndRef = useRef(withAnd);
  const isPlayingRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const nextNoteTimeRef = useRef(0);
  // sequenceIndex tracks position in the full sequence (count + optional "and")
  const sequenceIndexRef = useRef(0);

  // Sync refs with state
  useEffect(() => { bpmRef.current = bpm; }, [bpm]);
  useEffect(() => { withAndRef.current = withAnd; }, [withAnd]);

  // Load sounds when voice changes
  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    audioEngine.loadSounds(voice).then(() => {
      if (!cancelled) setIsLoading(false);
    });
    return () => { cancelled = true; };
  }, [voice]);

  const getSequence = useCallback((): SoundName[] => {
    const seq: SoundName[] = [];
    for (const count of COUNT_SOUNDS) {
      seq.push(count);
      if (withAndRef.current) {
        seq.push('and');
      }
    }
    return seq;
  }, []);

  const scheduleNote = useCallback(() => {
    const sequence = getSequence();
    const idx = sequenceIndexRef.current % sequence.length;
    const soundName = sequence[idx];

    audioEngine.playSound(soundName, nextNoteTimeRef.current);

    // Determine the count index (0-7) for display
    if (withAndRef.current) {
      // In with-and mode: indices 0,2,4,6,8,10,12,14 are counts, odd indices are "and"
      const countIdx = Math.floor(idx / 2);
      setCurrentCount(countIdx);
    } else {
      setCurrentCount(idx);
    }

    // Advance time
    const beatInterval = 60 / bpmRef.current;
    const interval = withAndRef.current ? beatInterval / 2 : beatInterval;
    nextNoteTimeRef.current += interval;
    sequenceIndexRef.current = (sequenceIndexRef.current + 1) % sequence.length;
  }, [getSequence]);

  const scheduler = useCallback(() => {
    const ctx = audioEngine.getContext();
    while (nextNoteTimeRef.current < ctx.currentTime + SCHEDULE_AHEAD) {
      scheduleNote();
    }
  }, [scheduleNote]);

  const togglePlay = useCallback(async () => {
    if (isPlayingRef.current) {
      // Stop
      isPlayingRef.current = false;
      setIsPlaying(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    } else {
      // Start / Resume
      await audioEngine.resume();
      await audioEngine.loadSounds(voice);

      isPlayingRef.current = true;
      setIsPlaying(true);

      // Set next note time to now (small offset for immediate start)
      nextNoteTimeRef.current = audioEngine.getCurrentTime() + 0.05;

      timerRef.current = setInterval(scheduler, LOOKAHEAD_MS);
    }
  }, [voice, scheduler]);

  const reset = useCallback(() => {
    // Stop playback
    isPlayingRef.current = false;
    setIsPlaying(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    // Reset position
    sequenceIndexRef.current = 0;
    setCurrentCount(0);
  }, []);

  const setBpm = useCallback((newBpm: number) => {
    const clamped = Math.max(60, Math.min(200, newBpm));
    setBpmState(clamped);
  }, []);

  const setWithAnd = useCallback((newWithAnd: boolean) => {
    setWithAndState(newWithAnd);
    // Reset sequence position to avoid desync
    if (isPlayingRef.current) {
      sequenceIndexRef.current = 0;
    }
  }, []);

  const setVoice = useCallback((newVoice: VoiceType) => {
    setVoiceState(newVoice);
  }, []);

  const state: MetronomeState = { bpm, isPlaying, currentCount, withAnd, voice, isLoading };
  const actions: MetronomeActions = { setBpm, togglePlay, reset, setWithAnd, setVoice };

  return [state, actions];
}
