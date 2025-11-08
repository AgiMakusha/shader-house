"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

import Particles from "@/components/fx/Particles";
import { GameCard, GameCardContent } from "@/components/game/GameCard";
import { useAudio } from "@/components/audio/AudioProvider";

const ANALYTICS_STATS = [
  { label: "Total Views", value: "0", change: "+0%" },
  { label: "Active Projects", value: "0", change: "0" },
  { label: "Total Downloads", value: "0", change: "+0%" },
  { label: "Revenue", value: "€0", change: "+0%" },
];

const RECENT_ACTIVITY = [
  // Placeholder for recent activity data
];

export default function AnalyticsPage() {
  const router = useRouter();
  const { play } = useAudio();
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("30d");

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch("/api/auth/me");
        if (!response.ok) {
          router.push("/login");
          return;
        }
        const data = await response.json();
        setUser(data.user);
      } catch (error) {
        console.error("Error fetching user:", error);
        router.push("/login");
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {ANALYTICS_STATS.map((stat, index) => (
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
                    <p
                      className="text-3xl font-bold mb-1 pixelized"
                      style={{ textShadow: "0 0 8px rgba(120, 200, 120, 0.5), 1px 1px 0px rgba(0, 0, 0, 0.8)", color: "rgba(150, 250, 150, 0.95)" }}
                    >
                      {stat.value}
                    </p>
                    <p
                      className="text-xs font-semibold"
                      style={{ color: stat.change.startsWith("+") ? "rgba(150, 250, 150, 0.8)" : "rgba(250, 200, 150, 0.8)" }}
                    >
                      {stat.change} vs last period
                    </p>
                  </GameCardContent>
                </GameCard>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Performance Chart Placeholder */}
        <motion.div
          className="w-full max-w-5xl mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <GameCard>
            <GameCardContent className="p-8">
              <h2
                className="text-2xl font-bold mb-6 pixelized"
                style={{ textShadow: "0 0 8px rgba(120, 200, 120, 0.6), 1px 1px 0px rgba(0, 0, 0, 0.8)", color: "rgba(180, 220, 180, 0.95)" }}
              >
                Performance Overview
              </h2>
              <div
                className="rounded-lg p-12 text-center"
                style={{
                  background: "linear-gradient(135deg, rgba(100, 200, 100, 0.05) 0%, rgba(80, 180, 80, 0.02) 100%)",
                  border: "2px dashed rgba(200, 240, 200, 0.2)",
                }}
              >
                <p
                  className="text-lg pixelized mb-2"
                  style={{ color: "rgba(200, 240, 200, 0.7)" }}
                >
                  Chart Visualization
                </p>
                <p
                  className="text-sm"
                  style={{ color: "rgba(200, 240, 200, 0.5)" }}
                >
                  Performance charts will be displayed here once you have active projects
                </p>
              </div>
            </GameCardContent>
          </GameCard>
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          className="w-full max-w-5xl mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <GameCard>
            <GameCardContent className="p-8">
              <h2
                className="text-2xl font-bold mb-6 pixelized"
                style={{ textShadow: "0 0 8px rgba(120, 200, 120, 0.6), 1px 1px 0px rgba(0, 0, 0, 0.8)", color: "rgba(180, 220, 180, 0.95)" }}
              >
                Recent Activity
              </h2>
              {RECENT_ACTIVITY.length === 0 ? (
                <div className="text-center py-8">
                  <p
                    className="text-base pixelized"
                    style={{ color: "rgba(200, 240, 200, 0.6)" }}
                  >
                    No recent activity to display
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Activity items will be mapped here */}
                </div>
              )}
            </GameCardContent>
          </GameCard>
        </motion.div>

        {/* Top Projects */}
        <motion.div
          className="w-full max-w-5xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.7 }}
        >
          <GameCard>
            <GameCardContent className="p-8">
              <h2
                className="text-2xl font-bold mb-6 pixelized"
                style={{ textShadow: "0 0 8px rgba(120, 200, 120, 0.6), 1px 1px 0px rgba(0, 0, 0, 0.8)", color: "rgba(180, 220, 180, 0.95)" }}
              >
                Top Performing Projects
              </h2>
              <div className="text-center py-8">
                <p
                  className="text-base pixelized"
                  style={{ color: "rgba(200, 240, 200, 0.6)" }}
                >
                  Create projects to see performance metrics
                </p>
              </div>
            </GameCardContent>
          </GameCard>
        </motion.div>
      </motion.main>
    </div>
  );
}

