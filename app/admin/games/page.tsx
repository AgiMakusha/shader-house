"use client";

import Link from "next/link";
import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GameCard, GameCardContent } from "@/components/game/GameCard";
import Particles from "@/components/fx/Particles";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Search,
  ChevronLeft,
  ChevronRight,
  Gamepad2,
  Star,
  Heart,
  Download,
  Calendar,
  MoreVertical,
  Trash2,
  X,
  CheckCircle,
  Clock,
  FileEdit,
  Sparkles,
  Eye,
  DollarSign,
  Users,
} from "lucide-react";

interface Game {
  id: string;
  slug: string;
  title: string;
  tagline: string;
  coverUrl: string | null;
  priceCents: number;
  releaseStatus: string;
  views: number;
  downloads: number;
  avgRating: number;
  isFeatured: boolean;
  createdAt: string;
  developer: {
    id: string;
    name: string;
    email: string;
  };
  _count: {
    ratings: number;
    favorites: number;
    purchases: number;
    betaTesters: number;
  };
}

interface GameStats {
  total: number;
  beta: number;
  released: number;
}

export default function AdminGamesPage() {
  const router = useRouter();
  const [games, setGames] = useState<Game[]>([]);
  const [stats, setStats] = useState<GameStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchGames = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "20",
        status: statusFilter,
        search,
      });

      const res = await fetch(`/api/admin/games?${params}`);
      if (!res.ok) {
        if (res.status === 401 || res.status === 403) {
          router.push("/login");
          return;
        }
        throw new Error("Failed to fetch games");
      }

      const data = await res.json();
      setGames(data.games);
      setStats(data.stats);
      setTotalPages(data.pagination.totalPages);
    } catch (error) {
      console.error("Error fetching games:", error);
    } finally {
      setIsLoading(false);
    }
  }, [page, statusFilter, search, router]);

  useEffect(() => {
    fetchGames();
  }, [fetchGames]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchGames();
  };

  const handleToggleFeatured = async (gameId: string, featured: boolean) => {
    setActionLoading(true);
    try {
      const res = await fetch(`/api/admin/games/${gameId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isFeatured: featured }),
      });

      if (!res.ok) {
        const data = await res.json();
        alert(data.error || "Failed to update game");
        return;
      }

      fetchGames();
      if (selectedGame?.id === gameId) {
        setSelectedGame({ ...selectedGame, isFeatured: featured });
      }
    } catch (error) {
      console.error("Error updating game:", error);
      alert("Failed to update game");
    } finally {
      setActionLoading(false);
    }
  };

  const handleStatusChange = async (gameId: string, newStatus: string) => {
    setActionLoading(true);
    try {
      const res = await fetch(`/api/admin/games/${gameId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ releaseStatus: newStatus }),
      });

      if (!res.ok) {
        const data = await res.json();
        alert(data.error || "Failed to update game");
        return;
      }

      fetchGames();
      setShowModal(false);
    } catch (error) {
      console.error("Error updating game:", error);
      alert("Failed to update game");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteGame = async (gameId: string) => {
    setActionLoading(true);
    try {
      const res = await fetch(`/api/admin/games/${gameId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const data = await res.json();
        alert(data.error || "Failed to delete game");
        return;
      }

      fetchGames();
      setShowDeleteConfirm(false);
      setShowModal(false);
      setSelectedGame(null);
    } catch (error) {
      console.error("Error deleting game:", error);
      alert("Failed to delete game");
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "RELEASED":
        return "bg-green-500/20 text-green-300 border-green-400/30";
      case "BETA":
        return "bg-amber-500/20 text-amber-300 border-amber-400/30";
      default:
        return "bg-gray-500/20 text-gray-300 border-gray-400/30";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "RELEASED":
        return <CheckCircle className="w-4 h-4" />;
      case "BETA":
        return <Clock className="w-4 h-4" />;
      default:
        return <FileEdit className="w-4 h-4" />;
    }
  };

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
                style={{
                  background: "rgba(255, 255, 255, 0.1)",
                  border: "1px solid rgba(255, 255, 255, 0.2)",
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <ArrowLeft className="w-5 h-5" style={{ color: "rgba(200, 240, 200, 0.9)" }} />
              </motion.button>
            </Link>
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-600/20 border border-purple-400/30">
                <Gamepad2 className="w-8 h-8 text-purple-400" style={{ filter: "drop-shadow(0 0 8px rgba(168, 85, 247, 0.5))" }} />
              </div>
              <div>
                <h1
                  className="text-2xl font-bold tracking-wider uppercase pixelized"
                  style={{
                    textShadow: `0 0 12px rgba(168, 85, 247, 0.8), 2px 2px 0px rgba(0, 0, 0, 0.9)`,
                    color: "rgba(221, 214, 254, 0.95)",
                  }}
                >
                  Game Moderation
                </h1>
                <p className="text-sm font-semibold pixelized" style={{ color: "rgba(200, 240, 200, 0.7)" }}>
                  Review and moderate platform games
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Stats Bar */}
        {stats && (
          <motion.div
            className="w-full max-w-6xl mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <GameCard>
              <GameCardContent className="p-4">
                <div className="flex flex-wrap gap-6 justify-center md:justify-start">
                  <button
                    onClick={() => { setStatusFilter("ALL"); setPage(1); }}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${statusFilter === "ALL" ? "bg-white/10" : "hover:bg-white/5"}`}
                  >
                    <Gamepad2 className="w-4 h-4 text-gray-400" />
                    <span style={{ color: "rgba(200, 240, 200, 0.9)" }}>All</span>
                    <span className="text-sm px-2 py-0.5 rounded bg-white/10" style={{ color: "rgba(200, 240, 200, 0.7)" }}>{stats.total}</span>
                  </button>
                  <button
                    onClick={() => { setStatusFilter("RELEASED"); setPage(1); }}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${statusFilter === "RELEASED" ? "bg-green-500/20" : "hover:bg-white/5"}`}
                  >
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    <span style={{ color: "rgba(187, 247, 208, 0.9)" }}>Released</span>
                    <span className="text-sm px-2 py-0.5 rounded bg-green-500/20" style={{ color: "rgba(187, 247, 208, 0.7)" }}>{stats.released}</span>
                  </button>
                  <button
                    onClick={() => { setStatusFilter("BETA"); setPage(1); }}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${statusFilter === "BETA" ? "bg-amber-500/20" : "hover:bg-white/5"}`}
                  >
                    <Clock className="w-4 h-4 text-amber-400" />
                    <span style={{ color: "rgba(253, 230, 138, 0.9)" }}>Beta</span>
                    <span className="text-sm px-2 py-0.5 rounded bg-amber-500/20" style={{ color: "rgba(253, 230, 138, 0.7)" }}>{stats.beta}</span>
                  </button>
                </div>
              </GameCardContent>
            </GameCard>
          </motion.div>
        )}

        {/* Search */}
        <motion.div
          className="w-full max-w-6xl mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <form onSubmit={handleSearch} className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: "rgba(200, 240, 200, 0.5)" }} />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by title or developer..."
                className="w-full pl-10 pr-4 py-3 rounded-lg text-sm"
                style={{
                  background: "rgba(255, 255, 255, 0.1)",
                  border: "1px solid rgba(255, 255, 255, 0.2)",
                  color: "rgba(200, 240, 200, 0.95)",
                }}
              />
            </div>
            <motion.button
              type="submit"
              className="px-6 py-3 rounded-lg font-semibold text-sm uppercase tracking-wider"
              style={{
                background: "linear-gradient(135deg, rgba(100, 200, 100, 0.3) 0%, rgba(80, 180, 80, 0.2) 100%)",
                border: "1px solid rgba(200, 240, 200, 0.3)",
                color: "rgba(200, 240, 200, 0.95)",
              }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Search
            </motion.button>
          </form>
        </motion.div>

        {/* Games List */}
        <motion.div
          className="w-full max-w-6xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <GameCard>
            <GameCardContent className="p-0">
              {isLoading ? (
                <div className="p-12 text-center">
                  <div className="text-lg" style={{ color: "rgba(200, 240, 200, 0.7)" }}>Loading games...</div>
                </div>
              ) : games.length === 0 ? (
                <div className="p-12 text-center">
                  <Gamepad2 className="w-12 h-12 mx-auto mb-4" style={{ color: "rgba(200, 240, 200, 0.3)" }} />
                  <div className="text-lg" style={{ color: "rgba(200, 240, 200, 0.7)" }}>No games found</div>
                </div>
              ) : (
                <div className="divide-y divide-white/10">
                  {games.map((game) => (
                    <div
                      key={game.id}
                      className="p-4 hover:bg-white/5 transition-colors cursor-pointer"
                      onClick={() => { setSelectedGame(game); setShowModal(true); }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div
                            className="w-16 h-16 rounded-lg flex items-center justify-center overflow-hidden"
                            style={{
                              background: "linear-gradient(135deg, rgba(168, 85, 247, 0.3) 0%, rgba(219, 39, 119, 0.2) 100%)",
                              border: "1px solid rgba(168, 85, 247, 0.3)",
                            }}
                          >
                            {game.coverUrl ? (
                              <img src={game.coverUrl} alt={game.title} className="w-full h-full object-cover" />
                            ) : (
                              <Gamepad2 className="w-8 h-8 text-purple-400" />
                            )}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-semibold" style={{ color: "rgba(200, 240, 200, 0.95)" }}>{game.title}</span>
                              <span className={`text-xs px-2 py-0.5 rounded-full border flex items-center gap-1 ${getStatusColor(game.releaseStatus)}`}>
                                {getStatusIcon(game.releaseStatus)}
                                {game.releaseStatus}
                              </span>
                              {game.isFeatured && (
                                <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/30 flex items-center gap-1">
                                  <Sparkles className="w-3 h-3" />
                                  Featured
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-3 text-sm" style={{ color: "rgba(200, 240, 200, 0.6)" }}>
                              <span>by {game.developer.name}</span>
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {new Date(game.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-6">
                          <div className="flex items-center gap-4 text-sm" style={{ color: "rgba(200, 240, 200, 0.7)" }}>
                            <span className="flex items-center gap-1" title="Views">
                              <Eye className="w-4 h-4" />
                              {game.views}
                            </span>
                            <span className="flex items-center gap-1" title="Downloads">
                              <Download className="w-4 h-4" />
                              {game.downloads}
                            </span>
                            <span className="flex items-center gap-1" title="Favorites">
                              <Heart className="w-4 h-4" />
                              {game._count.favorites}
                            </span>
                            <span className="flex items-center gap-1" title="Rating">
                              <Star className="w-4 h-4 text-amber-400" />
                              {game.avgRating.toFixed(1)}
                            </span>
                          </div>
                          <span className="text-sm font-medium" style={{ color: "rgba(187, 247, 208, 0.9)" }}>
                            {game.priceCents === 0 ? "Free" : `$${(game.priceCents / 100).toFixed(2)}`}
                          </span>
                          <MoreVertical className="w-5 h-5" style={{ color: "rgba(200, 240, 200, 0.5)" }} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="p-4 border-t border-white/10 flex items-center justify-center gap-4">
                  <motion.button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="p-2 rounded-lg disabled:opacity-50"
                    style={{ background: "rgba(255, 255, 255, 0.1)", border: "1px solid rgba(255, 255, 255, 0.2)" }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <ChevronLeft className="w-5 h-5" style={{ color: "rgba(200, 240, 200, 0.9)" }} />
                  </motion.button>
                  <span style={{ color: "rgba(200, 240, 200, 0.7)" }}>Page {page} of {totalPages}</span>
                  <motion.button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="p-2 rounded-lg disabled:opacity-50"
                    style={{ background: "rgba(255, 255, 255, 0.1)", border: "1px solid rgba(255, 255, 255, 0.2)" }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <ChevronRight className="w-5 h-5" style={{ color: "rgba(200, 240, 200, 0.9)" }} />
                  </motion.button>
                </div>
              )}
            </GameCardContent>
          </GameCard>
        </motion.div>
      </motion.main>

      {/* Game Detail Modal */}
      <AnimatePresence>
        {showModal && selectedGame && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="absolute inset-0 bg-black/80" onClick={() => { setShowModal(false); setSelectedGame(null); setShowDeleteConfirm(false); }} />
            <motion.div
              className="relative w-full max-w-lg rounded-2xl overflow-hidden"
              style={{
                background: "linear-gradient(135deg, rgba(20, 40, 30, 0.98) 0%, rgba(15, 30, 25, 0.98) 100%)",
                border: "1px solid rgba(200, 240, 200, 0.2)",
                boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
              }}
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
            >
              {/* Modal Header */}
              <div className="p-6 border-b border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div
                    className="w-16 h-16 rounded-lg flex items-center justify-center overflow-hidden"
                    style={{ background: "linear-gradient(135deg, rgba(168, 85, 247, 0.3) 0%, rgba(219, 39, 119, 0.2) 100%)", border: "1px solid rgba(168, 85, 247, 0.3)" }}
                  >
                    {selectedGame.coverUrl ? (
                      <img src={selectedGame.coverUrl} alt={selectedGame.title} className="w-full h-full object-cover" />
                    ) : (
                      <Gamepad2 className="w-8 h-8 text-purple-400" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold" style={{ color: "rgba(200, 240, 200, 0.95)" }}>{selectedGame.title}</h3>
                    <p className="text-sm" style={{ color: "rgba(200, 240, 200, 0.6)" }}>by {selectedGame.developer.name}</p>
                  </div>
                </div>
                <button onClick={() => { setShowModal(false); setSelectedGame(null); setShowDeleteConfirm(false); }} className="p-2 rounded-lg hover:bg-white/10 transition-colors">
                  <X className="w-5 h-5" style={{ color: "rgba(200, 240, 200, 0.7)" }} />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 space-y-6">
                {/* Stats Grid */}
                <div className="grid grid-cols-4 gap-4">
                  <div className="text-center p-3 rounded-lg" style={{ background: "rgba(255, 255, 255, 0.05)" }}>
                    <Eye className="w-5 h-5 mx-auto mb-1 text-blue-400" />
                    <div className="text-lg font-bold" style={{ color: "rgba(200, 240, 200, 0.9)" }}>{selectedGame.views}</div>
                    <div className="text-xs" style={{ color: "rgba(200, 240, 200, 0.5)" }}>Views</div>
                  </div>
                  <div className="text-center p-3 rounded-lg" style={{ background: "rgba(255, 255, 255, 0.05)" }}>
                    <Download className="w-5 h-5 mx-auto mb-1 text-green-400" />
                    <div className="text-lg font-bold" style={{ color: "rgba(200, 240, 200, 0.9)" }}>{selectedGame.downloads}</div>
                    <div className="text-xs" style={{ color: "rgba(200, 240, 200, 0.5)" }}>Downloads</div>
                  </div>
                  <div className="text-center p-3 rounded-lg" style={{ background: "rgba(255, 255, 255, 0.05)" }}>
                    <Heart className="w-5 h-5 mx-auto mb-1 text-pink-400" />
                    <div className="text-lg font-bold" style={{ color: "rgba(200, 240, 200, 0.9)" }}>{selectedGame._count.favorites}</div>
                    <div className="text-xs" style={{ color: "rgba(200, 240, 200, 0.5)" }}>Favorites</div>
                  </div>
                  <div className="text-center p-3 rounded-lg" style={{ background: "rgba(255, 255, 255, 0.05)" }}>
                    <Star className="w-5 h-5 mx-auto mb-1 text-amber-400" />
                    <div className="text-lg font-bold" style={{ color: "rgba(200, 240, 200, 0.9)" }}>{selectedGame.avgRating.toFixed(1)}</div>
                    <div className="text-xs" style={{ color: "rgba(200, 240, 200, 0.5)" }}>Rating</div>
                  </div>
                </div>

                {/* Feature Toggle */}
                <div className="flex items-center justify-between p-4 rounded-lg" style={{ background: "rgba(255, 255, 255, 0.05)" }}>
                  <div className="flex items-center gap-3">
                    <Sparkles className="w-5 h-5 text-amber-400" />
                    <span style={{ color: "rgba(200, 240, 200, 0.9)" }}>Featured Game</span>
                  </div>
                  <motion.button
                    onClick={() => handleToggleFeatured(selectedGame.id, !selectedGame.isFeatured)}
                    disabled={actionLoading}
                    className={`px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50 ${selectedGame.isFeatured ? "bg-amber-500/20 text-amber-300" : "bg-white/10 text-gray-300"}`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {selectedGame.isFeatured ? "Unfeature" : "Feature"}
                  </motion.button>
                </div>

                {/* Status Change */}
                {!showDeleteConfirm && (
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: "rgba(200, 240, 200, 0.8)" }}>Change Status</label>
                    <div className="flex gap-2">
                      {["BETA", "RELEASED"].map((status) => (
                        <motion.button
                          key={status}
                          onClick={() => handleStatusChange(selectedGame.id, status)}
                          disabled={actionLoading || selectedGame.releaseStatus === status}
                          className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium flex items-center justify-center gap-2 disabled:opacity-50 ${selectedGame.releaseStatus === status ? "ring-2 ring-green-400" : ""}`}
                          style={{
                            background: selectedGame.releaseStatus === status ? "rgba(100, 200, 100, 0.2)" : "rgba(255, 255, 255, 0.1)",
                            border: "1px solid rgba(255, 255, 255, 0.2)",
                            color: "rgba(200, 240, 200, 0.9)",
                          }}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          {getStatusIcon(status)}
                          {status}
                        </motion.button>
                      ))}
                    </div>
                  </div>
                )}

                {/* View Game Link */}
                <Link href={`/games/${selectedGame.slug}`} target="_blank">
                  <motion.button
                    className="w-full py-2 rounded-lg flex items-center justify-center gap-2"
                    style={{ background: "rgba(100, 200, 100, 0.2)", border: "1px solid rgba(100, 200, 100, 0.3)", color: "rgba(187, 247, 208, 0.9)" }}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                  >
                    <Eye className="w-4 h-4" />
                    View Game Page
                  </motion.button>
                </Link>

                {/* Delete */}
                {showDeleteConfirm ? (
                  <div className="p-4 rounded-lg" style={{ background: "rgba(239, 68, 68, 0.1)", border: "1px solid rgba(239, 68, 68, 0.3)" }}>
                    <p className="text-center mb-4" style={{ color: "rgba(252, 165, 165, 0.9)" }}>
                      Are you sure you want to delete this game? This action cannot be undone.
                    </p>
                    <div className="flex gap-4">
                      <motion.button
                        onClick={() => setShowDeleteConfirm(false)}
                        className="flex-1 py-2 rounded-lg"
                        style={{ background: "rgba(255, 255, 255, 0.1)", border: "1px solid rgba(255, 255, 255, 0.2)", color: "rgba(200, 240, 200, 0.9)" }}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        Cancel
                      </motion.button>
                      <motion.button
                        onClick={() => handleDeleteGame(selectedGame.id)}
                        disabled={actionLoading}
                        className="flex-1 py-2 rounded-lg disabled:opacity-50"
                        style={{ background: "rgba(239, 68, 68, 0.3)", border: "1px solid rgba(239, 68, 68, 0.5)", color: "rgba(252, 165, 165, 0.95)" }}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        {actionLoading ? "Deleting..." : "Delete Game"}
                      </motion.button>
                    </div>
                  </div>
                ) : (
                  <motion.button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="w-full py-2 rounded-lg flex items-center justify-center gap-2"
                    style={{ background: "rgba(239, 68, 68, 0.1)", border: "1px solid rgba(239, 68, 68, 0.3)", color: "rgba(252, 165, 165, 0.8)" }}
                    whileHover={{ scale: 1.01, background: "rgba(239, 68, 68, 0.2)" }}
                    whileTap={{ scale: 0.99 }}
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete Game
                  </motion.button>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

