/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useCallback, useRef, useState } from 'react';

/* ---- 8-bit chiptune using Web Audio API ---- */

function play8BitMusic(ctx: AudioContext): { stop: () => void } {
  const masterGain = ctx.createGain();
  masterGain.gain.value = 0.08;
  masterGain.connect(ctx.destination);

  const notes = [
    261.63, 329.63, 392.00, 523.25, 392.00, 329.63,
    293.66, 349.23, 440.00, 523.25, 440.00, 349.23,
    329.63, 392.00, 523.25, 659.25, 523.25, 392.00,
    261.63, 329.63, 392.00, 523.25, 659.25, 783.99,
  ];

  const noteDuration = 0.18;
  const noteGap = 0.04;
  let loopTimeout: ReturnType<typeof setTimeout> | null = null;
  let stopped = false;

  function scheduleLoop(): void {
    if (stopped) return;
    const now = ctx.currentTime;
    for (let i = 0; i < notes.length; i++) {
      const startTime = now + i * (noteDuration + noteGap);
      const osc = ctx.createOscillator();
      osc.type = 'square';
      osc.frequency.value = notes[i];
      const env = ctx.createGain();
      env.gain.setValueAtTime(0.3, startTime);
      env.gain.exponentialRampToValueAtTime(0.01, startTime + noteDuration);
      osc.connect(env);
      env.connect(masterGain);
      osc.start(startTime);
      osc.stop(startTime + noteDuration);
    }
    const loopLength = notes.length * (noteDuration + noteGap);
    loopTimeout = setTimeout(scheduleLoop, loopLength * 1000);
  }

  scheduleLoop();

  return {
    stop(): void {
      stopped = true;
      if (loopTimeout !== null) clearTimeout(loopTimeout);
      masterGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
    },
  };
}

/* ---- Context ---- */

interface AudioContextValue {
  readonly isPlaying: boolean;
  readonly startMusic: () => void;
  readonly stopMusic: () => void;
  readonly toggleMusic: () => void;
}

const AudioCtx = createContext<AudioContextValue>({
  isPlaying: false,
  startMusic: (): void => { /* noop */ },
  stopMusic: (): void => { /* noop */ },
  toggleMusic: (): void => { /* noop */ },
});

function AudioProvider({ children }: { readonly children: React.ReactNode }): React.ReactElement {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const ctxRef = useRef<AudioContext | null>(null);
  const musicRef = useRef<{ stop: () => void } | null>(null);

  const startMusic = useCallback((): void => {
    if (musicRef.current !== null) return;
    const ctx = ctxRef.current ?? new AudioContext();
    ctxRef.current = ctx;
    musicRef.current = play8BitMusic(ctx);
    setIsPlaying(true);
  }, []);

  const stopMusic = useCallback((): void => {
    if (musicRef.current !== null) {
      musicRef.current.stop();
      musicRef.current = null;
    }
    if (ctxRef.current !== null) {
      void ctxRef.current.close();
      ctxRef.current = null;
    }
    setIsPlaying(false);
  }, []);

  const toggleMusic = useCallback((): void => {
    if (musicRef.current !== null) {
      stopMusic();
    } else {
      startMusic();
    }
  }, [startMusic, stopMusic]);

  const value: AudioContextValue = { isPlaying, startMusic, stopMusic, toggleMusic };

  return <AudioCtx.Provider value={value}>{children}</AudioCtx.Provider>;
}

function useAudio(): AudioContextValue {
  return useContext(AudioCtx);
}

export { AudioProvider, useAudio };
