"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { Star, Heart, ShoppingCart } from "lucide-react";

import Particles from "@/components/fx/Particles";
import { GameCard, GameCardContent } from "@/components/game/GameCard";
import { useAudio } from "@/components/audio/AudioProvider";

export default function AnalyticsPage() {
  const router = useRouter();
  const { play } = useAudio();
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("30d");
  const [games, setGames] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalGames: 0,
    totalRatings: 0,
    totalFavorites: 0,
    totalRevenue: 0,
    avgRating: 0,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [userResponse, gamesResponse] = await Promise.all([
          fetch("/api/auth/me"),
          fetch("/api/games?developer=me"),
        ]);

        if (!userResponse.ok) {
          router.push("/login");
          return;
        }

        const userData = await userResponse.json();
        setUser(userData.user);

        if (gamesResponse.ok) {
          const gamesData = await gamesResponse.json();
          setGames(gamesData.items || []);

          // Calculate stats from games
          const totalGames = gamesData.items?.length || 0;
          const totalRatings = gamesData.items?.reduce((sum: number, game: any) => sum + (game._count?.ratings || 0), 0) || 0;
          const totalFavorites = gamesData.items?.reduce((sum: number, game: any) => sum + (game._count?.favorites || 0), 0) || 0;
          const totalRevenue = gamesData.items?.reduce((sum: number, game: any) => sum + ((game._count?.purchases || 0) * (game.priceCents || 0)), 0) || 0;
          const avgRating = gamesData.items?.reduce((sum: number, game: any) => sum + (game.avgRating || 0), 0) / (totalGames || 1);

          setStats({
            totalGames,
            totalRatings,
            totalFavorites,
            totalRevenue: totalRevenue / 100, // Convert cents to dollars
            avgRating: Math.round(avgRating * 10) / 10,
          });
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        router.push("/login");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [router]);

  if (isLoading) {
    return (
      <div className="min-h-dvh relative overflow-hidden flex items-center justify-center">
        <Particles />
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <div className="text-xl font-semibold pixelized" style={{ color: 'rgba(200, 240, 200, 0.9)' }}>
            Loading...
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
        <motion.div
          className="w-full max-w-5xl mb-8 flex items-center justify-between gap-4"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div>
            <p className="text-xs uppercase tracking-[0.3em] pixelized" style={{ color: "rgba(200, 240, 200, 0.6)" }}>
              Performance Insights
            </p>
            <h1
              className="text-4xl font-bold tracking-wider uppercase pixelized"
              style={{
                textShadow: `
                  0 0 12px rgba(120, 200, 120, 0.8),
                  0 0 24px rgba(100, 180, 100, 0.6),
                  2px 2px 0px rgba(0, 0, 0, 0.9)
                `,
                color: "rgba(180, 220, 180, 0.95)",
              }}
            >
              Analytics
            </h1>
            <p
              className="mt-2 text-sm pixelized"
              style={{ color: "rgba(200, 240, 200, 0.65)", textShadow: "1px 1px 0px rgba(0, 0, 0, 0.8)" }}
            >
              Track your game performance and audience engagement
            </p>
          </div>

          <Link
            href="/profile/developer"
            className="text-xs font-semibold uppercase tracking-[0.2em] hover:underline transition-all"
            style={{ color: "rgba(200, 240, 200, 0.75)" }}
          >
            ← Back to Profile
          </Link>
        </motion.div>

        {/* Time Range Selector */}
        <motion.div
          className="w-full max-w-5xl mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.25 }}
        >
          <div className="flex gap-2">
            {[
              { value: "7d", label: "7 Days" },
              { value: "30d", label: "30 Days" },
              { value: "90d", label: "90 Days" },
              { value: "1y", label: "1 Year" },
            ].map((range) => (
              <button
                key={range.value}
                onClick={() => {
                  setTimeRange(range.value);
                  play("click");
                }}
                className="px-4 py-2 rounded-lg font-semibold text-sm uppercase tracking-wider transition-all"
                style={{
                  background: timeRange === range.value
                    ? "linear-gradient(135deg, rgba(100, 200, 100, 0.35) 0%, rgba(80, 180, 80, 0.2) 100%)"
                    : "rgba(100, 180, 100, 0.1)",
                  border: `1px solid ${timeRange === range.value ? "rgba(200, 240, 200, 0.4)" : "rgba(200, 240, 200, 0.2)"}`,
                  color: "rgba(200, 240, 200, 0.9)",
                }}
              >
                {range.label}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          className="w-full max-w-5xl mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            {[
              { label: "Published Games", value: stats.totalGames.toString(), type: "number" },
              { label: "Total Ratings", value: stats.totalRatings.toString(), type: "number" },
              { label: "Total Favorites", value: stats.totalFavorites.toString(), type: "number" },
              { label: "Avg Rating", value: stats.avgRating, type: "rating" },
              { label: "Revenue", value: `$${stats.totalRevenue.toFixed(2)}`, type: "number" },
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.35 + index * 0.05 }}
              >
                <GameCard>
                  <GameCardContent className="p-6">
                    <p className="text-sm font-medium mb-2" style={{ color: "rgba(200, 240, 200, 0.6)" }}>
                      {stat.label}
                    </p>
                    {stat.type === "rating" ? (
                      <div>
                        <p
                          className="text-3xl font-bold mb-2 pixelized"
                          style={{ textShadow: "0 0 8px rgba(120, 200, 120, 0.5), 1px 1px 0px rgba(0, 0, 0, 0.8)", color: "rgba(150, 250, 150, 0.95)" }}
                        >
                          {typeof stat.value === 'number' && stat.value > 0 ? stat.value.toFixed(1) : "N/A"}
                        </p>
                        {typeof stat.value === 'number' && stat.value > 0 && (
                          <div className="flex gap-1">
                            {[1, 2, 3, 4, 5].map((star) => {
                              const fillPercentage = Math.min(Math.max((stat.value as number) - (star - 1), 0), 1) * 100;
                              const isActive = fillPercentage > 0;
                              return (
                                <div 
                                  key={star} 
                                  className="relative w-5 h-5"
                                  style={{
                                    filter: isActive 
                                      ? "drop-shadow(0 0 6px rgba(250, 220, 100, 0.6)) drop-shadow(0 0 3px rgba(250, 220, 100, 0.4))"
                                      : "none"
                                  }}
                                >
                                  {/* Empty star (transparent) */}
                                  <svg
                                    className="absolute inset-0 w-5 h-5"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="rgba(200, 240, 200, 0.3)"
                                    strokeWidth="1.5"
                                  >
                                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                                  </svg>
                                  {/* Filled star (gradient based on rating) */}
                                  <svg
                                    className="absolute inset-0 w-5 h-5"
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
                        )}
                      </div>
                    ) : (
                      <p
                        className="text-3xl font-bold mb-1 pixelized"
                        style={{ textShadow: "0 0 8px rgba(120, 200, 120, 0.5), 1px 1px 0px rgba(0, 0, 0, 0.8)", color: "rgba(150, 250, 150, 0.95)" }}
                      >
                        {stat.value}
                      </p>
                    )}
                  </GameCardContent>
                </GameCard>
              </motion.div>
            ))}
          </div>
        </motion.div>


        {/* Top Games */}
        <motion.div
          className="w-full max-w-5xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.7 }}
        >
          <GameCard>
            <GameCardContent className="p-8">
              <div className="flex items-center justify-between mb-6">
                <h2
                  className="text-2xl font-bold pixelized"
                  style={{ textShadow: "0 0 8px rgba(120, 200, 120, 0.6), 1px 1px 0px rgba(0, 0, 0, 0.8)", color: "rgba(180, 220, 180, 0.95)" }}
                >
                  Your Published Games
                </h2>
                <Link
                  href="/games?developer=me"
                  className="text-sm font-semibold uppercase tracking-wider hover:underline transition-all"
                  style={{ color: "rgba(200, 240, 200, 0.75)" }}
                >
                  View All →
                </Link>
              </div>
              {games.length === 0 ? (
                <div className="text-center py-8">
                  <p
                    className="text-base pixelized mb-4"
                    style={{ color: "rgba(200, 240, 200, 0.6)" }}
                  >
                    No games published yet
                  </p>
                  <Link
                    href="/dashboard/games/new"
                    className="inline-block px-6 py-3 rounded-lg font-semibold text-sm uppercase tracking-wider transition-all hover:scale-105"
                    style={{
                      background: "linear-gradient(135deg, rgba(100, 200, 100, 0.3) 0%, rgba(80, 180, 80, 0.2) 100%)",
                      border: "1px solid rgba(200, 240, 200, 0.4)",
                      color: "rgba(200, 240, 200, 0.9)",
                    }}
                  >
                    Publish Your First Game
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {games.slice(0, 5).map((game: any) => (
                    <Link
                      key={game.id}
                      href={`/games/${game.slug}`}
                      className="block p-4 rounded-lg transition-all hover:scale-[1.02]"
                      style={{
                        background: "linear-gradient(135deg, rgba(100, 200, 100, 0.1) 0%, rgba(80, 180, 80, 0.05) 100%)",
                        border: "1px solid rgba(200, 240, 200, 0.2)",
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h3
                            className="text-lg font-bold mb-1"
                            style={{ color: "rgba(200, 240, 200, 0.9)" }}
                          >
                            {game.title}
                          </h3>
                          <p
                            className="text-sm mb-2"
                            style={{ color: "rgba(200, 240, 200, 0.6)" }}
                          >
                            {game.tagline}
                          </p>
                          <div className="flex items-center gap-4 text-xs">
                            <span 
                              className="flex items-center gap-1" 
                              style={{ color: "rgba(200, 240, 200, 0.7)" }}
                            >
                              <Star 
                                size={14} 
                                fill="rgba(250, 220, 100, 0.8)"
                                style={{ 
                                  color: "rgba(250, 220, 100, 0.9)",
                                  filter: "drop-shadow(0 0 4px rgba(250, 220, 100, 0.5))"
                                }} 
                              />
                              {game.avgRating?.toFixed(1) || "N/A"} ({game._count?.ratings || 0} ratings)
                            </span>
                            <span 
                              className="flex items-center gap-1" 
                              style={{ color: "rgba(200, 240, 200, 0.7)" }}
                            >
                              <Heart 
                                size={14} 
                                fill="rgba(250, 150, 150, 0.7)"
                                style={{ 
                                  color: "rgba(250, 150, 150, 0.9)",
                                  filter: "drop-shadow(0 0 4px rgba(250, 150, 150, 0.5))"
                                }} 
                              />
                              {game._count?.favorites || 0} favorites
                            </span>
                            <span 
                              className="flex items-center gap-1" 
                              style={{ color: "rgba(200, 240, 200, 0.7)" }}
                            >
                              <ShoppingCart 
                                size={14} 
                                style={{ 
                                  color: "rgba(150, 250, 150, 0.9)",
                                  filter: "drop-shadow(0 0 4px rgba(150, 250, 150, 0.5))"
                                }} 
                              />
                              {game._count?.purchases || 0} purchases
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p
                            className="text-xl font-bold pixelized"
                            style={{ color: "rgba(150, 250, 150, 0.9)" }}
                          >
                            {game.priceCents === 0 ? "Free" : `$${(game.priceCents / 100).toFixed(2)}`}
                          </p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </GameCardContent>
          </GameCard>
        </motion.div>
      </motion.main>
    </div>
  );
}

