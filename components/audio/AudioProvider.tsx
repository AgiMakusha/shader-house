"use client";
import { createContext, useContext, useEffect, useRef, useState } from "react";
type Ctx = { play: (name: "door" | "hover") => void; muted: boolean; setMuted: (v:boolean)=>void; };
const AudioCtx = createContext<Ctx>({ play: () => {}, muted: false, setMuted: () => {} });

export function AudioProvider({ children }: { children: React.ReactNode }) {
  const [muted, setMuted] = useState(false);
  const interacted = useRef(false);
  useEffect(() => {
    const onFirst = () => { interacted.current = true; window.removeEventListener("pointerdown", onFirst); };
    window.addEventListener("pointerdown", onFirst, { once: true });
    return () => window.removeEventListener("pointerdown", onFirst);
  }, []);
  const play = (name: "door" | "hover") => {
    if (muted || !interacted.current) return;
    const a = new Audio(name === "door" ? "/audio/placeholder-door-open.mp3" : "/audio/placeholder-hover.mp3");
    a.currentTime = 0; a.play().catch(() => {});
  };
  return <AudioCtx.Provider value={{ play, muted, setMuted }}>{children}</AudioCtx.Provider>;
}
export const useAudio = () => useContext(AudioCtx);
