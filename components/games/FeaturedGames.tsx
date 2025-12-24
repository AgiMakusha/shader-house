"use client";

import { memo, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Crown, Star, ChevronLeft, ChevronRight } from "lucide-react";

// PERFORMANCE FIX: Memoized to prevent unnecessary re-renders

interface FeaturedGame {
  id: string;
  slug: string;
  title: string;
  tagline: string;
  description: string;
  coverUrl: string;
  screenshots: string[];
  priceCents: number;
  avgRating: number;
  developer: {
    id: string;
    name: string;
  };
  tags: { id: string; name: string; slug: string }[];
}

interface FeaturedGamesProps {
  games?: FeaturedGame[]; // PERFORMANCE FIX: Accept pre-fetched data as prop
}

export const FeaturedGames = memo(function FeaturedGames({ games: propGames }: FeaturedGamesProps = {}) {
  const [games, setGames] = useState<FeaturedGame[]>(propGames || []);
  const [isLoading, setIsLoading] = useState(!propGames);
  const [hasError, setHasError] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    // If data was passed as prop, skip fetching
    if (propGames) {
      setGames(propGames);
      setIsLoading(false);
      return;
    }

    // Otherwise, fetch data (backward compatibility)
    const fetchFeatured = async () => {
      try {
        const res = await fetch("/api/games/featured?limit=5");
        if (!res.ok) {
          // Silently fail - no featured games is fine
          setHasError(true);
          return;
        }
        const data = await res.json();
        setGames(data.featured || []);
      } catch (error) {
        // Silently fail - no featured games is fine
        console.error("Error fetching featured games:", error);
        setHasError(true);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFeatured();
  }, [propGames]);

  useEffect(() => {
    if (games.length <= 1) return;
    
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % games.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [games.length]);

  // Don't show anything if loading, error, or no featured games
  if (isLoading) {
    return null; // Don't show loading skeleton - just hide until ready
  }

  if (hasError || games.length === 0) {
    return null;
  }

  const currentGame = games[currentIndex];

  return (
    <div className="w-full mb-8">
      <h2
        className="text-2xl font-bold mb-6 pixelized flex items-center gap-3"
        style={{
          textShadow: "0 0 12px rgba(250, 200, 100, 0.6), 2px 2px 0px rgba(0, 0, 0, 0.9)",
          color: "rgba(250, 220, 150, 0.95)",
        }}
      >
        <Crown size={24} style={{ color: "rgba(250, 200, 100, 0.9)" }} />
        Featured Games
      </h2>

      <div className="relative">
        <Link
          href={`/games/${currentGame.slug}`}
          className="block relative rounded-2xl overflow-hidden group"
          style={{
            background: "linear-gradient(135deg, rgba(100, 200, 100, 0.15) 0%, rgba(80, 180, 80, 0.1) 100%)",
            border: "2px solid rgba(250, 200, 100, 0.4)",
            boxShadow: "0 0 30px rgba(250, 200, 100, 0.2)",
          }}
        >
          <div className="flex flex-col md:flex-row">
            {/* Cover Image */}
            <div className="relative w-full md:w-1/2 aspect-video md:aspect-auto md:h-80">
              <Image
                src={currentGame.coverUrl}
                alt={currentGame.title}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
                priority
                sizes="(max-width: 768px) 100vw, 50vw"
              />
              <div
                className="absolute top-4 left-4 px-3 py-1.5 rounded-lg flex items-center gap-2"
                style={{
                  background: "linear-gradient(135deg, rgba(250, 200, 100, 0.9) 0%, rgba(250, 150, 50, 0.9) 100%)",
                }}
              >
                <Crown size={16} style={{ color: "#000" }} />
                <span className="font-bold text-sm" style={{ color: "#000" }}>
                  FEATURED
                </span>
              </div>
            </div>

            {/* Info */}
            <div className="flex-1 p-6 md:p-8 flex flex-col justify-center">
              <h3
                className="text-2xl md:text-3xl font-bold mb-2 pixelized"
                style={{
                  textShadow: "0 0 10px rgba(120, 200, 120, 0.5), 2px 2px 0px rgba(0, 0, 0, 0.8)",
                  color: "rgba(180, 220, 180, 0.95)",
                }}
              >
                {currentGame.title}
              </h3>
              <p
                className="text-sm mb-2"
                style={{ color: "rgba(200, 240, 200, 0.6)" }}
              >
                by {currentGame.developer.name}
              </p>
              <p
                className="text-lg mb-4"
                style={{ color: "rgba(200, 240, 200, 0.85)" }}
              >
                {currentGame.tagline}
              </p>
              <p
                className="text-sm mb-4 line-clamp-2"
                style={{ color: "rgba(200, 240, 200, 0.7)" }}
              >
                {currentGame.description}
              </p>

              <div className="flex flex-wrap gap-2 mb-4">
                {currentGame.tags.slice(0, 4).map((tag) => (
                  <span
                    key={tag.id}
                    className="px-2 py-1 rounded text-xs font-semibold"
                    style={{
                      background: "rgba(100, 200, 100, 0.2)",
                      color: "rgba(150, 250, 150, 0.9)",
                      border: "1px solid rgba(200, 240, 200, 0.2)",
                    }}
                  >
                    {tag.name}
                  </span>
                ))}
              </div>

              <div className="flex items-center gap-4">
                <span
                  className="text-2xl font-bold"
                  style={{ color: "rgba(150, 250, 150, 0.95)" }}
                >
                  {currentGame.priceCents === 0
                    ? "Free"
                    : `$${(currentGame.priceCents / 100).toFixed(2)}`}
                </span>
                {currentGame.avgRating > 0 && (
                  <span
                    className="flex items-center gap-1 text-lg"
                    style={{ color: "rgba(250, 200, 100, 0.9)" }}
                  >
                    <Star size={18} fill="currentColor" />
                    {currentGame.avgRating.toFixed(1)}
                  </span>
                )}
              </div>
            </div>
          </div>
        </Link>

        {/* Navigation Arrows */}
        {games.length > 1 && (
          <>
            <button
              onClick={(e) => {
                e.preventDefault();
                setCurrentIndex((prev) => (prev - 1 + games.length) % games.length);
              }}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center transition-all hover:scale-110"
              style={{
                background: "rgba(0, 0, 0, 0.6)",
                border: "1px solid rgba(200, 240, 200, 0.3)",
              }}
            >
              <ChevronLeft size={24} style={{ color: "rgba(200, 240, 200, 0.9)" }} />
            </button>
            <button
              onClick={(e) => {
                e.preventDefault();
                setCurrentIndex((prev) => (prev + 1) % games.length);
              }}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center transition-all hover:scale-110"
              style={{
                background: "rgba(0, 0, 0, 0.6)",
                border: "1px solid rgba(200, 240, 200, 0.3)",
              }}
            >
              <ChevronRight size={24} style={{ color: "rgba(200, 240, 200, 0.9)" }} />
            </button>
          </>
        )}

        {/* Dots */}
        {games.length > 1 && (
          <div className="flex justify-center gap-2 mt-4">
            {games.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className="w-2 h-2 rounded-full transition-all"
                style={{
                  background: index === currentIndex
                    ? "rgba(250, 200, 100, 0.9)"
                    : "rgba(200, 240, 200, 0.3)",
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
});

