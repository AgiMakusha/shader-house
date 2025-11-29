"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Crown } from "lucide-react";
import { SubscriptionTier, FeatureFlag, hasFeatureAccess } from "@/lib/subscriptions/types";

interface GameCardProps {
  game: {
    slug: string;
    title: string;
    tagline: string;
    coverUrl: string;
    priceCents: number;
    avgRating: number;
    releaseStatus?: string;
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
}

export function GameCard({ game, userTier }: GameCardProps) {
  const price = game.priceCents === 0 ? 'Free' : `$${(game.priceCents / 100).toFixed(2)}`;
  const isFree = game.priceCents === 0;
  const hasUnlimitedAccess = hasFeatureAccess(userTier, FeatureFlag.UNLIMITED_LIBRARY);
  const showCrown = hasUnlimitedAccess && !isFree; // Show crown for premium users on paid games
  const isBeta = game.releaseStatus === 'BETA';

  return (
    <Link href={`/games/${game.slug}`}>
      <motion.div
        className="group relative overflow-hidden rounded-2xl transition-all duration-300"
        style={{
          background: isBeta
            ? "linear-gradient(135deg, rgba(100, 150, 255, 0.15) 0%, rgba(80, 130, 230, 0.08) 100%)"
            : "linear-gradient(135deg, rgba(100, 200, 100, 0.1) 0%, rgba(80, 180, 80, 0.05) 100%)",
          border: isBeta
            ? "1px solid rgba(150, 180, 255, 0.4)"
            : "1px solid rgba(200, 240, 200, 0.2)",
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.3)",
        }}
        whileHover={{ scale: 1.02, y: -4 }}
        transition={{ duration: 0.2 }}
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
              className="absolute top-3 left-3 px-3 py-1 rounded-lg text-xs font-bold pixelized"
              style={{
                background: "rgba(100, 150, 255, 0.9)",
                border: "1px solid rgba(150, 180, 255, 0.6)",
                color: "rgba(255, 255, 255, 0.95)",
                boxShadow: "0 2px 8px rgba(100, 150, 255, 0.5)",
              }}
            >
              🧪 BETA
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
              <div className="flex items-center">
                {[1, 2, 3, 4, 5].map((star) => (
                  <svg
                    key={star}
                    className="w-4 h-4"
                    fill={star <= Math.round(game.avgRating) ? "currentColor" : "none"}
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    style={{
                      color: star <= Math.round(game.avgRating)
                        ? "rgba(250, 200, 100, 0.9)"
                        : "rgba(200, 240, 200, 0.3)",
                    }}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                    />
                  </svg>
                ))}
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
      </motion.div>
    </Link>
  );
}



