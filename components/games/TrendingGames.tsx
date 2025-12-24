"use client";

import { memo, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { TrendingUp, Star, Crown, Flame } from "lucide-react";

// PERFORMANCE FIX: Memoized to prevent unnecessary re-renders

interface TrendingGame {
  rank: number;
  id: string;
  slug: string;
  title: string;
  tagline: string;
  coverUrl: string;
  priceCents: number;
  avgRating: number;
  isFeatured: boolean;
  developer: {
    id: string;
    name: string;
  };
  trendingScore: number;
}

interface TrendingGamesProps {
  games?: TrendingGame[]; // PERFORMANCE FIX: Accept pre-fetched data as prop
  limit?: number;
  showTitle?: boolean;
}

export const TrendingGames = memo(function TrendingGames({ games: propGames, limit = 5, showTitle = true }: TrendingGamesProps) {
  const [games, setGames] = useState<TrendingGame[]>(propGames || []);
  const [isLoading, setIsLoading] = useState(!propGames);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    // If data was passed as prop, skip fetching
    if (propGames) {
      setGames(propGames);
      setIsLoading(false);
      return;
    }

    // Otherwise, fetch data (backward compatibility)
    const fetchTrending = async () => {
      try {
        const res = await fetch(`/api/games/trending?limit=${limit}`);
        if (!res.ok) {
          setHasError(true);
          return;
        }
        const data = await res.json();
        setGames(data.trending || []);
      } catch (error) {
        console.error("Error fetching trending games:", error);
        setHasError(true);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTrending();
  }, [propGames, limit]);

  // Don't show anything if loading, error, or no games
  if (isLoading || hasError || games.length === 0) {
    return null;
  }

  return (
    <div className="w-full">
      {showTitle && (
        <h2
          className="text-2xl font-bold mb-6 pixelized flex items-center gap-3"
          style={{
            textShadow: "0 0 12px rgba(250, 150, 100, 0.6), 2px 2px 0px rgba(0, 0, 0, 0.9)",
            color: "rgba(250, 200, 150, 0.95)",
          }}
        >
          <Flame size={24} style={{ color: "rgba(250, 150, 100, 0.9)" }} />
          Trending Now
        </h2>
      )}

      <div className="space-y-3">
        {games.map((game) => (
          <Link
            key={game.id}
            href={`/games/${game.slug}`}
            className="flex gap-4 p-3 rounded-xl transition-all hover:scale-[1.02] group"
            style={{
              background: "linear-gradient(135deg, rgba(100, 200, 100, 0.12) 0%, rgba(80, 180, 80, 0.08) 100%)",
              border: "1px solid rgba(200, 240, 200, 0.2)",
            }}
          >
            {/* Rank */}
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-lg flex-shrink-0"
              style={{
                background: game.rank <= 3 
                  ? "linear-gradient(135deg, rgba(250, 200, 100, 0.3) 0%, rgba(250, 150, 50, 0.2) 100%)"
                  : "rgba(100, 200, 100, 0.15)",
                color: game.rank <= 3 
                  ? "rgba(250, 200, 100, 0.95)" 
                  : "rgba(200, 240, 200, 0.7)",
                textShadow: game.rank <= 3 
                  ? "0 0 8px rgba(250, 200, 100, 0.5)" 
                  : "none",
              }}
            >
              {game.rank}
            </div>

            {/* Cover */}
            <div className="relative w-20 h-14 rounded-lg overflow-hidden flex-shrink-0">
              <Image
                src={game.coverUrl}
                alt={game.title}
                fill
                className="object-cover group-hover:scale-105 transition-transform"
                sizes="80px"
              />
              {game.isFeatured && (
                <div
                  className="absolute top-1 right-1 w-5 h-5 rounded flex items-center justify-center"
                  style={{ background: "rgba(250, 200, 100, 0.9)" }}
                >
                  <Crown size={12} style={{ color: "#000" }} />
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <p
                className="font-bold text-sm truncate"
                style={{ color: "rgba(200, 240, 200, 0.95)" }}
              >
                {game.title}
              </p>
              <p
                className="text-xs truncate"
                style={{ color: "rgba(200, 240, 200, 0.6)" }}
              >
                {game.tagline}
              </p>
              <div className="flex items-center gap-3 mt-1">
                <span
                  className="text-sm font-bold"
                  style={{ color: "rgba(150, 250, 150, 0.95)" }}
                >
                  {game.priceCents === 0
                    ? "Free"
                    : `$${(game.priceCents / 100).toFixed(2)}`}
                </span>
                {game.avgRating > 0 && (
                  <span
                    className="flex items-center gap-1 text-xs"
                    style={{ color: "rgba(250, 200, 100, 0.9)" }}
                  >
                    <Star size={12} fill="currentColor" />
                    {game.avgRating.toFixed(1)}
                  </span>
                )}
                <span
                  className="flex items-center gap-1 text-xs"
                  style={{ color: "rgba(250, 150, 100, 0.8)" }}
                >
                  <TrendingUp size={12} />
                  {Math.round(game.trendingScore)}
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
});

