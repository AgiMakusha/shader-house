"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useAudio } from "@/components/audio/AudioProvider";

interface FavoriteButtonProps {
  gameId: string;
  initialFavorited: boolean;
  initialCount: number;
}

export function FavoriteButton({ gameId, initialFavorited, initialCount }: FavoriteButtonProps) {
  const { play } = useAudio();
  const [isFavorited, setIsFavorited] = useState(initialFavorited);
  const [favCount, setFavCount] = useState(initialCount);
  const [isLoading, setIsLoading] = useState(false);

  const handleToggle = async () => {
    if (isLoading) return;

    setIsLoading(true);
    play("activate");

    try {
      const response = await fetch(`/api/games/${gameId}/favorite`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to toggle favorite');
      }

      const data = await response.json();
      setIsFavorited(data.favorited);
      setFavCount(data.favCount);
      play("success");
    } catch (error) {
      console.error('Error toggling favorite:', error);
      play("error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.button
      onClick={handleToggle}
      disabled={isLoading}
      className="w-full px-6 py-3 rounded-lg font-semibold uppercase tracking-wider transition-all flex items-center justify-center gap-2 disabled:opacity-50"
      style={{
        background: isFavorited
          ? "linear-gradient(135deg, rgba(250, 100, 100, 0.3) 0%, rgba(230, 80, 80, 0.2) 100%)"
          : "linear-gradient(135deg, rgba(100, 200, 100, 0.2) 0%, rgba(80, 180, 80, 0.1) 100%)",
        border: `1px solid ${isFavorited ? "rgba(250, 200, 200, 0.3)" : "rgba(200, 240, 200, 0.3)"}`,
        color: "rgba(200, 240, 200, 0.95)",
      }}
      whileHover={!isLoading ? { scale: 1.02 } : {}}
      whileTap={!isLoading ? { scale: 0.98 } : {}}
    >
      <svg
        className="w-5 h-5"
        fill={isFavorited ? "currentColor" : "none"}
        stroke="currentColor"
        viewBox="0 0 24 24"
        style={{ color: isFavorited ? "rgba(250, 100, 100, 0.9)" : "rgba(200, 240, 200, 0.7)" }}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
        />
      </svg>
      {isFavorited ? 'Favorited' : 'Add to Favorites'} ({favCount})
    </motion.button>
  );
}



