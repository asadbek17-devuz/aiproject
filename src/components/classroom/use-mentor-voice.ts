"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useMotionValue, type MotionValue } from "framer-motion";
import { uz } from "@/lib/i18n/uz";
import type { TtsStyle } from "@/server/tts/provider.interface";

export type MentorVoiceState = "idle" | "thinking" | "speaking";

export type SpeakOptions = {
  voice?: string;
  style?: TtsStyle;
  rate?: number;
  onEnd?: () => void;
};

export type SpeakResult = "played" | "blocked" | "error" | "aborted";

export type MentorVoiceController = {
  state: MentorVoiceState;
  error: string | null;
  blocked: boolean;
  mouthLevel: MotionValue<number>;
  progress: number;
  durationMs: number;
  currentTimeMs: number;
  rate: number;
  setRate: (rate: number) => void;
  speak: (text: string, options?: SpeakOptions) => Promise<SpeakResult>;
  pause: () => void;
  stop: () => void;
  resume: () => Promise<void>;
};

type AudioWindow = Window & {
  webkitAudioContext?: typeof AudioContext;
};

export function useMentorVoice(): MentorVoiceController {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const urlRef = useRef<string | null>(null);
  const contextRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const rafRef = useRef<number | null>(null);
  const smoothedRef = useRef(0);
  const rateRef = useRef(1);
  const mouthLevel = useMotionValue(0);

  const [state, setState] = useState<MentorVoiceState>("idle");
  const [error, setError] = useState<string | null>(null);
  const [blocked, setBlocked] = useState(false);
  const [progress, setProgress] = useState(0);
  const [durationMs, setDurationMs] = useState(0);
  const [currentTimeMs, setCurrentTimeMs] = useState(0);
  const [rate, setRateState] = useState(1);

  const stopMouthLoop = useCallback(() => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    smoothedRef.current = 0;
    mouthLevel.set(0);
  }, [mouthLevel]);

  const detachAnalyser = useCallback(() => {
    stopMouthLoop();
    try {
      sourceRef.current?.disconnect();
    } catch {
      // The source may already be disconnected by the browser.
    }
    try {
      analyserRef.current?.disconnect();
    } catch {
      // The analyser may already be disconnected by the browser.
    }
    sourceRef.current = null;
    analyserRef.current = null;
  }, [stopMouthLoop]);

  const startMouthLoop = useCallback(() => {
    const analyser = analyserRef.current;
    if (!analyser || rafRef.current !== null) return;
    const buffer = new Uint8Array(analyser.fftSize);

    const tick = () => {
      if (!analyserRef.current) return;
      analyserRef.current.getByteTimeDomainData(buffer);
      let sum = 0;
      for (let index = 0; index < buffer.length; index += 1) {
        const value = ((buffer[index] ?? 128) - 128) / 128;
        sum += value * value;
      }
      const rms = Math.sqrt(sum / buffer.length);
      const target = Math.min(1, rms * 5.2);
      const previous = smoothedRef.current;
      const next = target > previous ? previous + (target - previous) * 0.55 : previous * 0.82;
      smoothedRef.current = next;
      mouthLevel.set(next < 0.015 ? 0 : next);
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
  }, [mouthLevel]);

  const attachAnalyser = useCallback(
    (audio: HTMLAudioElement) => {
      if (typeof window === "undefined") return;
      const AudioContextClass = window.AudioContext ?? (window as AudioWindow).webkitAudioContext;
      if (!AudioContextClass) return;
      try {
        const context = contextRef.current ?? new AudioContextClass();
        contextRef.current = context;
        if (context.state === "suspended") void context.resume();
        const source = context.createMediaElementSource(audio);
        const analyser = context.createAnalyser();
        analyser.fftSize = 1024;
        analyser.smoothingTimeConstant = 0.55;
        source.connect(analyser);
        analyser.connect(context.destination);
        sourceRef.current = source;
        analyserRef.current = analyser;
        startMouthLoop();
      } catch {
        detachAnalyser();
      }
    },
    [detachAnalyser, startMouthLoop],
  );

  const cleanupAudio = useCallback(() => {
    detachAnalyser();
    if (audioRef.current) {
      audioRef.current.onended = null;
      audioRef.current.onerror = null;
      audioRef.current.ontimeupdate = null;
      audioRef.current.onloadedmetadata = null;
      audioRef.current.pause();
      audioRef.current = null;
    }
    if (urlRef.current) {
      URL.revokeObjectURL(urlRef.current);
      urlRef.current = null;
    }
    setProgress(0);
    setCurrentTimeMs(0);
    setDurationMs(0);
  }, [detachAnalyser]);

  const stop = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    cleanupAudio();
    setState("idle");
    setBlocked(false);
  }, [cleanupAudio]);

  const speak = useCallback(
    async (text: string, options?: SpeakOptions): Promise<SpeakResult> => {
      const clean = text.trim();
      if (!clean) return "aborted";

      stop();
      setError(null);
      setBlocked(false);
      setState("thinking");
      setProgress(0);
      setCurrentTimeMs(0);
      setDurationMs(0);

      const controller = new AbortController();
      abortRef.current = controller;

      try {
        const response = await fetch("/api/tts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            text: clean,
            voice: options?.voice,
            style: options?.style,
          }),
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error("tts_request_failed");
        }

        const blob = await response.blob();
        if (controller.signal.aborted) return "aborted";

        const url = URL.createObjectURL(blob);
        urlRef.current = url;
        const audio = new Audio(url);
        audioRef.current = audio;
        audio.playbackRate = options?.rate ?? rateRef.current;

        const syncProgress = () => {
          const total = Number.isFinite(audio.duration) ? audio.duration : 0;
          const current = audio.currentTime;
          setDurationMs(total * 1000);
          setCurrentTimeMs(current * 1000);
          setProgress(total > 0 ? Math.min(1, current / total) : 0);
        };

        audio.onloadedmetadata = syncProgress;
        audio.ontimeupdate = syncProgress;
        audio.onended = () => {
          setProgress(1);
          cleanupAudio();
          setState("idle");
          options?.onEnd?.();
        };
        audio.onerror = () => {
          cleanupAudio();
          setError(uz.mentorDemo.voiceError);
          setState("idle");
          options?.onEnd?.();
        };

        attachAnalyser(audio);

        setState("speaking");
        try {
          await audio.play();
        } catch (caught) {
          if (caught instanceof DOMException && caught.name === "NotAllowedError") {
            setState("idle");
            setBlocked(true);
            return "blocked";
          }
          throw caught;
        }

        return "played";
      } catch (caught) {
        if (controller.signal.aborted || (caught instanceof DOMException && caught.name === "AbortError")) {
          return "aborted";
        }
        cleanupAudio();
        setError(uz.mentorDemo.voiceError);
        setState("idle");
        options?.onEnd?.();
        return "error";
      }
    },
    [attachAnalyser, cleanupAudio, stop],
  );

  const pause = useCallback(() => {
    const audio = audioRef.current;
    if (audio && !audio.paused) {
      audio.pause();
      stopMouthLoop();
      setState("idle");
    }
  }, [stopMouthLoop]);

  const resume = useCallback(async () => {
    const audio = audioRef.current;
    if (!audio) return;
    setError(null);
    try {
      const context = contextRef.current;
      if (context?.state === "suspended") await context.resume();
      setState("speaking");
      setBlocked(false);
      startMouthLoop();
      await audio.play();
    } catch {
      cleanupAudio();
      setError(uz.mentorDemo.voiceError);
      setState("idle");
    }
  }, [cleanupAudio, startMouthLoop]);

  const setRate = useCallback((next: number) => {
    rateRef.current = next;
    setRateState(next);
    if (audioRef.current) audioRef.current.playbackRate = next;
  }, []);

  useEffect(() => {
    return () => {
      abortRef.current?.abort();
      cleanupAudio();
      void contextRef.current?.close();
      contextRef.current = null;
    };
  }, [cleanupAudio]);

  return {
    state,
    error,
    blocked,
    mouthLevel,
    progress,
    durationMs,
    currentTimeMs,
    rate,
    setRate,
    speak,
    pause,
    stop,
    resume,
  };
}
