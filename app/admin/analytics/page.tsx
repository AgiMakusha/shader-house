"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { GameCard, GameCardContent } from "@/components/game/GameCard";
import Particles from "@/components/fx/Particles";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  BarChart3,
  Users,
  Gamepad2,
  TrendingUp,
  DollarSign,
  Eye,
  Download,
  Star,
  Calendar,
  Activity,
  Crown,
  Zap,
} from "lucide-react";

interface PlatformStats {
  users: { total: number; developers: number; gamers: number };
  games: { total: number; beta: number; released: number };
  engagement: { totalViews: number; totalDownloads: number; avgRating: number };
  subscriptions: { active: number; pro: number; premium: number };
}

export default function AdminAnalyticsPage() {
  const router = useRouter();
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch("/api/admin/stats");
        if (!res.ok) {
          if (res.status === 401 || res.status === 403) {
            router.push("/login");
            return;
          }
          throw new Error("Failed to fetch stats");
        }
        const data = await res.json();
        
        // Transform data for analytics view
        setStats({
          users: data.stats.users,
          games: data.stats.games,
          engagement: {
            totalViews: 0, // These would come from aggregated data
            totalDownloads: 0,
            avgRating: 0,
          },
          subscriptions: {
            active: data.stats.subscriptions.active,
            pro: 0,
            premium: 0,
          },
        });
      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, [router]);

  const StatCard = ({ title, value, icon: Icon, color, subtext }: { title: string; value: string | number; icon: any; color: string; subtext?: string }) => (
    <GameCard>
      <GameCardContent className="p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm uppercase tracking-wider mb-1" style={{ color: "rgba(200, 240, 200, 0.6)" }}>{title}</p>
            <p className="text-3xl font-bold" style={{ color }}>{value}</p>
            {subtext && <p className="text-xs mt-1" style={{ color: "rgba(200, 240, 200, 0.5)" }}>{subtext}</p>}
          </div>
          <div className="p-3 rounded-xl" style={{ background: `${color}20` }}>
            <Icon className="w-6 h-6" style={{ color }} />
          </div>
        </div>
      </GameCardContent>
    </GameCard>
  );

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
          className="w-full max-w-6xl mb-8 flex justify-between items-center"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="flex items-center gap-4">
            <Link href="/admin">
              <motion.button
                className="p-2 rounded-lg transition-all"
                style={{ background: "rgba(255, 255, 255, 0.1)", border: "1px solid rgba(255, 255, 255, 0.2)" }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <ArrowLeft className="w-5 h-5" style={{ color: "rgba(200, 240, 200, 0.9)" }} />
              </motion.button>
            </Link>
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-cyan-400/30">
                <BarChart3 className="w-8 h-8 text-cyan-400" style={{ filter: "drop-shadow(0 0 8px rgba(34, 211, 238, 0.5))" }} />
              </div>
              <div>
                <h1
                  className="text-2xl font-bold tracking-wider uppercase pixelized"
                  style={{
                    textShadow: `0 0 12px rgba(34, 211, 238, 0.8), 2px 2px 0px rgba(0, 0, 0, 0.9)`,
                    color: "rgba(165, 243, 252, 0.95)",
                  }}
                >
                  Platform Analytics
                </h1>
                <p className="text-sm font-semibold pixelized" style={{ color: "rgba(200, 240, 200, 0.7)" }}>
                  Insights & performance metrics
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-lg" style={{ color: "rgba(200, 240, 200, 0.7)" }}>Loading analytics...</div>
          </div>
        ) : stats ? (
          <>
            {/* User Stats */}
            <motion.div
              className="w-full max-w-6xl mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2" style={{ color: "rgba(200, 240, 200, 0.9)" }}>
                <Users className="w-5 h-5" />
                User Metrics
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <StatCard title="Total Users" value={stats.users.total} icon={Users} color="rgba(147, 197, 253, 0.95)" />
                <StatCard title="Developers" value={stats.users.developers} icon={Zap} color="rgba(196, 181, 253, 0.95)" subtext={`${((stats.users.developers / stats.users.total) * 100).toFixed(1)}% of users`} />
                <StatCard title="Gamers" value={stats.users.gamers} icon={Gamepad2} color="rgba(147, 197, 253, 0.95)" subtext={`${((stats.users.gamers / stats.users.total) * 100).toFixed(1)}% of users`} />
              </div>
            </motion.div>

            {/* Game Stats */}
            <motion.div
              className="w-full max-w-6xl mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2" style={{ color: "rgba(200, 240, 200, 0.9)" }}>
                <Gamepad2 className="w-5 h-5" />
                Game Metrics
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <StatCard title="Total Games" value={stats.games.total} icon={Gamepad2} color="rgba(196, 181, 253, 0.95)" />
                <StatCard title="Released" value={stats.games.released} icon={TrendingUp} color="rgba(187, 247, 208, 0.95)" subtext="Live on platform" />
                <StatCard title="In Beta" value={stats.games.beta} icon={Activity} color="rgba(253, 230, 138, 0.95)" subtext="Currently testing" />
              </div>
            </motion.div>

            {/* Subscription Stats */}
            <motion.div
              className="w-full max-w-6xl mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2" style={{ color: "rgba(200, 240, 200, 0.9)" }}>
                <Crown className="w-5 h-5" />
                Subscription Metrics
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <StatCard title="Active Subscriptions" value={stats.subscriptions.active} icon={Crown} color="rgba(253, 230, 138, 0.95)" />
                <StatCard title="Conversion Rate" value={`${((stats.subscriptions.active / stats.users.total) * 100).toFixed(1)}%`} icon={TrendingUp} color="rgba(187, 247, 208, 0.95)" subtext="Users with active sub" />
                <StatCard title="Revenue Potential" value="Coming Soon" icon={DollarSign} color="rgba(187, 247, 208, 0.95)" subtext="Stripe integration" />
              </div>
            </motion.div>

            {/* Charts Placeholder */}
            <motion.div
              className="w-full max-w-6xl"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              <GameCard>
                <GameCardContent className="p-8 text-center">
                  <BarChart3 className="w-16 h-16 mx-auto mb-4" style={{ color: "rgba(200, 240, 200, 0.3)" }} />
                  <h3 className="text-xl font-bold mb-2" style={{ color: "rgba(200, 240, 200, 0.9)" }}>
                    Detailed Charts Coming Soon
                  </h3>
                  <p style={{ color: "rgba(200, 240, 200, 0.6)" }}>
                    Time-series graphs, user growth trends, and revenue analytics will be available in a future update.
                  </p>
                </GameCardContent>
              </GameCard>
            </motion.div>
          </>
        ) : (
          <div className="text-center py-20" style={{ color: "rgba(200, 240, 200, 0.7)" }}>
            Failed to load analytics data
          </div>
        )}
      </motion.main>
    </div>
  );
}

