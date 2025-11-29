"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { GameCard, GameCardContent } from "@/components/game/GameCard";
import Particles from "@/components/fx/Particles";
import { useAudio } from "@/components/audio/AudioProvider";
import { 
  ChevronLeft, 
  Bug,
  Lightbulb,
  MessageSquare,
  AlertCircle,
  CheckCircle2,
  Clock,
  XCircle
} from "lucide-react";

interface Feedback {
  id: string;
  type: 'BUG' | 'SUGGESTION' | 'GENERAL';
  title: string;
  description: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | null;
  status: 'NEW' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
  screenshot: string | null;
  createdAt: string;
  tester: {
    user: {
      name: string;
      image: string | null;
    };
  };
}

interface FeedbackStats {
  total: number;
  bugs: number;
  suggestions: number;
  new: number;
  inProgress: number;
  resolved: number;
}

export default function DeveloperFeedbackPage() {
  const router = useRouter();
  const { play } = useAudio();
  const [user, setUser] = useState<any>(null);
  const [games, setGames] = useState<any[]>([]);
  const [selectedGame, setSelectedGame] = useState<string>('');
  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [stats, setStats] = useState<FeedbackStats | null>(null);
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
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

        // Fetch developer's beta games
        const gamesResponse = await fetch("/api/games?developer=me&status=beta");
        if (gamesResponse.ok) {
          const gamesData = await gamesResponse.json();
          setGames(gamesData.items || []);
          
          // Auto-select first game if available
          if (gamesData.items && gamesData.items.length > 0) {
            setSelectedGame(gamesData.items[0].id);
          }
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

  useEffect(() => {
    if (selectedGame) {
      fetchFeedback();
    }
  }, [selectedGame]);

  const fetchFeedback = async () => {
    if (!selectedGame) return;

    try {
      const response = await fetch(`/api/beta/feedback?gameId=${selectedGame}`);
      if (response.ok) {
        const data = await response.json();
        setFeedback(data.feedback || []);
        setStats(data.stats || null);
      }
    } catch (error) {
      console.error("Error fetching feedback:", error);
    }
  };

  const updateFeedbackStatus = async (feedbackId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/beta/feedback/${feedbackId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        play("success");
        fetchFeedback(); // Refresh
      } else {
        play("error");
      }
    } catch (error) {
      console.error("Error updating feedback:", error);
      play("error");
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'BUG':
        return <Bug className="w-4 h-4" style={{ color: "rgba(250, 150, 150, 0.9)" }} />;
      case 'SUGGESTION':
        return <Lightbulb className="w-4 h-4" style={{ color: "rgba(250, 220, 100, 0.9)" }} />;
      default:
        return <MessageSquare className="w-4 h-4" style={{ color: "rgba(150, 200, 255, 0.9)" }} />;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'NEW':
        return <AlertCircle className="w-4 h-4" style={{ color: "rgba(150, 200, 255, 0.9)" }} />;
      case 'IN_PROGRESS':
        return <Clock className="w-4 h-4" style={{ color: "rgba(250, 220, 100, 0.9)" }} />;
      case 'RESOLVED':
        return <CheckCircle2 className="w-4 h-4" style={{ color: "rgba(150, 250, 150, 0.9)" }} />;
      case 'CLOSED':
        return <XCircle className="w-4 h-4" style={{ color: "rgba(200, 200, 200, 0.6)" }} />;
      default:
        return null;
    }
  };

  const getSeverityColor = (severity: string | null) => {
    switch (severity) {
      case 'CRITICAL':
        return "rgba(250, 100, 100, 0.9)";
      case 'HIGH':
        return "rgba(250, 150, 100, 0.9)";
      case 'MEDIUM':
        return "rgba(250, 220, 100, 0.9)";
      case 'LOW':
        return "rgba(150, 200, 255, 0.9)";
      default:
        return "rgba(200, 240, 200, 0.7)";
    }
  };

  const filteredFeedback = feedback.filter((item) => {
    if (filterType !== 'all' && item.type !== filterType) return false;
    if (filterStatus !== 'all' && item.status !== filterStatus) return false;
    return true;
  });

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
        <div className="w-full max-w-6xl mb-8">
          <Link
            href="/profile/developer"
            className="inline-flex items-center gap-2 mb-6 text-sm transition-colors"
            style={{ color: "rgba(200, 240, 200, 0.7)" }}
            onMouseEnter={() => play("hover")}
          >
            <ChevronLeft className="w-4 h-4" />
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
            Beta Feedback
          </h1>
          <p
            className="text-sm pixelized"
            style={{
              color: "rgba(200, 240, 200, 0.65)",
              textShadow: "1px 1px 0px rgba(0, 0, 0, 0.8)",
            }}
          >
            View and manage feedback from beta testers
          </p>
        </div>

        <div className="w-full max-w-6xl space-y-6">
          {/* Game Selector & Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <GameCard>
              <GameCardContent className="p-6">
                <div className="flex flex-col md:flex-row gap-6">
                  {/* Game Selector */}
                  <div className="flex-1">
                    <label
                      className="block text-sm font-medium mb-2"
                      style={{ color: "rgba(200, 240, 200, 0.7)" }}
                    >
                      Select Game
                    </label>
                    <select
                      value={selectedGame}
                      onChange={(e) => setSelectedGame(e.target.value)}
                      className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 focus:outline-none focus:ring-2 focus:ring-white/40 transition-all"
                      style={{ color: "rgba(200, 240, 200, 0.85)" }}
                    >
                      {games.length === 0 ? (
                        <option value="">No beta games</option>
                      ) : (
                        games.map((game) => (
                          <option key={game.id} value={game.id}>
                            {game.title}
                          </option>
                        ))
                      )}
                    </select>
                  </div>

                  {/* Stats */}
                  {stats && (
                    <div className="flex gap-6">
                      <div className="text-center">
                        <div
                          className="text-2xl font-bold pixelized"
                          style={{ color: "rgba(150, 200, 255, 0.95)" }}
                        >
                          {stats.total}
                        </div>
                        <div className="text-xs" style={{ color: "rgba(200, 240, 200, 0.6)" }}>
                          Total
                        </div>
                      </div>
                      <div className="text-center">
                        <div
                          className="text-2xl font-bold pixelized"
                          style={{ color: "rgba(250, 150, 150, 0.95)" }}
                        >
                          {stats.bugs}
                        </div>
                        <div className="text-xs" style={{ color: "rgba(200, 240, 200, 0.6)" }}>
                          Bugs
                        </div>
                      </div>
                      <div className="text-center">
                        <div
                          className="text-2xl font-bold pixelized"
                          style={{ color: "rgba(250, 220, 100, 0.95)" }}
                        >
                          {stats.suggestions}
                        </div>
                        <div className="text-xs" style={{ color: "rgba(200, 240, 200, 0.6)" }}>
                          Ideas
                        </div>
                      </div>
                      <div className="text-center">
                        <div
                          className="text-2xl font-bold pixelized"
                          style={{ color: "rgba(150, 250, 150, 0.95)" }}
                        >
                          {stats.resolved}
                        </div>
                        <div className="text-xs" style={{ color: "rgba(200, 240, 200, 0.6)" }}>
                          Resolved
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Filters */}
                <div className="flex gap-4 mt-4 pt-4 border-t" style={{ borderColor: "rgba(200, 240, 200, 0.1)" }}>
                  <div className="flex-1">
                    <label
                      className="block text-xs font-medium mb-1"
                      style={{ color: "rgba(200, 240, 200, 0.6)" }}
                    >
                      Type
                    </label>
                    <select
                      value={filterType}
                      onChange={(e) => setFilterType(e.target.value)}
                      className="w-full px-3 py-1.5 text-sm rounded-lg bg-white/10 border border-white/20 focus:outline-none focus:ring-2 focus:ring-white/40 transition-all"
                      style={{ color: "rgba(200, 240, 200, 0.85)" }}
                    >
                      <option value="all">All Types</option>
                      <option value="BUG">Bugs</option>
                      <option value="SUGGESTION">Suggestions</option>
                      <option value="GENERAL">General</option>
                    </select>
                  </div>
                  <div className="flex-1">
                    <label
                      className="block text-xs font-medium mb-1"
                      style={{ color: "rgba(200, 240, 200, 0.6)" }}
                    >
                      Status
                    </label>
                    <select
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                      className="w-full px-3 py-1.5 text-sm rounded-lg bg-white/10 border border-white/20 focus:outline-none focus:ring-2 focus:ring-white/40 transition-all"
                      style={{ color: "rgba(200, 240, 200, 0.85)" }}
                    >
                      <option value="all">All Status</option>
                      <option value="NEW">New</option>
                      <option value="IN_PROGRESS">In Progress</option>
                      <option value="RESOLVED">Resolved</option>
                      <option value="CLOSED">Closed</option>
                    </select>
                  </div>
                </div>
              </GameCardContent>
            </GameCard>
          </motion.div>

          {/* Feedback List */}
          {filteredFeedback.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <GameCard>
                <GameCardContent className="p-12 text-center">
                  <MessageSquare 
                    className="w-16 h-16 mx-auto mb-4" 
                    style={{ color: "rgba(150, 200, 255, 0.5)" }} 
                  />
                  <p className="text-sm" style={{ color: "rgba(200, 240, 200, 0.7)" }}>
                    No feedback yet
                  </p>
                </GameCardContent>
              </GameCard>
            </motion.div>
          ) : (
            <div className="space-y-4">
              {filteredFeedback.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.3 + index * 0.05 }}
                >
                  <GameCard>
                    <GameCardContent className="p-6">
                      <div className="flex gap-4">
                        {/* Type Icon */}
                        <div className="flex-shrink-0 mt-1">
                          {getTypeIcon(item.type)}
                        </div>

                        {/* Content */}
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1">
                              <h3
                                className="font-bold mb-1"
                                style={{ color: "rgba(200, 240, 200, 0.95)" }}
                              >
                                {item.title}
                              </h3>
                              <p
                                className="text-sm mb-2"
                                style={{ color: "rgba(200, 240, 200, 0.7)" }}
                              >
                                {item.description}
                              </p>
                              <div className="flex items-center gap-3 text-xs">
                                <span style={{ color: "rgba(200, 240, 200, 0.6)" }}>
                                  by {item.tester.user.name}
                                </span>
                                {item.severity && (
                                  <span
                                    className="px-2 py-0.5 rounded"
                                    style={{
                                      background: "rgba(0, 0, 0, 0.3)",
                                      color: getSeverityColor(item.severity),
                                    }}
                                  >
                                    {item.severity}
                                  </span>
                                )}
                                <span style={{ color: "rgba(200, 240, 200, 0.5)" }}>
                                  {new Date(item.createdAt).toLocaleDateString()}
                                </span>
                              </div>
                            </div>

                            {/* Screenshot */}
                            {item.screenshot && (
                              <img
                                src={item.screenshot}
                                alt="Screenshot"
                                className="w-24 h-24 rounded-lg object-cover"
                                style={{
                                  border: "1px solid rgba(200, 240, 200, 0.2)",
                                }}
                              />
                            )}
                          </div>

                          {/* Status Actions */}
                          <div className="flex items-center gap-2 mt-3">
                            <span className="text-xs" style={{ color: "rgba(200, 240, 200, 0.6)" }}>
                              Status:
                            </span>
                            <div className="flex gap-2">
                              {['NEW', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'].map((status) => (
                                <button
                                  key={status}
                                  onClick={() => updateFeedbackStatus(item.id, status)}
                                  className={`px-3 py-1 rounded text-xs font-semibold transition-all flex items-center gap-1 ${
                                    item.status === status ? 'scale-105' : 'opacity-50'
                                  }`}
                                  style={{
                                    background: item.status === status
                                      ? "rgba(100, 200, 100, 0.2)"
                                      : "rgba(100, 150, 255, 0.1)",
                                    border: item.status === status
                                      ? "1px solid rgba(150, 250, 150, 0.4)"
                                      : "1px solid rgba(150, 180, 255, 0.2)",
                                    color: "rgba(200, 240, 200, 0.9)",
                                  }}
                                  onMouseEnter={() => play("hover")}
                                >
                                  {getStatusIcon(status)}
                                  {status.replace('_', ' ')}
                                </button>
                              ))}
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
        </div>
      </motion.main>
    </div>
  );
}

