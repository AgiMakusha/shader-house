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
  { title: "My Library", description: "Purchased & favorite games", href: "/profile/gamer/library" },
  { title: "Marketplace", description: "Discover new games", href: "/games" },
  { title: "Devlogs", description: "Behind-the-scenes stories", href: "/devlogs" },
  { title: "My Beta Tests", description: "Active beta tests & tasks", href: "/profile/gamer/beta" },
  { title: "Beta Games", description: "Join new beta tests", href: "/games/beta" },
  { title: "Achievements", description: "View your trophies", href: "/profile/gamer/achievements" },
  { title: "Notifications", description: "View all notifications", href: "/profile/gamer/notifications" },
  { title: "Community", description: "Chat with friends", href: "/community" },
];

export default function GamerProfilePage() {
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
        if (data.user.role !== "GAMER") {
          router.push("/profile/developer");
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
      const response = await fetch("/api/auth/logout", { method: "POST" });
      if (response.ok) {
        play("door");
        setTimeout(() => router.push("/login"), 300);
      } else {
        console.error("Logout failed:", await response.text());
      }
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
          className="w-full max-w-5xl mb-8 flex justify-between items-center relative z-20"
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
              Gamer Hub
            </h1>
            <p
              className="text-sm font-semibold tracking-wide uppercase pixelized"
              style={{ textShadow: "1px 1px 0px rgba(0, 0, 0, 0.8)", color: "rgba(200, 240, 200, 0.7)" }}
            >
              Welcome, {user?.name}
            </p>
          </div>

          <div className="flex items-center gap-3">
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

        <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-3 gap-6">
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
            transition={{ duration: 0.6, delay: 0.9 }}
          >
            <Link
              href="/profile/gamer/settings"
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
                    Manage account
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
