"use client";

import Link from "next/link";
import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GameCard, GameCardContent } from "@/components/game/GameCard";
import Particles from "@/components/fx/Particles";
import { useRouter } from "next/navigation";
import {
  Shield,
  ArrowLeft,
  Search,
  ChevronLeft,
  ChevronRight,
  Users,
  Gamepad2,
  Crown,
  Mail,
  Calendar,
  MoreVertical,
  UserCog,
  Trash2,
  Eye,
  X,
  CheckCircle,
  XCircle,
  Code2,
  User as UserIcon,
} from "lucide-react";

interface User {
  id: string;
  name: string;
  email: string;
  displayName: string | null;
  image: string | null;
  role: string;
  emailVerified: Date | null;
  subscriptionTier: string;
  subscriptionStatus: string;
  xp: number;
  level: number;
  createdAt: string;
  updatedAt: string;
  _count: {
    games: number;
    ratings: number;
    favorites: number;
  };
  developerProfile: {
    id: string;
    studioName: string | null;
    verificationStatus: string;
    isIndieEligible: boolean;
  } | null;
}

interface UserStats {
  total: number;
  developers: number;
  gamers: number;
  admins: number;
}

export default function AdminUsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "20",
        role: roleFilter,
        search,
      });

      const res = await fetch(`/api/admin/users?${params}`);
      if (!res.ok) {
        if (res.status === 401 || res.status === 403) {
          router.push("/login");
          return;
        }
        throw new Error("Failed to fetch users");
      }

      const data = await res.json();
      setUsers(data.users);
      setStats(data.stats);
      setTotalPages(data.pagination.totalPages);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setIsLoading(false);
    }
  }, [page, roleFilter, search, router]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchUsers();
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    setActionLoading(true);
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      });

      if (!res.ok) {
        const data = await res.json();
        alert(data.error || "Failed to update user");
        return;
      }

      // Refresh the list
      fetchUsers();
      setShowModal(false);
      setSelectedUser(null);
    } catch (error) {
      console.error("Error updating user:", error);
      alert("Failed to update user");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    setActionLoading(true);
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const data = await res.json();
        alert(data.error || "Failed to delete user");
        return;
      }

      // Refresh the list
      fetchUsers();
      setShowDeleteConfirm(false);
      setShowModal(false);
      setSelectedUser(null);
    } catch (error) {
      console.error("Error deleting user:", error);
      alert("Failed to delete user");
    } finally {
      setActionLoading(false);
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "ADMIN":
        return <Shield className="w-4 h-4" />;
      case "DEVELOPER":
        return <Code2 className="w-4 h-4" />;
      default:
        return <Gamepad2 className="w-4 h-4" />;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "ADMIN":
        return "bg-amber-500/20 text-amber-300 border-amber-400/30";
      case "DEVELOPER":
        return "bg-purple-500/20 text-purple-300 border-purple-400/30";
      default:
        return "bg-blue-500/20 text-blue-300 border-blue-400/30";
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
              <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-600/20 border border-blue-400/30">
                <Users className="w-8 h-8 text-blue-400" style={{ filter: "drop-shadow(0 0 8px rgba(59, 130, 246, 0.5))" }} />
              </div>
              <div>
                <h1
                  className="text-2xl font-bold tracking-wider uppercase pixelized"
                  style={{
                    textShadow: `
                      0 0 12px rgba(59, 130, 246, 0.8),
                      0 0 24px rgba(37, 99, 235, 0.6),
                      2px 2px 0px rgba(0, 0, 0, 0.9)
                    `,
                    color: "rgba(191, 219, 254, 0.95)",
                  }}
                >
                  User Management
                </h1>
                <p
                  className="text-sm font-semibold tracking-wide pixelized"
                  style={{ textShadow: "1px 1px 0px rgba(0, 0, 0, 0.8)", color: "rgba(200, 240, 200, 0.7)" }}
                >
                  Manage platform users and roles
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
                    onClick={() => { setRoleFilter("ALL"); setPage(1); }}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                      roleFilter === "ALL" ? "bg-white/10" : "hover:bg-white/5"
                    }`}
                  >
                    <Users className="w-4 h-4 text-gray-400" />
                    <span style={{ color: "rgba(200, 240, 200, 0.9)" }}>All</span>
                    <span className="text-sm px-2 py-0.5 rounded bg-white/10" style={{ color: "rgba(200, 240, 200, 0.7)" }}>
                      {stats.total}
                    </span>
                  </button>
                  <button
                    onClick={() => { setRoleFilter("DEVELOPER"); setPage(1); }}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                      roleFilter === "DEVELOPER" ? "bg-purple-500/20" : "hover:bg-white/5"
                    }`}
                  >
                    <Code2 className="w-4 h-4 text-purple-400" />
                    <span style={{ color: "rgba(196, 181, 253, 0.9)" }}>Developers</span>
                    <span className="text-sm px-2 py-0.5 rounded bg-purple-500/20" style={{ color: "rgba(196, 181, 253, 0.7)" }}>
                      {stats.developers}
                    </span>
                  </button>
                  <button
                    onClick={() => { setRoleFilter("GAMER"); setPage(1); }}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                      roleFilter === "GAMER" ? "bg-blue-500/20" : "hover:bg-white/5"
                    }`}
                  >
                    <Gamepad2 className="w-4 h-4 text-blue-400" />
                    <span style={{ color: "rgba(147, 197, 253, 0.9)" }}>Gamers</span>
                    <span className="text-sm px-2 py-0.5 rounded bg-blue-500/20" style={{ color: "rgba(147, 197, 253, 0.7)" }}>
                      {stats.gamers}
                    </span>
                  </button>
                  <button
                    onClick={() => { setRoleFilter("ADMIN"); setPage(1); }}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                      roleFilter === "ADMIN" ? "bg-amber-500/20" : "hover:bg-white/5"
                    }`}
                  >
                    <Shield className="w-4 h-4 text-amber-400" />
                    <span style={{ color: "rgba(253, 230, 138, 0.9)" }}>Admins</span>
                    <span className="text-sm px-2 py-0.5 rounded bg-amber-500/20" style={{ color: "rgba(253, 230, 138, 0.7)" }}>
                      {stats.admins}
                    </span>
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
                placeholder="Search by name or email..."
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

        {/* Users List */}
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
                  <div className="text-lg" style={{ color: "rgba(200, 240, 200, 0.7)" }}>Loading users...</div>
                </div>
              ) : users.length === 0 ? (
                <div className="p-12 text-center">
                  <Users className="w-12 h-12 mx-auto mb-4" style={{ color: "rgba(200, 240, 200, 0.3)" }} />
                  <div className="text-lg" style={{ color: "rgba(200, 240, 200, 0.7)" }}>No users found</div>
                </div>
              ) : (
                <div className="divide-y divide-white/10">
                  {users.map((user) => (
                    <div
                      key={user.id}
                      className="p-4 hover:bg-white/5 transition-colors cursor-pointer"
                      onClick={() => { setSelectedUser(user); setShowModal(true); }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div
                            className="w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold"
                            style={{
                              background: "linear-gradient(135deg, rgba(100, 200, 100, 0.3) 0%, rgba(80, 180, 80, 0.2) 100%)",
                              border: "1px solid rgba(200, 240, 200, 0.3)",
                              color: "rgba(200, 240, 200, 0.9)",
                            }}
                          >
                            {user.image ? (
                              <img src={user.image} alt={user.name} className="w-full h-full rounded-full object-cover" />
                            ) : (
                              user.name?.charAt(0).toUpperCase() || "?"
                            )}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-semibold" style={{ color: "rgba(200, 240, 200, 0.95)" }}>
                                {user.displayName || user.name}
                              </span>
                              <span className={`text-xs px-2 py-0.5 rounded-full border flex items-center gap-1 ${getRoleColor(user.role)}`}>
                                {getRoleIcon(user.role)}
                                {user.role}
                              </span>
                              {user.emailVerified && (
                                <CheckCircle className="w-4 h-4 text-green-400" title="Email verified" />
                              )}
                            </div>
                            <div className="flex items-center gap-3 text-sm" style={{ color: "rgba(200, 240, 200, 0.6)" }}>
                              <span className="flex items-center gap-1">
                                <Mail className="w-3 h-3" />
                                {user.email}
                              </span>
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {new Date(user.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          {user.role === "DEVELOPER" && (
                            <div className="text-right">
                              <div className="text-sm" style={{ color: "rgba(200, 240, 200, 0.9)" }}>
                                {user._count.games} games
                              </div>
                              {user.developerProfile?.isIndieEligible && (
                                <span className="text-xs text-green-400">Indie Verified</span>
                              )}
                            </div>
                          )}
                          <div className="flex items-center gap-2">
                            {user.subscriptionTier !== "FREE" && (
                              <Crown className="w-5 h-5 text-amber-400" title={`${user.subscriptionTier} subscriber`} />
                            )}
                            <span className="text-sm px-2 py-1 rounded" style={{ background: "rgba(255, 255, 255, 0.1)", color: "rgba(200, 240, 200, 0.7)" }}>
                              Lvl {user.level}
                            </span>
                          </div>
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
                    style={{
                      background: "rgba(255, 255, 255, 0.1)",
                      border: "1px solid rgba(255, 255, 255, 0.2)",
                    }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <ChevronLeft className="w-5 h-5" style={{ color: "rgba(200, 240, 200, 0.9)" }} />
                  </motion.button>
                  <span style={{ color: "rgba(200, 240, 200, 0.7)" }}>
                    Page {page} of {totalPages}
                  </span>
                  <motion.button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="p-2 rounded-lg disabled:opacity-50"
                    style={{
                      background: "rgba(255, 255, 255, 0.1)",
                      border: "1px solid rgba(255, 255, 255, 0.2)",
                    }}
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

      {/* User Detail Modal */}
      <AnimatePresence>
        {showModal && selectedUser && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div
              className="absolute inset-0 bg-black/80"
              onClick={() => { setShowModal(false); setSelectedUser(null); setShowDeleteConfirm(false); }}
            />
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
                    className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold"
                    style={{
                      background: "linear-gradient(135deg, rgba(100, 200, 100, 0.3) 0%, rgba(80, 180, 80, 0.2) 100%)",
                      border: "1px solid rgba(200, 240, 200, 0.3)",
                      color: "rgba(200, 240, 200, 0.9)",
                    }}
                  >
                    {selectedUser.image ? (
                      <img src={selectedUser.image} alt={selectedUser.name} className="w-full h-full rounded-full object-cover" />
                    ) : (
                      selectedUser.name?.charAt(0).toUpperCase() || "?"
                    )}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold" style={{ color: "rgba(200, 240, 200, 0.95)" }}>
                      {selectedUser.displayName || selectedUser.name}
                    </h3>
                    <p className="text-sm" style={{ color: "rgba(200, 240, 200, 0.6)" }}>{selectedUser.email}</p>
                  </div>
                </div>
                <button
                  onClick={() => { setShowModal(false); setSelectedUser(null); setShowDeleteConfirm(false); }}
                  className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                >
                  <X className="w-5 h-5" style={{ color: "rgba(200, 240, 200, 0.7)" }} />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 space-y-6">
                {/* User Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs uppercase tracking-wider" style={{ color: "rgba(200, 240, 200, 0.5)" }}>
                      Current Role
                    </label>
                    <div className={`mt-1 inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border ${getRoleColor(selectedUser.role)}`}>
                      {getRoleIcon(selectedUser.role)}
                      {selectedUser.role}
                    </div>
                  </div>
                  <div>
                    <label className="text-xs uppercase tracking-wider" style={{ color: "rgba(200, 240, 200, 0.5)" }}>
                      Subscription
                    </label>
                    <div className="mt-1 flex items-center gap-2" style={{ color: "rgba(200, 240, 200, 0.9)" }}>
                      {selectedUser.subscriptionTier !== "FREE" && <Crown className="w-4 h-4 text-amber-400" />}
                      {selectedUser.subscriptionTier}
                    </div>
                  </div>
                  <div>
                    <label className="text-xs uppercase tracking-wider" style={{ color: "rgba(200, 240, 200, 0.5)" }}>
                      Level
                    </label>
                    <div className="mt-1" style={{ color: "rgba(200, 240, 200, 0.9)" }}>
                      Level {selectedUser.level} ({selectedUser.xp} XP)
                    </div>
                  </div>
                  <div>
                    <label className="text-xs uppercase tracking-wider" style={{ color: "rgba(200, 240, 200, 0.5)" }}>
                      Joined
                    </label>
                    <div className="mt-1" style={{ color: "rgba(200, 240, 200, 0.9)" }}>
                      {new Date(selectedUser.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4 p-4 rounded-lg" style={{ background: "rgba(255, 255, 255, 0.05)" }}>
                  <div className="text-center">
                    <div className="text-2xl font-bold" style={{ color: "rgba(200, 240, 200, 0.9)" }}>
                      {selectedUser._count.games}
                    </div>
                    <div className="text-xs" style={{ color: "rgba(200, 240, 200, 0.5)" }}>Games</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold" style={{ color: "rgba(200, 240, 200, 0.9)" }}>
                      {selectedUser._count.ratings}
                    </div>
                    <div className="text-xs" style={{ color: "rgba(200, 240, 200, 0.5)" }}>Ratings</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold" style={{ color: "rgba(200, 240, 200, 0.9)" }}>
                      {selectedUser._count.favorites}
                    </div>
                    <div className="text-xs" style={{ color: "rgba(200, 240, 200, 0.5)" }}>Favorites</div>
                  </div>
                </div>

                {/* Role Change */}
                {!showDeleteConfirm && (
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: "rgba(200, 240, 200, 0.8)" }}>
                      Change Role
                    </label>
                    <div className="flex gap-2">
                      {["GAMER", "DEVELOPER", "ADMIN"].map((role) => (
                        <motion.button
                          key={role}
                          onClick={() => handleRoleChange(selectedUser.id, role)}
                          disabled={actionLoading || selectedUser.role === role}
                          className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium flex items-center justify-center gap-2 disabled:opacity-50 ${
                            selectedUser.role === role ? "ring-2 ring-green-400" : ""
                          }`}
                          style={{
                            background: selectedUser.role === role ? "rgba(100, 200, 100, 0.2)" : "rgba(255, 255, 255, 0.1)",
                            border: "1px solid rgba(255, 255, 255, 0.2)",
                            color: "rgba(200, 240, 200, 0.9)",
                          }}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          {role === "ADMIN" && <Shield className="w-4 h-4" />}
                          {role === "DEVELOPER" && <Code2 className="w-4 h-4" />}
                          {role === "GAMER" && <Gamepad2 className="w-4 h-4" />}
                          {role}
                        </motion.button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Delete Confirmation */}
                {showDeleteConfirm ? (
                  <div className="p-4 rounded-lg" style={{ background: "rgba(239, 68, 68, 0.1)", border: "1px solid rgba(239, 68, 68, 0.3)" }}>
                    <p className="text-center mb-4" style={{ color: "rgba(252, 165, 165, 0.9)" }}>
                      Are you sure you want to delete this user? This action cannot be undone.
                    </p>
                    <div className="flex gap-4">
                      <motion.button
                        onClick={() => setShowDeleteConfirm(false)}
                        className="flex-1 py-2 rounded-lg"
                        style={{
                          background: "rgba(255, 255, 255, 0.1)",
                          border: "1px solid rgba(255, 255, 255, 0.2)",
                          color: "rgba(200, 240, 200, 0.9)",
                        }}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        Cancel
                      </motion.button>
                      <motion.button
                        onClick={() => handleDeleteUser(selectedUser.id)}
                        disabled={actionLoading}
                        className="flex-1 py-2 rounded-lg disabled:opacity-50"
                        style={{
                          background: "rgba(239, 68, 68, 0.3)",
                          border: "1px solid rgba(239, 68, 68, 0.5)",
                          color: "rgba(252, 165, 165, 0.95)",
                        }}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        {actionLoading ? "Deleting..." : "Delete User"}
                      </motion.button>
                    </div>
                  </div>
                ) : selectedUser.role !== "ADMIN" && (
                  <motion.button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="w-full py-2 rounded-lg flex items-center justify-center gap-2"
                    style={{
                      background: "rgba(239, 68, 68, 0.1)",
                      border: "1px solid rgba(239, 68, 68, 0.3)",
                      color: "rgba(252, 165, 165, 0.8)",
                    }}
                    whileHover={{ scale: 1.01, background: "rgba(239, 68, 68, 0.2)" }}
                    whileTap={{ scale: 0.99 }}
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete User
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

