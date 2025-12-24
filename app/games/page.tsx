"use client";

export const dynamic = "force-dynamic";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Eye } from "lucide-react";

import Particles from "@/components/fx/Particles";
import { GamesPageHeader } from "@/components/games/GamesPageHeader";
import { GamesContentClient } from "@/components/games/GamesContentClient";
import { FeaturedGames } from "@/components/games/FeaturedGames";
import { TrendingGames } from "@/components/games/TrendingGames";

function GamesPageContent() {
  const searchParams = useSearchParams();
  const [pageData, setPageData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const isMyGames = searchParams.get('developer') === 'me';
  const isViewOnly = searchParams.get('viewOnly') === 'true';

  useEffect(() => {
    const fetchGames = async () => {
      setIsLoading(true);
      try {
        // Build query string from searchParams
        const params = new URLSearchParams();
        searchParams.forEach((value, key) => {
          params.append(key, value);
        });

        // PERFORMANCE FIX: Use combined endpoint for all page data in one request
        const response = await fetch(`/api/games/page-data?${params.toString()}`);
        if (!response.ok) {
          throw new Error('Failed to fetch games');
        }
        const data = await response.json();
        setPageData(data);
      } catch (error) {
        console.error('Error fetching games:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchGames();
  }, [searchParams]);

  return (
    <>
      {/* Header */}
      <GamesPageHeader isMyGames={isMyGames} />

      {/* View-Only Banner */}
      {isViewOnly && (
        <div className="w-full max-w-6xl mb-6">
          <div
            className="px-6 py-4 rounded-lg border"
            style={{
              background: "linear-gradient(135deg, rgba(250, 200, 100, 0.2) 0%, rgba(230, 180, 80, 0.15) 100%)",
              borderColor: "rgba(250, 200, 100, 0.4)",
            }}
          >
            <p
              className="text-sm font-semibold text-center pixelized flex items-center justify-center gap-2"
              style={{
                color: "rgba(250, 220, 140, 0.95)",
                textShadow: "0 0 6px rgba(250, 200, 100, 0.5), 1px 1px 0px rgba(0, 0, 0, 0.8)",
              }}
            >
              <Eye size={16} style={{ color: "rgba(250, 220, 140, 0.95)" }} />
              VIEW ONLY MODE - You can browse games and participate in discussions
            </p>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="w-full max-w-6xl text-center py-12">
          <p
            className="text-lg font-semibold pixelized"
            style={{ color: "rgba(200, 240, 200, 0.9)" }}
          >
            Loading games...
          </p>
        </div>
      ) : pageData ? (
        <>
          {/* Featured & Trending - Only show on main games page without search/filters */}
          {!isMyGames && !searchParams.get('q') && !searchParams.get('tags') && (
            <div className="w-full max-w-6xl mb-8">
              {/* Featured Games Carousel - Pass data from combined endpoint */}
              {pageData.featured && pageData.featured.length > 0 && (
                <FeaturedGames games={pageData.featured} />
              )}

              {/* Trending Games Sidebar - Pass data from combined endpoint */}
              {pageData.trending && pageData.trending.length > 0 && (
                <div className="hidden lg:block mt-8">
                  <TrendingGames games={pageData.trending} />
                </div>
              )}
            </div>
          )}

          <GamesContentClient
            games={pageData.items}
            allTags={pageData.tags || []}
            total={pageData.total}
            page={pageData.page}
            totalPages={pageData.totalPages}
            activeTags={searchParams.get('tags')?.split(',').filter(Boolean) || []}
            viewOnly={isViewOnly}
            isMyGames={isMyGames}
          />
        </>
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
    </>
  );
}

export default function GamesPage() {
  return (
    <div className="min-h-dvh relative overflow-hidden">
      <Particles />

      <main className="relative z-10 flex min-h-dvh flex-col items-center justify-start p-6 pt-12">
        <Suspense fallback={
          <div className="w-full max-w-6xl text-center py-12">
            <p className="text-lg font-semibold pixelized" style={{ color: "rgba(200, 240, 200, 0.9)" }}>
              Loading...
            </p>
          </div>
        }>
          <GamesPageContent />
        </Suspense>
      </main>
    </div>
  );
}
