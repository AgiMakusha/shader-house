"use client";

import Link from "next/link";
import { useState, useEffect, use } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  BarChart3,
  Eye,
  Download,
  Heart,
  Star,
  Clock,
  DollarSign,
  Users,
  TrendingUp,
  Calendar,
  ArrowLeft,
} from "lucide-react";

import Particles from "@/components/fx/Particles";
import { GameCard, GameCardContent } from "@/components/game/GameCard";
import { useAudio } from "@/components/audio/AudioProvider";

interface GameAnalytics {
  overview: {
    views: number;
    downloads: number;
    favorites: number;
    purchases: number;
    ratings: number;
    avgRating: number;
    betaTesters: number;
    feedbackCount: number;
  };
  playtime: {
    totalSeconds: number;
    periodSeconds: number;
    periodSessions: number;
    uniquePlayersInPeriod: number;
    averageSessionMinutes: number;
    byDay: { date: string; totalMinutes: number; sessions: number }[];
  };
  ratings: {
    distribution: { stars: number; count: number }[];
    recent: { id: string; stars: number; comment: string | null; user: string; createdAt: string }[];
  };
  favorites: {
    total: number;
    trend: { date: string; count: number }[];
  };
  revenue: {
    totalCents: number;
    periodCents: number;
    periodPurchases: number;
    trend: { date: string; count: number; revenueCents: number }[];
  };
  versions: { version: string; title: string | null; releasedAt: string }[];
  period: {
    days: number;
    startDate: string;
    endDate: string;
  };
}

interface PageProps {
  params: Promise<{ gameId: string }>;
}

export default function GameAnalyticsPage({ params }: PageProps) {
  const { gameId } = use(params);
  const router = useRouter();
  const { play } = useAudio();
  const [isLoading, setIsLoading] = useState(true);
  const [analytics, setAnalytics] = useState<GameAnalytics | null>(null);
  const [game, setGame] = useState<any>(null);
  const [period, setPeriod] = useState(30);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/games/${gameId}/analytics?period=${period}`);
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || "Failed to fetch analytics");
        }
        const data = await res.json();
        setAnalytics(data);

        // Also fetch game details
        const gameRes = await fetch(`/api/games?developer=me`);
        if (gameRes.ok) {
          const gameData = await gameRes.json();
          const foundGame = gameData.items?.find((g: any) => g.id === gameId);
          setGame(foundGame);
        }
      } catch (err: any) {
        console.error("Error fetching analytics:", err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalytics();
  }, [gameId, period]);

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  if (isLoading) {
    return (
      <div className="min-h-dvh relative overflow-hidden flex items-center justify-center">
        <Particles />
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
          <div className="text-xl font-semibold pixelized" style={{ color: "rgba(200, 240, 200, 0.9)" }}>
            Loading analytics...
          </div>
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-dvh relative overflow-hidden flex items-center justify-center">
        <Particles />
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
          <div className="text-xl font-semibold pixelized mb-4" style={{ color: "rgba(250, 150, 150, 0.9)" }}>
            {error}
          </div>
          <Link
            href="/profile/developer/analytics"
            className="text-sm font-semibold uppercase tracking-wider hover:underline"
            style={{ color: "rgba(200, 240, 200, 0.75)" }}
          >
            ← Back to Analytics
          </Link>
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
        {/* Header */}
        <motion.div
          className="w-full max-w-6xl mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Link
            href="/profile/developer/analytics"
            className="text-sm font-semibold uppercase tracking-wider hover:underline flex items-center gap-2 mb-4"
            style={{ color: "rgba(200, 240, 200, 0.75)" }}
          >
            <ArrowLeft size={16} />
            Back to Analytics
          </Link>

          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] pixelized mb-1" style={{ color: "rgba(200, 240, 200, 0.6)" }}>
                Game Analytics
              </p>
              <h1
                className="text-3xl font-bold tracking-wider pixelized flex items-center gap-3"
                style={{
                  textShadow: "0 0 12px rgba(120, 200, 120, 0.8), 2px 2px 0px rgba(0, 0, 0, 0.9)",
                  color: "rgba(180, 220, 180, 0.95)",
                }}
              >
                <BarChart3 size={28} style={{ color: "rgba(150, 250, 150, 0.9)" }} />
                {game?.title || "Game Analytics"}
              </h1>
            </div>

            {/* Period Selector */}
            <div className="flex gap-2">
              {[
                { value: 7, label: "7D" },
                { value: 30, label: "30D" },
                { value: 90, label: "90D" },
              ].map((p) => (
                <button
                  key={p.value}
                  onClick={() => {
                    setPeriod(p.value);
                    play("click");
                  }}
                  className="px-4 py-2 rounded-lg font-semibold text-sm transition-all"
                  style={{
                    background: period === p.value
                      ? "linear-gradient(135deg, rgba(100, 200, 100, 0.35) 0%, rgba(80, 180, 80, 0.2) 100%)"
                      : "rgba(100, 180, 100, 0.1)",
                    border: `1px solid ${period === p.value ? "rgba(200, 240, 200, 0.4)" : "rgba(200, 240, 200, 0.2)"}`,
                    color: "rgba(200, 240, 200, 0.9)",
                  }}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>
        </motion.div>

        {analytics && (
          <>
            {/* Overview Stats Grid */}
            <motion.div
              className="w-full max-w-6xl mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: "Views", value: analytics.overview.views.toLocaleString(), icon: Eye },
                  { label: "Downloads", value: analytics.overview.downloads.toLocaleString(), icon: Download },
                  { label: "Favorites", value: analytics.overview.favorites.toLocaleString(), icon: Heart },
                  { label: "Purchases", value: analytics.overview.purchases.toLocaleString(), icon: DollarSign },
                ].map((stat, index) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.35 + index * 0.05 }}
                  >
                    <GameCard>
                      <GameCardContent className="p-5">
                        <div className="flex items-center gap-3">
                          <stat.icon size={20} style={{ color: "rgba(150, 250, 150, 0.8)" }} />
                          <div>
                            <p className="text-xs font-medium" style={{ color: "rgba(200, 240, 200, 0.6)" }}>
                              {stat.label}
                            </p>
                            <p
                              className="text-2xl font-bold pixelized"
                              style={{ color: "rgba(150, 250, 150, 0.95)" }}
                            >
                              {stat.value}
                            </p>
                          </div>
                        </div>
                      </GameCardContent>
                    </GameCard>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Rating & Playtime Row */}
            <motion.div
              className="w-full max-w-6xl mb-6 grid grid-cols-1 md:grid-cols-2 gap-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              {/* Rating Card */}
              <GameCard>
                <GameCardContent className="p-6">
                  <h3
                    className="text-lg font-bold mb-4 pixelized flex items-center gap-2"
                    style={{ color: "rgba(180, 220, 180, 0.95)" }}
                  >
                    <Star size={18} style={{ color: "rgba(250, 200, 100, 0.9)" }} />
                    Ratings
                  </h3>

                  <div className="flex items-center gap-6 mb-4">
                    <div className="text-center">
                      <p
                        className="text-4xl font-bold pixelized"
                        style={{ color: "rgba(250, 200, 100, 0.95)" }}
                      >
                        {analytics.overview.avgRating.toFixed(1)}
                      </p>
                      <p className="text-xs" style={{ color: "rgba(200, 240, 200, 0.6)" }}>
                        Average
                      </p>
                    </div>
                    <div className="flex-1 space-y-1">
                      {analytics.ratings.distribution.reverse().map((d) => (
                        <div key={d.stars} className="flex items-center gap-2">
                          <span className="text-xs w-4" style={{ color: "rgba(200, 240, 200, 0.6)" }}>
                            {d.stars}
                          </span>
                          <div
                            className="flex-1 h-2 rounded"
                            style={{ background: "rgba(100, 200, 100, 0.1)" }}
                          >
                            <div
                              className="h-full rounded"
                              style={{
                                width: `${(d.count / Math.max(1, analytics.overview.ratings)) * 100}%`,
                                background: "linear-gradient(90deg, rgba(250, 200, 100, 0.8), rgba(250, 150, 50, 0.8))",
                              }}
                            />
                          </div>
                          <span className="text-xs w-6" style={{ color: "rgba(200, 240, 200, 0.6)" }}>
                            {d.count}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <p className="text-sm" style={{ color: "rgba(200, 240, 200, 0.6)" }}>
                    {analytics.overview.ratings} total ratings
                  </p>
                </GameCardContent>
              </GameCard>

              {/* Playtime Card */}
              <GameCard>
                <GameCardContent className="p-6">
                  <h3
                    className="text-lg font-bold mb-4 pixelized flex items-center gap-2"
                    style={{ color: "rgba(180, 220, 180, 0.95)" }}
                  >
                    <Clock size={18} style={{ color: "rgba(100, 200, 250, 0.9)" }} />
                    Playtime (Last {analytics.period.days} Days)
                  </h3>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs mb-1" style={{ color: "rgba(200, 240, 200, 0.6)" }}>
                        Total Playtime
                      </p>
                      <p
                        className="text-2xl font-bold pixelized"
                        style={{ color: "rgba(100, 200, 250, 0.95)" }}
                      >
                        {formatDuration(analytics.playtime.periodSeconds)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs mb-1" style={{ color: "rgba(200, 240, 200, 0.6)" }}>
                        Sessions
                      </p>
                      <p
                        className="text-2xl font-bold pixelized"
                        style={{ color: "rgba(100, 200, 250, 0.95)" }}
                      >
                        {analytics.playtime.periodSessions}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs mb-1" style={{ color: "rgba(200, 240, 200, 0.6)" }}>
                        Unique Players
                      </p>
                      <p
                        className="text-2xl font-bold pixelized"
                        style={{ color: "rgba(100, 200, 250, 0.95)" }}
                      >
                        {analytics.playtime.uniquePlayersInPeriod}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs mb-1" style={{ color: "rgba(200, 240, 200, 0.6)" }}>
                        Avg Session
                      </p>
                      <p
                        className="text-2xl font-bold pixelized"
                        style={{ color: "rgba(100, 200, 250, 0.95)" }}
                      >
                        {analytics.playtime.averageSessionMinutes}m
                      </p>
                    </div>
                  </div>
                </GameCardContent>
              </GameCard>
            </motion.div>

            {/* Revenue Card */}
            <motion.div
              className="w-full max-w-6xl mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              <GameCard>
                <GameCardContent className="p-6">
                  <h3
                    className="text-lg font-bold mb-4 pixelized flex items-center gap-2"
                    style={{ color: "rgba(180, 220, 180, 0.95)" }}
                  >
                    <TrendingUp size={18} style={{ color: "rgba(150, 250, 150, 0.9)" }} />
                    Revenue
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <p className="text-xs mb-1" style={{ color: "rgba(200, 240, 200, 0.6)" }}>
                        Total Revenue
                      </p>
                      <p
                        className="text-3xl font-bold pixelized"
                        style={{ color: "rgba(150, 250, 150, 0.95)" }}
                      >
                        ${(analytics.revenue.totalCents / 100).toFixed(2)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs mb-1" style={{ color: "rgba(200, 240, 200, 0.6)" }}>
                        Last {analytics.period.days} Days
                      </p>
                      <p
                        className="text-3xl font-bold pixelized"
                        style={{ color: "rgba(150, 250, 150, 0.95)" }}
                      >
                        ${(analytics.revenue.periodCents / 100).toFixed(2)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs mb-1" style={{ color: "rgba(200, 240, 200, 0.6)" }}>
                        Purchases (Period)
                      </p>
                      <p
                        className="text-3xl font-bold pixelized"
                        style={{ color: "rgba(150, 250, 150, 0.95)" }}
                      >
                        {analytics.revenue.periodPurchases}
                      </p>
                    </div>
                  </div>
                </GameCardContent>
              </GameCard>
            </motion.div>

            {/* Version History */}
            {analytics.versions.length > 0 && (
              <motion.div
                className="w-full max-w-6xl mb-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.7 }}
              >
                <GameCard>
                  <GameCardContent className="p-6">
                    <h3
                      className="text-lg font-bold mb-4 pixelized flex items-center gap-2"
                      style={{ color: "rgba(180, 220, 180, 0.95)" }}
                    >
                      <Calendar size={18} style={{ color: "rgba(200, 150, 250, 0.9)" }} />
                      Recent Versions
                    </h3>

                    <div className="space-y-3">
                      {analytics.versions.map((version, index) => (
                        <div
                          key={version.version}
                          className="flex items-center justify-between p-3 rounded-lg"
                          style={{
                            background: index === 0 ? "rgba(100, 200, 100, 0.15)" : "rgba(100, 200, 100, 0.08)",
                            border: `1px solid rgba(200, 240, 200, ${index === 0 ? 0.3 : 0.1})`,
                          }}
                        >
                          <div>
                            <span className="font-bold" style={{ color: "rgba(200, 240, 200, 0.95)" }}>
                              v{version.version}
                            </span>
                            {version.title && (
                              <span className="ml-2" style={{ color: "rgba(200, 240, 200, 0.7)" }}>
                                - {version.title}
                              </span>
                            )}
                          </div>
                          <span className="text-sm" style={{ color: "rgba(200, 240, 200, 0.5)" }}>
                            {new Date(version.releasedAt).toLocaleDateString()}
                          </span>
                        </div>
                      ))}
                    </div>

                    <Link
                      href={`/dashboard/games/${gameId}/versions`}
                      className="inline-block mt-4 text-sm font-semibold uppercase tracking-wider hover:underline"
                      style={{ color: "rgba(150, 250, 150, 0.8)" }}
                    >
                      Manage Versions →
                    </Link>
                  </GameCardContent>
                </GameCard>
              </motion.div>
            )}

            {/* Recent Reviews */}
            {analytics.ratings.recent.length > 0 && (
              <motion.div
                className="w-full max-w-6xl"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.8 }}
              >
                <GameCard>
                  <GameCardContent className="p-6">
                    <h3
                      className="text-lg font-bold mb-4 pixelized flex items-center gap-2"
                      style={{ color: "rgba(180, 220, 180, 0.95)" }}
                    >
                      <Users size={18} style={{ color: "rgba(250, 200, 100, 0.9)" }} />
                      Recent Reviews
                    </h3>

                    <div className="space-y-4">
                      {analytics.ratings.recent.slice(0, 5).map((review) => (
                        <div
                          key={review.id}
                          className="p-4 rounded-lg"
                          style={{
                            background: "rgba(100, 200, 100, 0.08)",
                            border: "1px solid rgba(200, 240, 200, 0.1)",
                          }}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold" style={{ color: "rgba(200, 240, 200, 0.9)" }}>
                                {review.user}
                              </span>
                              <div className="flex">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <Star
                                    key={star}
                                    size={14}
                                    fill={star <= review.stars ? "rgba(250, 200, 100, 0.9)" : "transparent"}
                                    style={{ color: star <= review.stars ? "rgba(250, 200, 100, 0.9)" : "rgba(200, 240, 200, 0.3)" }}
                                  />
                                ))}
                              </div>
                            </div>
                            <span className="text-xs" style={{ color: "rgba(200, 240, 200, 0.5)" }}>
                              {new Date(review.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          {review.comment && (
                            <p className="text-sm" style={{ color: "rgba(200, 240, 200, 0.7)" }}>
                              {review.comment}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </GameCardContent>
                </GameCard>
              </motion.div>
            )}
          </>
        )}
      </motion.main>
    </div>
  );
}

