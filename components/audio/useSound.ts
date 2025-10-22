import { useRef } from "react";
type SoundName = "door" | "hover";
export function useSound() {
  const cache = useRef<Record<SoundName, HTMLAudioElement>>({});
  const play = (name: SoundName) => {
    if (!cache.current[name]) {
      const src = name === "door" ? "/audio/placeholder-door-open.mp3" : "/audio/placeholder-hover.mp3";
      cache.current[name] = new Audio(src);
    }
    cache.current[name].currentTime = 0;
    cache.current[name].play().catch(() => {});
  };
  return { play };
}
