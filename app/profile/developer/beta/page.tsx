"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { GameCard, GameCardContent } from "@/components/game/GameCard";
import Particles from "@/components/fx/Particles";
import { useAudio } from "@/components/audio/AudioProvider";
import { FlaskConical, Users, Crown, Lock, ChevronLeft, Rocket, ListTodo, MessageSquare, Bug } from "lucide-react";
import TaskManagementModal from "@/components/beta/TaskManagementModal";

interface Game {
  id: string;
  title: string;
  slug: string;
  coverUrl: string;
  _count?: {
    betaFeedback?: number;
    purchases?: number;
    ratings?: number;
  };
  betaTesters?: Array<{ id: string }>;
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
  const [gameStats, setGameStats] = useState<Record<string, { bugs: number }>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [selectedGame, setSelectedGame] = useState<{ id: string; title: string } | null>(null);

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

        // Fetch developer's beta games only (releaseStatus = BETA)
        const gamesResponse = await fetch("/api/games?developer=me&status=beta");
        if (gamesResponse.ok) {
          const gamesData = await gamesResponse.json();
          const fetchedGames = gamesData.items || [];
          setGames(fetchedGames);
          
          // Fetch bug counts for each game
          const stats: Record<string, { bugs: number }> = {};
          await Promise.all(
            fetchedGames.map(async (game: Game) => {
              try {
                const feedbackResponse = await fetch(`/api/beta/feedback?gameId=${game.id}`);
                if (feedbackResponse.ok) {
                  const feedbackData = await feedbackResponse.json();
                  const bugs = feedbackData.feedback?.filter((f: any) => f.type === 'BUG').length || 0;
                  stats[game.id] = { bugs };
                }
              } catch (error) {
                console.error(`Error fetching stats for game ${game.id}:`, error);
                stats[game.id] = { bugs: 0 };
              }
            })
          );
          setGameStats(stats);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [router]);

  const promoteToRelease = async (gameId: string, gameTitle: string) => {
    const confirmed = window.confirm(
      `Promote "${gameTitle}" to Full Release?\n\n` +
      `This will:\n` +
      `• Move the game from Beta to Public Marketplace\n` +
      `• Make it visible to all users (not just Pro subscribers)\n` +
      `• Remove it from the Beta Games list\n\n` +
      `This action cannot be undone. Are you sure?`
    );

    if (!confirmed) return;

    try {
      const response = await fetch(`/api/games/${gameId}/promote`, {
        method: "POST",
      });

      if (response.ok) {
        play("success");
        // Refresh games list
        const gamesResponse = await fetch("/api/games?developer=me&status=beta");
        if (gamesResponse.ok) {
          const gamesData = await gamesResponse.json();
          setGames(gamesData.items || []);
        }
      } else {
        const data = await response.json();
        alert(data.error || "Failed to promote game");
        play("error");
      }
    } catch (error) {
      console.error("Error promoting game:", error);
      alert("An error occurred while promoting the game");
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
                    Games in beta are only visible to{" "}
                    <span className="font-bold" style={{ color: "rgba(240, 220, 140, 0.9)" }}>
                      Creator Support Pass
                    </span>{" "}
                    subscribers. They can test your game and provide feedback before you release it to the public.
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
                  
                  {/* New: Link to Feedback Page */}
                  <div className="mt-4 pt-4 border-t" style={{ borderColor: "rgba(240, 220, 140, 0.2)" }}>
                    <Link
                      href="/profile/developer/feedback"
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm transition-all"
                      style={{
                        background: "rgba(100, 200, 100, 0.2)",
                        border: "1px solid rgba(150, 250, 150, 0.3)",
                        color: "rgba(200, 240, 200, 0.95)",
                      }}
                      onMouseEnter={() => play("hover")}
                    >
                      <Users size={16} />
                      View Beta Feedback & Bug Reports
                    </Link>
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
                <p className="text-sm mb-2" style={{ color: "rgba(200, 240, 200, 0.7)" }}>
                  You don't have any games in beta testing.
                </p>
                <p className="text-xs mb-4" style={{ color: "rgba(200, 240, 200, 0.5)" }}>
                  Create a new game and select "Beta Testing" to start getting feedback from Pro subscribers.
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
                  Create Beta Game
                </Link>
              </GameCardContent>
            </GameCard>
          ) : (
            <div className="space-y-4">
              {games.map((game, index) => {
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
                              background: "rgba(100, 150, 255, 0.1)",
                              border: "1px solid rgba(150, 180, 255, 0.3)",
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
                                <FlaskConical size={32} style={{ color: "rgba(150, 180, 255, 0.5)" }} />
                              </div>
                            )}
                          </div>

                          {/* Game Info */}
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3
                                className="text-xl font-bold pixelized"
                                style={{
                                  color: "rgba(180, 220, 180, 0.95)",
                                  textShadow: "0 0 6px rgba(120, 200, 120, 0.5), 1px 1px 0px rgba(0, 0, 0, 0.8)",
                                }}
                              >
                                {game.title}
                              </h3>
                              <span
                                className="px-2 py-1 rounded text-xs font-bold pixelized"
                                style={{
                                  background: "rgba(100, 150, 255, 0.2)",
                                  border: "1px solid rgba(150, 180, 255, 0.4)",
                                  color: "rgba(150, 200, 255, 0.95)",
                                }}
                              >
                                BETA
                              </span>
                            </div>
                            <div className="flex items-center gap-4 text-sm" style={{ color: "rgba(200, 240, 200, 0.6)" }}>
                              <span className="flex items-center gap-1">
                                <Users size={14} />
                                {game.betaTesters?.length || 0} testers
                              </span>
                              <span className="flex items-center gap-1">
                                <FlaskConical size={14} />
                                {game._count?.betaFeedback || 0} feedback
                              </span>
                              <span className="flex items-center gap-1" style={{ color: "rgba(250, 150, 150, 0.8)" }}>
                                <Bug size={14} />
                                {gameStats[game.id]?.bugs || 0} bugs
                              </span>
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex flex-col gap-2">
                            <div className="flex gap-2">
                              <button
                                onClick={() => {
                                  setSelectedGame({ id: game.id, title: game.title });
                                  setTaskModalOpen(true);
                                  play("hover");
                                }}
                                className="px-3 py-2 rounded-lg font-semibold text-xs uppercase tracking-wider transition-all flex items-center gap-2"
                                style={{
                                  background: "rgba(150, 200, 255, 0.2)",
                                  border: "1px solid rgba(150, 200, 255, 0.3)",
                                  color: "rgba(150, 200, 255, 0.95)",
                                }}
                                onMouseEnter={() => play("hover")}
                              >
                                <ListTodo size={14} />
                                Tasks
                              </button>
                              <Link
                                href={`/profile/developer/beta/${game.id}/feedback`}
                                className="px-3 py-2 rounded-lg font-semibold text-xs uppercase tracking-wider transition-all flex items-center gap-2"
                                style={{
                                  background: "rgba(250, 220, 100, 0.2)",
                                  border: "1px solid rgba(250, 220, 100, 0.3)",
                                  color: "rgba(250, 220, 100, 0.95)",
                                }}
                                onMouseEnter={() => play("hover")}
                              >
                                <MessageSquare size={14} />
                                Feedback
                              </Link>
                              <Link
                                href={`/dashboard/games/${game.id}/edit`}
                                className="px-3 py-2 rounded-lg font-semibold text-xs uppercase tracking-wider transition-all"
                                style={{
                                  background: "rgba(100, 200, 100, 0.2)",
                                  border: "1px solid rgba(200, 240, 200, 0.3)",
                                  color: "rgba(200, 240, 200, 0.95)",
                                }}
                                onMouseEnter={() => play("hover")}
                              >
                                Edit
                              </Link>
                            </div>
                            <motion.button
                              onClick={() => promoteToRelease(game.id, game.title)}
                              className="px-4 py-2 rounded-lg font-semibold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2"
                              style={{
                                background: "linear-gradient(135deg, rgba(100, 200, 100, 0.4) 0%, rgba(80, 180, 80, 0.3) 100%)",
                                border: "1px solid rgba(200, 240, 200, 0.4)",
                                color: "rgba(200, 240, 200, 0.95)",
                                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.3)",
                              }}
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              onMouseEnter={() => play("hover")}
                            >
                              <Rocket className="w-4 h-4" />
                              Promote to Release
                            </motion.button>
                          </div>
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

      {/* Task Management Modal */}
      {selectedGame && (
        <TaskManagementModal
          gameId={selectedGame.id}
          gameTitle={selectedGame.title}
          isOpen={taskModalOpen}
          onClose={() => {
            setTaskModalOpen(false);
            setSelectedGame(null);
          }}
        />
      )}
    </div>
  );
}

