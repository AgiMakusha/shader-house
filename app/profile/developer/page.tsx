"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { GameCard, GameCardContent } from "@/components/game/GameCard";
import Particles from "@/components/fx/Particles";
import { useAudio } from "@/components/audio/AudioProvider";
import { useRouter } from "next/navigation";
import { NotificationCenter } from "@/components/notifications/NotificationCenter";
import { HeaderReportButton } from "@/components/reports/HeaderReportButton";

const QUICK_ACTIONS = [
  { title: "My Games", description: "View all your published games", href: "/games?developer=me" },
  { title: "Devlogs", description: "Share your dev journey", href: "/profile/developer/devlogs" },
  { title: "Analytics", description: "View your game stats", href: "/profile/developer/analytics" },
  { title: "Revenue & Tips", description: "Track earnings and tips", href: "/profile/developer/revenue" },
  { title: "Beta Access", description: "Manage beta games", href: "/profile/developer/beta" },
  { title: "Notifications", description: "View all notifications", href: "/profile/developer/notifications" },
];

export default function DeveloperProfilePage() {
  const router = useRouter();
  const { play } = useAudio();
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch("/api/auth/me");
        if (!response.ok) {
          router.push("/login");
          return;
        }
        const data = await response.json();
        if (data.user.role !== "DEVELOPER") {
          router.push("/profile/gamer");
          return;
        }
        setUser(data.user);
      } catch (error) {
        console.error("Error fetching profile:", error);
        router.push("/login");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [router]);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      play("door");
      setTimeout(() => router.push("/login"), 300);
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-dvh relative overflow-hidden flex items-center justify-center">
        <Particles />
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
          <div className="text-xl font-semibold pixelized" style={{ color: "rgba(200, 240, 200, 0.9)" }}>
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
          className="w-full max-w-5xl mb-8 flex justify-between items-center"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div>
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
              Developer Studio
            </h1>
            <p
              className="text-sm font-semibold tracking-wide uppercase pixelized"
              style={{ textShadow: "1px 1px 0px rgba(0, 0, 0, 0.8)", color: "rgba(200, 240, 200, 0.7)" }}
            >
              Welcome back, {user?.name}
            </p>
          </div>

          <div className="flex items-center gap-4">
            <HeaderReportButton />
            <NotificationCenter />
            <motion.button
              onClick={handleLogout}
              className="px-6 py-2 rounded-lg font-semibold text-sm uppercase tracking-wider transition-all"
              style={{
                background: "linear-gradient(135deg, rgba(200, 100, 100, 0.3) 0%, rgba(180, 80, 80, 0.2) 100%)",
                border: "1px solid rgba(240, 200, 200, 0.3)",
                color: "rgba(240, 200, 200, 0.95)",
                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.3)",
              }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Logout
            </motion.button>
          </div>
        </motion.div>

        {/* Create New Game CTA */}
        <motion.div
          className="w-full max-w-5xl mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <Link href="/dashboard/games/new">
            <GameCard interactive>
              <GameCardContent className="p-8 cursor-pointer">
                <div>
                  <h2
                    className="text-2xl font-bold mb-2 pixelized"
                    style={{
                      textShadow: "0 0 8px rgba(120, 200, 120, 0.6), 1px 1px 0px rgba(0, 0, 0, 0.8)",
                      color: "rgba(180, 220, 180, 0.95)",
                    }}
                  >
                    Publish a New Game
                  </h2>
                  <p
                    className="text-sm"
                    style={{ color: "rgba(200, 240, 200, 0.7)" }}
                  >
                    Share your latest creation with the Shader House community
                  </p>
                </div>
              </GameCardContent>
            </GameCard>
          </Link>
        </motion.div>

        <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {QUICK_ACTIONS.map((action, index) => (
            <motion.div
              key={action.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 + index * 0.1 }}
            >
              <Link
                href={action.href}
                className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50 rounded-2xl transition-transform"
              >
                <GameCard interactive>
                  <GameCardContent className="p-6 text-center cursor-pointer space-y-3">
                    <h3
                      className="text-lg font-bold mb-2 pixelized"
                      style={{ textShadow: "0 0 6px rgba(120, 200, 120, 0.5), 1px 1px 0px rgba(0, 0, 0, 0.8)", color: "rgba(180, 220, 180, 0.95)" }}
                    >
                      {action.title}
                    </h3>
                    <p className="text-sm" style={{ color: "rgba(200, 240, 200, 0.7)" }}>
                      {action.description}
                    </p>
                  </GameCardContent>
                </GameCard>
              </Link>
            </motion.div>
          ))}

          <motion.div
            key="settings"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <Link
              href="/profile/developer/settings"
              className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50 rounded-2xl transition-transform"
            >
              <GameCard interactive>
                <GameCardContent className="p-6 text-center cursor-pointer space-y-3">
                  <h3
                    className="text-lg font-bold mb-2 pixelized"
                    style={{ textShadow: "0 0 6px rgba(120, 200, 120, 0.5), 1px 1px 0px rgba(0, 0, 0, 0.8)", color: "rgba(180, 220, 180, 0.95)" }}
                  >
                    Settings
                  </h3>
                  <p className="text-sm" style={{ color: "rgba(200, 240, 200, 0.7)" }}>
                    Manage your account
                  </p>
                </GameCardContent>
              </GameCard>
            </Link>
          </motion.div>
        </div>
      </motion.main>
    </div>
  );
}
