"use client";

import { memo } from "react";
import Image from "next/image";
import Link from "next/link";
import { Crown, FlaskConical } from "lucide-react";
import { SubscriptionTier, FeatureFlag, hasFeatureAccess } from "@/lib/subscriptions/types";

// PERFORMANCE FIX: Removed Framer Motion, using CSS animations instead
// PERFORMANCE FIX: Memoized component to prevent unnecessary re-renders

interface GameCardProps {
  game: {
    slug: string;
    title: string;
    tagline: string;
    coverUrl: string;
    priceCents: number;
    avgRating: number;
    releaseStatus?: string;
    createdAt?: string | Date;
    developer: {
      name: string;
    };
    gameTags: Array<{
      tag: {
        name: string;
        slug: string;
      };
    }>;
    _count?: {
      ratings: number;
    };
  };
  userTier?: SubscriptionTier | null;
  viewOnly?: boolean;
}

export const GameCard = memo(function GameCard({ game, userTier, viewOnly = false }: GameCardProps) {
  const price = game.priceCents === 0 ? 'Free' : `$${(game.priceCents / 100).toFixed(2)}`;
  const isFree = game.priceCents === 0;
  const hasUnlimitedAccess = hasFeatureAccess(userTier, FeatureFlag.UNLIMITED_LIBRARY);
  const showCrown = hasUnlimitedAccess && !isFree; // Show crown for premium users on paid games
  const isBeta = game.releaseStatus === 'BETA';

  const gameUrl = viewOnly ? `/games/${game.slug}?viewOnly=true` : `/games/${game.slug}`;

  return (
    <Link href={gameUrl}>
      <div
        className="group relative overflow-hidden rounded-2xl card-interactive"
        style={{
          background: isBeta
            ? "linear-gradient(135deg, rgba(100, 150, 255, 0.15) 0%, rgba(80, 130, 230, 0.08) 100%)"
            : "linear-gradient(135deg, rgba(100, 200, 100, 0.1) 0%, rgba(80, 180, 80, 0.05) 100%)",
          border: isBeta
            ? "1px solid rgba(150, 180, 255, 0.4)"
            : "1px solid rgba(200, 240, 200, 0.2)",
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.3)",
        }}
      >
        {/* Cover Image */}
        <div className="relative aspect-video w-full overflow-hidden">
          <Image
            src={game.coverUrl}
            alt={game.title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-110"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          
          {/* Beta Badge */}
          {isBeta && (
            <div
              className="absolute top-3 left-3 px-3 py-1 rounded-lg text-xs font-bold pixelized flex items-center gap-1.5"
              style={{
                background: "rgba(100, 150, 255, 0.9)",
                border: "1px solid rgba(150, 180, 255, 0.6)",
                color: "rgba(255, 255, 255, 0.95)",
                boxShadow: "0 2px 8px rgba(100, 150, 255, 0.5)",
              }}
            >
              <FlaskConical className="w-3 h-3" />
              BETA
            </div>
          )}
          
          {/* Price Badge */}
          <div
            className="absolute top-3 right-3 px-3 py-1 rounded-lg font-bold text-sm pixelized flex items-center gap-1.5"
            style={{
              background: showCrown
                ? "linear-gradient(135deg, rgba(240, 220, 140, 0.95) 0%, rgba(220, 180, 100, 0.95) 100%)"
                : isFree
                ? "linear-gradient(135deg, rgba(100, 200, 100, 0.9) 0%, rgba(80, 180, 80, 0.9) 100%)"
                : "linear-gradient(135deg, rgba(120, 150, 120, 0.9) 0%, rgba(100, 130, 100, 0.9) 100%)",
              color: showCrown ? "rgba(40, 30, 10, 0.95)" : "rgba(255, 255, 255, 0.95)",
              boxShadow: showCrown 
                ? "0 2px 12px rgba(240, 220, 140, 0.5), 0 0 20px rgba(240, 220, 140, 0.3)" 
                : "0 2px 8px rgba(0, 0, 0, 0.4)",
              border: showCrown ? "1px solid rgba(240, 220, 140, 0.6)" : "none",
              fontSize: "9px",
              textShadow: showCrown ? "none" : "0 1px 2px rgba(0, 0, 0, 0.5)",
            }}
          >
            {showCrown && (
              <Crown 
                size={12} 
                fill="rgba(40, 30, 10, 0.6)"
                style={{ 
                  color: "rgba(40, 30, 10, 0.9)",
                  filter: "drop-shadow(0 0 2px rgba(255, 240, 180, 0.8))"
                }} 
              />
            )}
            {showCrown ? 'Included' : price}
          </div>
        </div>

        {/* Content */}
        <div className="p-4 space-y-3">
          {/* Title */}
          <h3
            className="text-lg font-bold line-clamp-1 pixelized"
            style={{
              color: "rgba(200, 240, 200, 0.95)",
              textShadow: "0 0 6px rgba(120, 200, 120, 0.5), 1px 1px 0px rgba(0, 0, 0, 0.8)",
            }}
          >
            {game.title}
          </h3>

          {/* Tagline */}
          <p
            className="text-sm line-clamp-2"
            style={{ color: "rgba(200, 240, 200, 0.7)" }}
          >
            {game.tagline}
          </p>

          {/* Developer */}
          <p
            className="text-xs"
            style={{ color: "rgba(200, 240, 200, 0.6)" }}
          >
            by {game.developer.name}
          </p>

          {/* Release Date */}
          {game.createdAt && (
            <p
              className="text-xs"
              style={{ color: "rgba(200, 240, 200, 0.5)" }}
            >
              Released: {new Date(game.createdAt).toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'short', 
                day: 'numeric' 
              })}
            </p>
          )}

          {/* Tags */}
          <div className="flex flex-wrap gap-2">
            {game.gameTags.slice(0, 3).map(({ tag }) => (
              <span
                key={tag.slug}
                className="text-xs px-2 py-1 rounded"
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

          {/* Rating */}
          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map((star) => {
                  const fillPercentage = Math.min(Math.max(game.avgRating - (star - 1), 0), 1) * 100;
                  const isActive = fillPercentage > 0;
                  return (
                    <div 
                      key={star} 
                      className="relative w-4 h-4"
                      style={{
                        filter: isActive 
                          ? "drop-shadow(0 0 4px rgba(250, 220, 100, 0.6)) drop-shadow(0 0 2px rgba(250, 220, 100, 0.4))"
                          : "none"
                      }}
                    >
                      {/* Empty star (transparent) */}
                      <svg
                        className="absolute inset-0 w-4 h-4"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="rgba(200, 240, 200, 0.3)"
                        strokeWidth="1.5"
                      >
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                      </svg>
                      {/* Filled star (gradient based on rating) */}
                      <svg
                        className="absolute inset-0 w-4 h-4"
                        viewBox="0 0 24 24"
                        style={{
                          clipPath: `inset(0 ${100 - fillPercentage}% 0 0)`,
                        }}
                      >
                        <path
                          d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
                          fill="rgba(250, 220, 100, 0.95)"
                          stroke="rgba(250, 220, 100, 0.95)"
                          strokeWidth="1.5"
                        />
                      </svg>
                    </div>
                  );
                })}
              </div>
              <span
                className="text-sm font-semibold"
                style={{ color: "rgba(200, 240, 200, 0.8)" }}
              >
                {game.avgRating > 0 ? game.avgRating.toFixed(1) : 'N/A'}
              </span>
            </div>
            {game._count && game._count.ratings > 0 && (
              <span
                className="text-xs"
                style={{ color: "rgba(200, 240, 200, 0.6)" }}
              >
                ({game._count.ratings} {game._count.ratings === 1 ? 'review' : 'reviews'})
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
});



