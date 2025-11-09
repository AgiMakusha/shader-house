"use client";

import Link from "next/link";
import { GameCard, GameCardContent } from "@/components/game/GameCard";

interface Tag {
  slug: string;
  name: string;
}

interface TagsListProps {
  tags: Tag[];
  activeTags?: string[];
}

export function TagsList({ tags, activeTags = [] }: TagsListProps) {
  if (tags.length === 0) return null;

  return (
    <div className="w-full max-w-6xl mb-8">
      <GameCard>
        <GameCardContent className="p-6">
          <h3
            className="text-lg font-bold mb-4 pixelized"
            style={{
              color: "rgba(200, 240, 200, 0.9)",
              textShadow: "0 0 6px rgba(120, 200, 120, 0.5), 1px 1px 0px rgba(0, 0, 0, 0.8)",
            }}
          >
            Browse by Tag
          </h3>
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => {
              const isActive = activeTags.includes(tag.slug);
              return (
                <Link
                  key={tag.slug}
                  href={`/games?tags=${tag.slug}`}
                  className="px-3 py-1.5 rounded-lg text-sm font-semibold transition-all"
                  style={{
                    background: isActive
                      ? "rgba(100, 200, 100, 0.4)"
                      : "rgba(100, 200, 100, 0.15)",
                    border: `1px solid ${isActive ? "rgba(200, 240, 200, 0.5)" : "rgba(200, 240, 200, 0.2)"}`,
                    color: "rgba(200, 240, 200, 0.9)",
                    boxShadow: isActive ? "0 0 8px rgba(100, 200, 100, 0.3)" : "none",
                  }}
                >
                  {tag.name}
                </Link>
              );
            })}
          </div>
        </GameCardContent>
      </GameCard>
    </div>
  );
}

