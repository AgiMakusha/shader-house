"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { GameCard, GameCardContent } from "@/components/game/GameCard";
import Particles from "@/components/fx/Particles";
import { useAudio } from "@/components/audio/AudioProvider";
import { 
  FlaskConical, 
  ChevronLeft, 
  Clock, 
  CheckCircle2, 
  Circle,
  Trophy,
  Bug,
  MessageSquare
} from "lucide-react";

interface BetaTest {
  id: string;
  gameId: string;
  bugsReported: number;
  tasksCompleted: number;
  timeSpent: number;
  lastActiveAt: string;
  totalTasks: number;
  progress: number;
  game: {
    id: string;
    title: string;
    slug: string;
    coverUrl: string;
    releaseStatus: string;
    externalUrl: string | null;
    gameFileUrl: string | null;
    developer: {
      id: string;
      name: string;
    };
  };
}

export default function GamerBetaDashboard() {
  const router = useRouter();
  const { play } = useAudio();
  const [user, setUser] = useState<any>(null);
  const [tests, setTests] = useState<BetaTest[]>([]);
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
        if (userData.user.role !== "GAMER") {
          router.push("/profile/developer");
          return;
        }
        setUser(userData.user);

        // Fetch active beta tests
        const testsResponse = await fetch("/api/beta/my-tests");
        if (testsResponse.ok) {
          const testsData = await testsResponse.json();
          setTests(testsData.tests || []);
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
        <p style={{ color: "rgba(200, 240, 200, 0.7)" }}>Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-dvh relative overflow-hidden">
      <Particles />

      <motion.main
        className="relative z-10 flex min-h-dvh flex-col items-center justify-start p-6 pt-12"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        {/* Header */}
        <div className="w-full max-w-5xl mb-8">
          <Link
            href="/profile/gamer"
            className="inline-flex items-center gap-2 mb-6 text-sm transition-colors"
            style={{ color: "rgba(200, 240, 200, 0.7)" }}
            onMouseEnter={() => play("hover")}
          >
            <ChevronLeft className="w-4 h-4" />
            Back to Profile
          </Link>

          <div className="flex items-center gap-4 mb-2">
            <FlaskConical 
              className="w-10 h-10" 
              style={{ color: "rgba(150, 200, 255, 0.9)" }} 
            />
            <h1
              className="text-4xl font-bold tracking-wider uppercase pixelized"
              style={{
                textShadow: `
                  0 0 12px rgba(150, 200, 255, 0.8),
                  0 0 24px rgba(120, 180, 255, 0.6),
                  2px 2px 0px rgba(0, 0, 0, 0.9)
                `,
                color: "rgba(180, 220, 255, 0.95)",
              }}
            >
              My Beta Tests
            </h1>
          </div>
          <p
            className="text-sm pixelized"
            style={{
              color: "rgba(200, 240, 200, 0.65)",
              textShadow: "1px 1px 0px rgba(0, 0, 0, 0.8)",
            }}
          >
            Test pre-release games and help developers improve them
          </p>
        </div>

        {/* Active Tests */}
        {tests.length === 0 ? (
          <motion.div
            className="w-full max-w-5xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <GameCard>
              <GameCardContent className="p-12 text-center">
                <FlaskConical 
                  className="w-16 h-16 mx-auto mb-4" 
                  style={{ color: "rgba(150, 200, 255, 0.5)" }} 
                />
                <h3
                  className="text-xl font-bold mb-2 pixelized"
                  style={{
                    color: "rgba(180, 220, 180, 0.95)",
                    textShadow: "0 0 6px rgba(120, 200, 120, 0.5), 1px 1px 0px rgba(0, 0, 0, 0.8)",
                  }}
                >
                  No Active Beta Tests
                </h3>
                <p className="text-sm mb-6" style={{ color: "rgba(200, 240, 200, 0.7)" }}>
                  Browse beta games and join a test to get started
                </p>
                <Link
                  href="/games/beta"
                  className="inline-block px-6 py-3 rounded-lg font-semibold text-sm uppercase tracking-wider transition-all"
                  style={{
                    background: "linear-gradient(135deg, rgba(100, 150, 255, 0.4) 0%, rgba(80, 130, 230, 0.3) 100%)",
                    border: "1px solid rgba(150, 180, 255, 0.4)",
                    color: "rgba(200, 220, 255, 0.95)",
                    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.3)",
                  }}
                  onMouseEnter={() => play("hover")}
                >
                  Browse Beta Games
                </Link>
              </GameCardContent>
            </GameCard>
          </motion.div>
        ) : (
          <div className="w-full max-w-5xl space-y-6">
            {tests.map((test, index) => (
              <motion.div
                key={test.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.2 + index * 0.1 }}
              >
                <GameCard>
                  <GameCardContent className="p-6">
                    <div className="flex gap-6">
                      {/* Game Cover */}
                      <div
                        className="w-32 h-32 rounded-lg overflow-hidden flex-shrink-0"
                        style={{
                          background: "rgba(100, 150, 255, 0.1)",
                          border: "1px solid rgba(150, 180, 255, 0.3)",
                        }}
                      >
                        {test.game.coverUrl ? (
                          <img
                            src={test.game.coverUrl}
                            alt={test.game.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <FlaskConical size={48} style={{ color: "rgba(150, 180, 255, 0.5)" }} />
                          </div>
                        )}
                      </div>

                      {/* Game Info */}
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3
                              className="text-xl font-bold mb-1 pixelized"
                              style={{
                                color: "rgba(180, 220, 180, 0.95)",
                                textShadow: "0 0 6px rgba(120, 200, 120, 0.5), 1px 1px 0px rgba(0, 0, 0, 0.8)",
                              }}
                            >
                              {test.game.title}
                            </h3>
                            <p className="text-sm" style={{ color: "rgba(200, 240, 200, 0.6)" }}>
                              by {test.game.developer.name}
                            </p>
                          </div>
                          <Link
                            href={`/profile/gamer/beta/${test.gameId}`}
                            className="px-4 py-2 rounded-lg font-semibold text-xs uppercase tracking-wider transition-all"
                            style={{
                              background: "rgba(100, 150, 255, 0.2)",
                              border: "1px solid rgba(150, 180, 255, 0.4)",
                              color: "rgba(200, 220, 255, 0.95)",
                            }}
                            onMouseEnter={() => play("hover")}
                          >
                            View Details
                          </Link>
                        </div>

                        {/* Progress Bar */}
                        <div className="mb-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs" style={{ color: "rgba(200, 240, 200, 0.7)" }}>
                              Progress
                            </span>
                            <span className="text-xs font-bold" style={{ color: "rgba(150, 250, 150, 0.9)" }}>
                              {test.tasksCompleted} / {test.totalTasks} tasks
                            </span>
                          </div>
                          <div
                            className="h-2 rounded-full overflow-hidden"
                            style={{
                              background: "rgba(100, 150, 255, 0.2)",
                              border: "1px solid rgba(150, 180, 255, 0.3)",
                            }}
                          >
                            <div
                              className="h-full transition-all duration-500"
                              style={{
                                width: `${test.progress}%`,
                                background: "linear-gradient(90deg, rgba(100, 200, 100, 0.8) 0%, rgba(150, 250, 150, 0.9) 100%)",
                                boxShadow: "0 0 8px rgba(100, 200, 100, 0.6)",
                              }}
                            />
                          </div>
                        </div>

                        {/* Stats */}
                        <div className="flex gap-6 text-sm">
                          <div className="flex items-center gap-2">
                            <Bug className="w-4 h-4" style={{ color: "rgba(250, 150, 150, 0.9)" }} />
                            <span style={{ color: "rgba(200, 240, 200, 0.7)" }}>
                              {test.bugsReported} bugs reported
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4" style={{ color: "rgba(150, 200, 255, 0.9)" }} />
                            <span style={{ color: "rgba(200, 240, 200, 0.7)" }}>
                              {Math.floor(test.timeSpent / 60)}h {test.timeSpent % 60}m played
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </GameCardContent>
                </GameCard>
              </motion.div>
            ))}
          </div>
        )}
      </motion.main>
    </div>
  );
}

