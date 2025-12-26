"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { GameCard } from "@/components/games/GameCard";
import Particles from "@/components/fx/Particles";
import { useAudio } from "@/components/audio/AudioProvider";
import { Package, Heart, Search, Gamepad2, ArrowLeft } from "lucide-react";
import { SubscriptionTier } from "@/lib/subscriptions/types";

type LibraryType = "purchased" | "favorites" | "all";

interface Game {
  id: string;
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
  purchasedAt?: string;
  favoritedAt?: string;
  isPurchased?: boolean;
}

export default function LibraryPage() {
  const router = useRouter();
  const { play } = useAudio();
  const [activeTab, setActiveTab] = useState<LibraryType>("all");
  const [purchasedGames, setPurchasedGames] = useState<Game[]>([]);
  const [favoritedGames, setFavoritedGames] = useState<Game[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [userTier, setUserTier] = useState<SubscriptionTier | null>(null);

  useEffect(() => {
    const fetchLibrary = async () => {
      try {
        const response = await fetch("/api/games/library");
        if (!response.ok) {
          if (response.status === 401) {
            router.push("/login");
            return;
          }
          throw new Error("Failed to fetch library");
        }

        const data = await response.json();
        setPurchasedGames(data.purchased || []);
        setFavoritedGames(data.favorites || []);
      } catch (error) {
        console.error("Error fetching library:", error);
      } finally {
        setIsLoading(false);
      }
    };

    const fetchUser = async () => {
      try {
        const response = await fetch("/api/auth/me");
        if (response.ok) {
          const data = await response.json();
          setUserTier(data.user?.subscriptionTier || null);
        }
      } catch (error) {
        console.error("Error fetching user:", error);
      }
    };

    fetchLibrary();
    fetchUser();
  }, [router]);

  const handleTabChange = (tab: LibraryType) => {
    setActiveTab(tab);
    play("hover");
  };

  // Filter games based on active tab and search query
  const getFilteredGames = () => {
    let games: Game[] = [];

    if (activeTab === "purchased") {
      games = purchasedGames;
    } else if (activeTab === "favorites") {
      games = favoritedGames;
    } else {
      // "all" - combine and deduplicate
      const allGamesMap = new Map<string, Game>();
      purchasedGames.forEach((game) => {
        allGamesMap.set(game.id, { ...game, isPurchased: true });
      });
      favoritedGames.forEach((game) => {
        if (!allGamesMap.has(game.id)) {
          allGamesMap.set(game.id, game);
        } else {
          // Merge favorited info into purchased game
          const existing = allGamesMap.get(game.id)!;
          allGamesMap.set(game.id, { ...existing, favoritedAt: game.favoritedAt });
        }
      });
      games = Array.from(allGamesMap.values());
    }

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      games = games.filter(
        (game) =>
          game.title.toLowerCase().includes(query) ||
          game.tagline.toLowerCase().includes(query) ||
          game.developer.name.toLowerCase().includes(query)
      );
    }

    return games;
  };

  const filteredGames = getFilteredGames();
  const hasGames = filteredGames.length > 0;
  const totalPurchased = purchasedGames.length;
  const totalFavorites = favoritedGames.length;

  if (isLoading) {
    return (
      <div className="min-h-dvh relative overflow-hidden flex items-center justify-center">
        <Particles />
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
          <div className="text-xl font-semibold pixelized" style={{ color: "rgba(200, 240, 200, 0.9)" }}>
            Loading your library...
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-dvh relative overflow-hidden">
      <Particles />

      <motion.main
        className="relative z-10 flex min-h-dvh flex-col items-center justify-start p-6 pt-12"
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="w-full max-w-7xl">
          {/* Header */}
          <motion.div
            className="mb-8"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {/* Back Link */}
            <Link
              href="/profile/gamer"
              className="inline-flex items-center gap-2 mb-4 group"
              onMouseEnter={() => play("hover")}
            >
              <ArrowLeft
                className="w-5 h-5 transition-transform group-hover:-translate-x-1"
                style={{ color: "rgba(200, 240, 200, 0.7)" }}
              />
              <span
                className="text-sm font-semibold tracking-wide uppercase pixelized transition-colors"
                style={{
                  color: "rgba(200, 240, 200, 0.7)",
                  textShadow: "1px 1px 0px rgba(0, 0, 0, 0.8)",
                }}
              >
                Back to Gamer Hub
              </span>
            </Link>

            <h1
              className="text-4xl font-bold tracking-wider uppercase pixelized mb-2"
              style={{
                textShadow: `
                  0 0 12px rgba(120, 200, 120, 0.8),
                  0 0 24px rgba(100, 180, 100, 0.6),
                  2px 2px 0px rgba(0, 0, 0, 0.9)
                `,
                color: "rgba(180, 220, 180, 0.95)",
              }}
            >
              My Library
            </h1>
            <p
              className="text-sm font-semibold tracking-wide uppercase pixelized"
              style={{ textShadow: "1px 1px 0px rgba(0, 0, 0, 0.8)", color: "rgba(200, 240, 200, 0.7)" }}
            >
              {totalPurchased} purchased • {totalFavorites} favorites
            </p>
          </motion.div>

          {/* Search Bar */}
          <motion.div
            className="mb-6"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <div className="relative">
              <Search
                className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5"
                style={{ color: "rgba(200, 240, 200, 0.5)" }}
              />
              <input
                type="text"
                placeholder="Search your library..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-xl font-semibold text-sm transition-all"
                style={{
                  background: "rgba(20, 40, 20, 0.6)",
                  border: "1px solid rgba(200, 240, 200, 0.2)",
                  color: "rgba(200, 240, 200, 0.95)",
                  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.3)",
                }}
                onFocus={() => play("hover")}
              />
            </div>
          </motion.div>

          {/* Tabs */}
          <motion.div
            className="flex gap-4 mb-8 border-b"
            style={{ borderColor: "rgba(200, 240, 200, 0.2)" }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            {[
              { id: "all" as LibraryType, label: "All Games", icon: Gamepad2, count: totalPurchased + totalFavorites },
              { id: "purchased" as LibraryType, label: "Purchased", icon: Package, count: totalPurchased },
              { id: "favorites" as LibraryType, label: "Favorites", icon: Heart, count: totalFavorites },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  className="relative px-6 py-3 font-semibold text-sm uppercase tracking-wider transition-all flex items-center gap-2"
                  style={{
                    color: isActive ? "rgba(180, 220, 180, 0.95)" : "rgba(200, 240, 200, 0.6)",
                    textShadow: isActive ? "0 0 6px rgba(120, 200, 120, 0.5)" : "none",
                  }}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                  {tab.count > 0 && (
                    <span
                      className="ml-2 px-2 py-0.5 rounded text-xs"
                      style={{
                        background: isActive
                          ? "rgba(100, 200, 100, 0.3)"
                          : "rgba(100, 200, 100, 0.15)",
                        color: "rgba(200, 240, 200, 0.9)",
                      }}
                    >
                      {tab.count}
                    </span>
                  )}
                  {isActive && (
                    <motion.div
                      className="absolute bottom-0 left-0 right-0 h-0.5"
                      style={{
                        background: "linear-gradient(90deg, rgba(120, 200, 120, 0.8) 0%, rgba(100, 180, 100, 0.6) 100%)",
                        boxShadow: "0 0 8px rgba(120, 200, 120, 0.6)",
                      }}
                      layoutId="activeTab"
                    />
                  )}
                </button>
              );
            })}
          </motion.div>

          {/* Games Grid */}
          {hasGames ? (
            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              {filteredGames.map((game, index) => (
                <motion.div
                  key={game.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.5 + index * 0.05 }}
                >
                  <GameCard game={game} userTier={userTier} referrer="library" />
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div
              className="text-center py-16"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              <div
                className="text-6xl mb-4"
                style={{ color: "rgba(200, 240, 200, 0.3)" }}
              >
                {activeTab === "purchased" ? (
                  <Package className="w-16 h-16 mx-auto" />
                ) : activeTab === "favorites" ? (
                  <Heart className="w-16 h-16 mx-auto" />
                ) : (
                  <Gamepad2 className="w-16 h-16 mx-auto" />
                )}
              </div>
              <h3
                className="text-2xl font-bold mb-2 pixelized"
                style={{
                  color: "rgba(200, 240, 200, 0.8)",
                  textShadow: "0 0 8px rgba(120, 200, 120, 0.4)",
                }}
              >
                {searchQuery
                  ? "No games found"
                  : activeTab === "purchased"
                  ? "No purchased games yet"
                  : activeTab === "favorites"
                  ? "No favorites yet"
                  : "Your library is empty"}
              </h3>
              <p
                className="text-sm mb-6"
                style={{ color: "rgba(200, 240, 200, 0.6)" }}
              >
                {searchQuery
                  ? "Try a different search term"
                  : activeTab === "purchased"
                  ? "Start building your collection by purchasing games"
                  : activeTab === "favorites"
                  ? "Add games to your favorites to see them here"
                  : "Start exploring and add games to your library"}
              </p>
              {!searchQuery && (
                <Link
                  href="/games"
                  className="inline-block px-6 py-3 rounded-xl font-semibold text-sm uppercase tracking-wider transition-all"
                  style={{
                    background: "linear-gradient(135deg, rgba(100, 200, 100, 0.3) 0%, rgba(80, 180, 80, 0.2) 100%)",
                    border: "1px solid rgba(200, 240, 200, 0.3)",
                    color: "rgba(200, 240, 200, 0.95)",
                    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.3)",
                  }}
                  onMouseEnter={() => play("hover")}
                >
                  Browse Games
                </Link>
              )}
            </motion.div>
          )}
        </div>
      </motion.main>
    </div>
  );
}



