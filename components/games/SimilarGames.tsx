"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Sparkles, Star } from "lucide-react";
import { GameCard, GameCardContent } from "@/components/game/GameCard";

interface SimilarGame {
  id: string;
  slug: string;
  title: string;
  tagline: string;
  coverUrl: string;
  priceCents: number;
  avgRating: number;
  developer: {
    id: string;
    name: string;
  };
  similarityScore: number;
  matchingTags: number;
  sameDeveloper: boolean;
}

interface SimilarGamesProps {
  gameId: string;
  limit?: number;
}

export function SimilarGames({ gameId, limit = 4 }: SimilarGamesProps) {
  const [games, setGames] = useState<SimilarGame[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const fetchSimilar = async () => {
      try {
        const res = await fetch(`/api/games/${gameId}/similar?limit=${limit}`);
        if (!res.ok) {
          setHasError(true);
          return;
        }
        const data = await res.json();
        setGames(data.similarGames || []);
      } catch (error) {
        console.error("Error fetching similar games:", error);
        setHasError(true);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSimilar();
  }, [gameId, limit]);

  // Don't show anything while loading, on error, or if no similar games
  if (isLoading || hasError || games.length === 0) {
    return null;
  }

  return (
    <GameCard>
      <GameCardContent className="p-6">
        <h3
          className="text-lg font-bold mb-4 pixelized flex items-center gap-2"
          style={{
            textShadow: "0 0 6px rgba(120, 200, 120, 0.5), 1px 1px 0px rgba(0, 0, 0, 0.8)",
            color: "rgba(180, 220, 180, 0.95)",
          }}
        >
          <Sparkles size={18} style={{ color: "rgba(150, 250, 150, 0.9)" }} />
          Similar Games
        </h3>

        <div className="space-y-3">
          {games.map((game) => (
            <Link
              key={game.id}
              href={`/games/${game.slug}`}
              className="flex gap-3 p-2 rounded-lg transition-all hover:scale-[1.02]"
              style={{
                background: "rgba(100, 200, 100, 0.1)",
                border: "1px solid rgba(200, 240, 200, 0.15)",
              }}
            >
              <div className="relative w-16 h-12 rounded overflow-hidden flex-shrink-0">
                <Image
                  src={game.coverUrl}
                  alt={game.title}
                  fill
                  className="object-cover"
                  sizes="64px"
                />
              </div>
              <div className="flex-1 min-w-0">
                <p
                  className="font-semibold text-sm truncate"
                  style={{ color: "rgba(200, 240, 200, 0.95)" }}
                >
                  {game.title}
                </p>
                <p
                  className="text-xs truncate"
                  style={{ color: "rgba(200, 240, 200, 0.6)" }}
                >
                  by {game.developer.name}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <span
                    className="text-xs font-semibold"
                    style={{ color: "rgba(150, 250, 150, 0.9)" }}
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
                      <Star size={10} fill="currentColor" />
                      {game.avgRating.toFixed(1)}
                    </span>
                  )}
                  {game.sameDeveloper && (
                    <span
                      className="text-xs px-1.5 py-0.5 rounded"
                      style={{
                        background: "rgba(100, 150, 250, 0.2)",
                        color: "rgba(150, 200, 250, 0.9)",
                      }}
                    >
                      Same Dev
                    </span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </GameCardContent>
    </GameCard>
  );
}

