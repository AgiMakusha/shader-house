import { useRef } from "react";
type SoundName = "door" | "hover" | "success" | "error";
export function useSound() {
  const cache = useRef<Partial<Record<SoundName, HTMLAudioElement>>>({});
  const play = (name: SoundName) => {
    if (!cache.current[name]) {
      const src =
        name === "door"
          ? "/audio/placeholder-door-open.mp3"
          : name === "hover"
          ? "/audio/placeholder-hover.mp3"
          : name === "success"
          ? "/audio/placeholder-hover.mp3" // Using hover as placeholder
          : "/audio/placeholder-door-open.mp3"; // Using door as placeholder for error
      cache.current[name] = new Audio(src);
    }
    cache.current[name].currentTime = 0;
    cache.current[name].play().catch(() => {});
  };
  return { play };
}




