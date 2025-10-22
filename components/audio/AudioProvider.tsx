"use client";
import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";

type SoundName = "door" | "hover";
type Ctx = { play: (name: SoundName) => void; muted: boolean; setMuted: (v: boolean) => void };

const AudioCtx = createContext<Ctx>({ play: () => {}, muted: false, setMuted: () => {} });

export function AudioProvider({ children }: { children: React.ReactNode }) {
  const prefersReducedMotion = useMemo(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ?? false;
  }, []);

  const [muted, setMuted] = useState(prefersReducedMotion);
  const interacted = useRef(false);
  const cache = useRef<Record<SoundName, HTMLAudioElement>>({});

  useEffect(() => {
    const markInteracted = () => {
      interacted.current = true;
      window.removeEventListener("pointerdown", markInteracted);
      window.removeEventListener("keydown", markInteracted);
    };
    window.addEventListener("pointerdown", markInteracted, { once: true });
    window.addEventListener("keydown", markInteracted, { once: true });
    return () => {
      window.removeEventListener("pointerdown", markInteracted);
      window.removeEventListener("keydown", markInteracted);
    };
  }, []);

  const getSrc = (name: SoundName) =>
    name === "door" ? "/audio/placeholder-door-open.mp3" : "/audio/placeholder-hover.mp3";

  const play = (name: SoundName) => {
    if (muted || !interacted.current) return;
    if (!cache.current[name]) {
      cache.current[name] = new Audio(getSrc(name));
    }
    const a = cache.current[name];
    try {
      a.currentTime = 0;
      // Do not await; fire-and-forget, swallow policy errors silently
      void a.play().catch(() => {});
    } catch {
      // ignore
    }
  };

  return <AudioCtx.Provider value={{ play, muted, setMuted }}>{children}</AudioCtx.Provider>;
}

export const useAudio = () => useContext(AudioCtx);

export function MuteButton() {
  const { muted, setMuted } = useAudio();
  return (
    <button
      type="button"
      aria-label={muted ? "Unmute" : "Mute"}
      onClick={() => setMuted(!muted)}
      className="fixed right-4 top-4 z-10 rounded-md bg-white/5 px-3 py-1.5 text-xs text-white shadow-sm ring-1 ring-white/10 transition-opacity hover:opacity-100 opacity-70"
    >
      {muted ? "Muted" : "Sound On"}
    </button>
  );
}

