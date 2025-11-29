"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { GameCard, GameCardContent } from "@/components/game/GameCard";
import Particles from "@/components/fx/Particles";
import { useAudio } from "@/components/audio/AudioProvider";
import { FlaskConical, Users, Crown, Lock, ChevronLeft } from "lucide-react";

interface Game {
  id: string;
  title: string;
  slug: string;
  coverUrl: string;
  betaAccess: {
    id: string;
    isActive: boolean;
    maxTesters: number;
    currentTesters: number;
  }[];
}

export default function DeveloperBetaPage() {
  const router = useRouter();
  const { play } = useAudio();
  const [user, setUser] = useState<any>(null);
  const [games, setGames] = useState<Game[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch user
        const userResponse = await fetch("/api/auth/me");
        if (!userResponse.ok) {
          router.push("/login");
          return;
        }
        const userData = await userResponse.json();
        if (userData.user.role !== "DEVELOPER") {
          router.push("/profile/gamer");
          return;
        }
        setUser(userData.user);

        // Fetch developer's games with beta access info
        const gamesResponse = await fetch("/api/games?developer=me");
        if (gamesResponse.ok) {
          const gamesData = await gamesResponse.json();
          setGames(gamesData.items || []);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [router]);

  const toggleBetaAccess = async (gameId: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/games/${gameId}/beta-access`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !currentStatus }),
      });

      if (response.ok) {
        play("success");
        // Refresh games list
        const gamesResponse = await fetch("/api/games?developer=me");
        if (gamesResponse.ok) {
          const gamesData = await gamesResponse.json();
          setGames(gamesData.items || []);
        }
      } else {
        play("error");
      }
    } catch (error) {
      console.error("Error toggling beta access:", error);
      play("error");
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
        {/* Header */}
        <motion.div
          className="w-full max-w-5xl mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Link
            href="/profile/developer"
            className="inline-flex items-center gap-2 mb-4 text-sm font-semibold transition-colors"
            style={{ color: "rgba(200, 240, 200, 0.7)" }}
            onMouseEnter={() => play("hover")}
          >
            <ChevronLeft size={16} />
            Back to Profile
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
            Beta Access Management
          </h1>
          <p
            className="text-sm font-semibold tracking-wide pixelized"
            style={{ textShadow: "1px 1px 0px rgba(0, 0, 0, 0.8)", color: "rgba(200, 240, 200, 0.7)" }}
          >
            Manage demo and beta testing for your games
          </p>
        </motion.div>

        {/* Info Card */}
        <motion.div
          className="w-full max-w-5xl mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <GameCard>
            <GameCardContent className="p-6">
              <div className="flex items-start gap-4">
                <div
                  className="p-3 rounded-lg"
                  style={{
                    background: "rgba(240, 220, 140, 0.1)",
                    border: "1px solid rgba(240, 220, 140, 0.3)",
                  }}
                >
                  <Crown className="w-6 h-6" style={{ color: "rgba(240, 220, 140, 0.9)" }} />
                </div>
                <div className="flex-1">
                  <h3
                    className="text-lg font-bold mb-2 pixelized"
                    style={{
                      color: "rgba(240, 220, 140, 0.95)",
                      textShadow: "0 0 6px rgba(240, 220, 140, 0.5), 1px 1px 0px rgba(0, 0, 0, 0.8)",
                    }}
                  >
                    Beta Access for Pro Members
                  </h3>
                  <p className="text-sm mb-3" style={{ color: "rgba(200, 240, 200, 0.7)" }}>
                    When you enable beta access for a game, it becomes available to gamers with a{" "}
                    <span className="font-bold" style={{ color: "rgba(240, 220, 140, 0.9)" }}>
                      Creator Support Pass
                    </span>{" "}
                    subscription. They can test your game early and provide valuable feedback.
                  </p>
                  <div className="flex flex-wrap gap-4 text-xs" style={{ color: "rgba(200, 240, 200, 0.6)" }}>
                    <div className="flex items-center gap-2">
                      <FlaskConical size={14} />
                      <span>Early access testing</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users size={14} />
                      <span>Community feedback</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Crown size={14} />
                      <span>Pro members only</span>
                    </div>
                  </div>
                </div>
              </div>
            </GameCardContent>
          </GameCard>
        </motion.div>

        {/* Games List */}
        <motion.div
          className="w-full max-w-5xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <h2
            className="text-2xl font-bold mb-6 pixelized"
            style={{
              color: "rgba(180, 220, 180, 0.95)",
              textShadow: "0 0 8px rgba(120, 200, 120, 0.5), 1px 1px 0px rgba(0, 0, 0, 0.8)",
            }}
          >
            Your Games
          </h2>

          {games.length === 0 ? (
            <GameCard>
              <GameCardContent className="p-8 text-center">
                <p className="text-sm mb-4" style={{ color: "rgba(200, 240, 200, 0.7)" }}>
                  You haven't published any games yet.
                </p>
                <Link
                  href="/dashboard/games/new"
                  className="inline-block px-6 py-3 rounded-lg font-semibold text-sm uppercase tracking-wider transition-all"
                  style={{
                    background: "linear-gradient(135deg, rgba(100, 200, 100, 0.4) 0%, rgba(80, 180, 80, 0.3) 100%)",
                    border: "1px solid rgba(200, 240, 200, 0.4)",
                    color: "rgba(200, 240, 200, 0.95)",
                    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.3)",
                  }}
                  onMouseEnter={() => play("hover")}
                >
                  Publish Your First Game
                </Link>
              </GameCardContent>
            </GameCard>
          ) : (
            <div className="space-y-4">
              {games.map((game, index) => {
                const betaInfo = game.betaAccess?.[0];
                const isActive = betaInfo?.isActive || false;

                return (
                  <motion.div
                    key={game.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.5 + index * 0.1 }}
                  >
                    <GameCard>
                      <GameCardContent className="p-6">
                        <div className="flex items-center gap-6">
                          {/* Game Cover */}
                          <div
                            className="w-24 h-24 rounded-lg overflow-hidden flex-shrink-0"
                            style={{
                              background: "rgba(100, 200, 100, 0.1)",
                              border: "1px solid rgba(200, 240, 200, 0.2)",
                            }}
                          >
                            {game.coverUrl ? (
                              <img
                                src={game.coverUrl}
                                alt={game.title}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <FlaskConical size={32} style={{ color: "rgba(200, 240, 200, 0.3)" }} />
                              </div>
                            )}
                          </div>

                          {/* Game Info */}
                          <div className="flex-1">
                            <h3
                              className="text-xl font-bold mb-1 pixelized"
                              style={{
                                color: "rgba(180, 220, 180, 0.95)",
                                textShadow: "0 0 6px rgba(120, 200, 120, 0.5), 1px 1px 0px rgba(0, 0, 0, 0.8)",
                              }}
                            >
                              {game.title}
                            </h3>
                            <div className="flex items-center gap-4 text-sm" style={{ color: "rgba(200, 240, 200, 0.6)" }}>
                              {isActive ? (
                                <>
                                  <span className="flex items-center gap-1">
                                    <FlaskConical size={14} style={{ color: "rgba(150, 250, 150, 0.9)" }} />
                                    <span style={{ color: "rgba(150, 250, 150, 0.9)" }}>Beta Active</span>
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <Users size={14} />
                                    {betaInfo?.currentTesters || 0} testers
                                  </span>
                                </>
                              ) : (
                                <span className="flex items-center gap-1">
                                  <Lock size={14} />
                                  Beta Disabled
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Toggle Button */}
                          <motion.button
                            onClick={() => toggleBetaAccess(game.id, isActive)}
                            className="px-6 py-3 rounded-lg font-semibold text-sm uppercase tracking-wider transition-all"
                            style={{
                              background: isActive
                                ? "linear-gradient(135deg, rgba(200, 100, 100, 0.3) 0%, rgba(180, 80, 80, 0.2) 100%)"
                                : "linear-gradient(135deg, rgba(100, 200, 100, 0.4) 0%, rgba(80, 180, 80, 0.3) 100%)",
                              border: isActive
                                ? "1px solid rgba(240, 200, 200, 0.3)"
                                : "1px solid rgba(200, 240, 200, 0.4)",
                              color: isActive ? "rgba(240, 200, 200, 0.95)" : "rgba(200, 240, 200, 0.95)",
                              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.3)",
                            }}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onMouseEnter={() => play("hover")}
                          >
                            {isActive ? "Disable Beta" : "Enable Beta"}
                          </motion.button>
                        </div>
                      </GameCardContent>
                    </GameCard>
                  </motion.div>
                );
              })}
            </div>
          )}
        </motion.div>
      </motion.main>
    </div>
  );
}

