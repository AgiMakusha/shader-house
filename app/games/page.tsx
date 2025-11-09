"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

import Particles from "@/components/fx/Particles";
import { GamesPageHeader } from "@/components/games/GamesPageHeader";
import { GamesContentClient } from "@/components/games/GamesContentClient";

export default function GamesPage() {
  const searchParams = useSearchParams();
  const [gamesData, setGamesData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const isMyGames = searchParams.get('developer') === 'me';

  useEffect(() => {
    const fetchGames = async () => {
      setIsLoading(true);
      try {
        // Build query string from searchParams
        const params = new URLSearchParams();
        searchParams.forEach((value, key) => {
          params.append(key, value);
        });

        const response = await fetch(`/api/games?${params.toString()}`);
        if (!response.ok) {
          throw new Error('Failed to fetch games');
        }
        const data = await response.json();
        setGamesData(data);
      } catch (error) {
        console.error('Error fetching games:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchGames();
  }, [searchParams]);

  return (
    <div className="min-h-dvh relative overflow-hidden">
      <Particles />

      <main className="relative z-10 flex min-h-dvh flex-col items-center justify-start p-6 pt-12">
        {/* Header */}
        <GamesPageHeader isMyGames={isMyGames} />

        {isLoading ? (
          <div className="w-full max-w-6xl text-center py-12">
            <p
              className="text-lg font-semibold pixelized"
              style={{ color: "rgba(200, 240, 200, 0.9)" }}
            >
              Loading games...
            </p>
          </div>
        ) : gamesData ? (
          <GamesContentClient
            games={gamesData.items}
            allTags={gamesData.tags || []}
            total={gamesData.total}
            page={gamesData.page}
            totalPages={gamesData.totalPages}
            activeTags={searchParams.get('tags')?.split(',').filter(Boolean) || []}
          />
        ) : (
          <div className="w-full max-w-6xl text-center py-12">
            <p
              className="text-lg font-semibold pixelized"
              style={{ color: "rgba(250, 100, 100, 0.9)" }}
            >
              Failed to load games
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
