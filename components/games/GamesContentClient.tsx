"use client";

import { useState, useEffect } from "react";
import { GameCard } from "@/components/games/GameCard";
import { SearchInput } from "@/components/games/SearchInput";
import { GameFilters } from "@/components/games/GameFilters";
import { Pagination } from "@/components/games/Pagination";
import { TagsList } from "@/components/games/TagsList";
import { GameCard as GameCardComponent, GameCardContent } from "@/components/game/GameCard";
import { SubscriptionTier } from "@/lib/subscriptions/types";

interface GamesContentClientProps {
  games: any[];
  allTags: any[];
  total: number;
  page: number;
  totalPages: number;
  activeTags: string[];
  viewOnly?: boolean;
  isMyGames?: boolean;
}

export function GamesContentClient({
  games,
  allTags,
  total,
  page,
  totalPages,
  activeTags,
  viewOnly = false,
  isMyGames = false,
}: GamesContentClientProps) {
  const [userTier, setUserTier] = useState<SubscriptionTier | null>(null);

  useEffect(() => {
    const fetchUserTier = async () => {
      try {
        const response = await fetch("/api/auth/me");
        if (response.ok) {
          const data = await response.json();
          setUserTier(data.user?.subscriptionTier || 'FREE');
        }
      } catch (error) {
        console.error("Error fetching user tier:", error);
      }
    };

    fetchUserTier();
  }, []);

  return (
    <>
      {/* Search and Filters */}
      <div className="w-full max-w-6xl mb-8 space-y-6">
        <SearchInput />
        <GameFilters />
      </div>

      {/* Tags - Hide on My Games page */}
      {!isMyGames && <TagsList tags={allTags} activeTags={activeTags} />}

      {/* Results Count */}
      <div className="w-full max-w-6xl mb-6">
        <p className="text-sm" style={{ color: "rgba(200, 240, 200, 0.7)" }}>
          {total === 0 ? 'No games found' : `${total} ${total === 1 ? 'game' : 'games'} found`}
        </p>
      </div>

      {/* Games Grid */}
      {games.length > 0 ? (
        <>
          <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {games.map((game) => (
              <GameCard key={game.id} game={game} userTier={userTier} viewOnly={viewOnly} />
            ))}
          </div>

          {/* Pagination */}
          <div className="w-full max-w-6xl">
            <Pagination currentPage={page} totalPages={totalPages} />
          </div>
        </>
      ) : (
        <div className="w-full max-w-6xl">
          <GameCardComponent>
            <GameCardContent className="p-12 text-center">
              <p className="text-lg font-semibold mb-2" style={{ color: "rgba(200, 240, 200, 0.7)" }}>
                No games found matching your criteria
              </p>
              <p className="text-sm" style={{ color: "rgba(200, 240, 200, 0.5)" }}>
                Try adjusting your search or filters
              </p>
            </GameCardContent>
          </GameCardComponent>
        </div>
      )}
    </>
  );
}



