"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { GameCard, GameCardContent } from "@/components/game/GameCard";
import Particles from "@/components/fx/Particles";
import { useAudio } from "@/components/audio/AudioProvider";
import { useRouter } from "next/navigation";
import { 
  Shield, 
  Users, 
  Gamepad2, 
  AlertTriangle, 
  Clock, 
  CheckCircle, 
  BarChart3,
  Settings,
  FileSearch,
  Crown,
  Zap,
  DollarSign
} from "lucide-react";

interface AdminStats {
  stats: {
    users: {
      total: number;
      developers: number;
      gamers: number;
    };
    games: {
      total: number;
      beta: number;
      released: number;
    };
    moderation: {
      pendingVerifications: number;
      pendingReports: number;
    };
    subscriptions: {
      active: number;
    };
  };
  recentActivity: {
    users: Array<{
      id: string;
      name: string;
      email: string;
      role: string;
      createdAt: string;
    }>;
    games: Array<{
      id: string;
      title: string;
      slug: string;
      releaseStatus: string;
      createdAt: string;
      developer: { name: string };
    }>;
  };
}

interface RevenueData {
  overview: {
    totalPlatformRevenue: number;
    formatted: {
      totalPlatformRevenue: string;
    };
  };
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const { play } = useAudio();
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [revenue, setRevenue] = useState<RevenueData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch user profile
        const userRes = await fetch("/api/auth/me");
        if (!userRes.ok) {
          router.push("/login");
          return;
        }
        const userData = await userRes.json();
        
        if (userData.user.role !== "ADMIN") {
          router.push("/");
          return;
        }
        setUser(userData.user);

        // Fetch admin stats and revenue in parallel
        const [statsRes, revenueRes] = await Promise.all([
          fetch("/api/admin/stats"),
          fetch("/api/admin/revenue"),
        ]);

        if (statsRes.ok) {
          const statsData = await statsRes.json();
          setStats(statsData);
        }

        if (revenueRes.ok) {
          const revenueData = await revenueRes.json();
          setRevenue(revenueData);
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

  const ADMIN_MODULES = [
    {
      title: "Indie Verification",
      description: "Review developer indie status applications",
      href: "/admin/indie-verification",
      icon: FileSearch,
      badge: stats?.stats.moderation.pendingVerifications || 0,
      badgeColor: "bg-amber-500/80",
    },
    {
      title: "User Management",
      description: "Manage platform users",
      href: "/admin/users",
      icon: Users,
      badge: null,
    },
    {
      title: "Game Moderation",
      description: "Review and moderate games",
      href: "/admin/games",
      icon: Gamepad2,
      badge: null,
    },
    {
      title: "Reports",
      description: "View reported content",
      href: "/admin/reports",
      icon: AlertTriangle,
      badge: stats?.stats.moderation.pendingReports || 0,
      badgeColor: "bg-red-500/80",
    },
    {
      title: "Revenue",
      description: "Platform earnings & Stripe",
      href: "/admin/revenue",
      icon: DollarSign,
      badge: null,
    },
    {
      title: "Analytics",
      description: "Platform analytics & insights",
      href: "/admin/analytics",
      icon: BarChart3,
      badge: null,
    },
    {
      title: "Settings",
      description: "Platform configuration",
      href: "/admin/settings",
      icon: Settings,
      badge: null,
    },
  ];

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
            <div className="p-3 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-600/20 border border-amber-400/30">
              <Shield className="w-8 h-8 text-amber-400" style={{ filter: "drop-shadow(0 0 8px rgba(251, 191, 36, 0.5))" }} />
            </div>
            <div>
              <h1
                className="text-3xl font-bold tracking-wider uppercase pixelized"
                style={{
                  textShadow: `
                    0 0 12px rgba(251, 191, 36, 0.8),
                    0 0 24px rgba(245, 158, 11, 0.6),
                    2px 2px 0px rgba(0, 0, 0, 0.9)
                  `,
                  color: "rgba(253, 230, 138, 0.95)",
                }}
              >
                Admin Dashboard
              </h1>
              <p
                className="text-sm font-semibold tracking-wide uppercase pixelized"
                style={{ textShadow: "1px 1px 0px rgba(0, 0, 0, 0.8)", color: "rgba(254, 243, 199, 0.7)" }}
              >
                Welcome, {user?.name}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Link href="/">
              <motion.button
                className="px-4 py-2 rounded-lg font-semibold text-sm uppercase tracking-wider transition-all"
                style={{
                  background: "linear-gradient(135deg, rgba(100, 200, 100, 0.3) 0%, rgba(80, 180, 80, 0.2) 100%)",
                  border: "1px solid rgba(200, 240, 200, 0.3)",
                  color: "rgba(200, 240, 200, 0.95)",
                  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.3)",
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Back to Site
              </motion.button>
            </Link>
            <motion.button
              onClick={handleLogout}
              className="px-4 py-2 rounded-lg font-semibold text-sm uppercase tracking-wider transition-all"
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

        {/* Stats Overview */}
        <motion.div
          className="w-full max-w-6xl mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <GameCard>
            <GameCardContent className="p-6">
              <h2
                className="text-xl font-bold mb-6 pixelized flex items-center gap-2"
                style={{
                  textShadow: "0 0 8px rgba(251, 191, 36, 0.6), 1px 1px 0px rgba(0, 0, 0, 0.8)",
                  color: "rgba(253, 230, 138, 0.95)",
                }}
              >
                <Zap className="w-5 h-5" />
                Platform Overview
              </h2>
              
              <div className="grid grid-cols-2 md:grid-cols-6 gap-6">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-3 mb-2">
                    <Users className="w-5 h-5 text-blue-400" />
                    <span className="text-3xl font-bold" style={{ color: "rgba(147, 197, 253, 0.95)" }}>
                      {stats?.stats.users.total || 0}
                    </span>
                  </div>
                  <p className="text-sm" style={{ color: "rgba(200, 240, 200, 0.7)" }}>Total Users</p>
                </div>
                
                <div className="text-center">
                  <div className="flex items-center justify-center gap-3 mb-2">
                    <Gamepad2 className="w-5 h-5 text-purple-400" />
                    <span className="text-3xl font-bold" style={{ color: "rgba(196, 181, 253, 0.95)" }}>
                      {stats?.stats.games.total || 0}
                    </span>
                  </div>
                  <p className="text-sm" style={{ color: "rgba(200, 240, 200, 0.7)" }}>Total Games</p>
                </div>
                
                <div className="text-center">
                  <div className="flex items-center justify-center gap-3 mb-2">
                    <DollarSign className="w-5 h-5 text-emerald-400" />
                    <span className="text-3xl font-bold" style={{ color: "rgba(167, 243, 208, 0.95)" }}>
                      {revenue?.overview.formatted.totalPlatformRevenue?.replace("$", "") || "0.00"}
                    </span>
                  </div>
                  <p className="text-sm" style={{ color: "rgba(200, 240, 200, 0.7)" }}>Revenue</p>
                </div>
                
                <div className="text-center">
                  <div className="flex items-center justify-center gap-3 mb-2">
                    <AlertTriangle className="w-5 h-5 text-red-400" />
                    <span className="text-3xl font-bold" style={{ color: "rgba(252, 165, 165, 0.95)" }}>
                      {stats?.stats.moderation.pendingReports || 0}
                    </span>
                  </div>
                  <p className="text-sm" style={{ color: "rgba(200, 240, 200, 0.7)" }}>Reports</p>
                </div>
                
                <div className="text-center">
                  <div className="flex items-center justify-center gap-3 mb-2">
                    <Clock className="w-5 h-5 text-amber-400" />
                    <span className="text-3xl font-bold" style={{ color: "rgba(253, 230, 138, 0.95)" }}>
                      {stats?.stats.moderation.pendingVerifications || 0}
                    </span>
                  </div>
                  <p className="text-sm" style={{ color: "rgba(200, 240, 200, 0.7)" }}>Pending Reviews</p>
                </div>
                
                <div className="text-center">
                  <div className="flex items-center justify-center gap-3 mb-2">
                    <Crown className="w-5 h-5 text-green-400" />
                    <span className="text-3xl font-bold" style={{ color: "rgba(187, 247, 208, 0.95)" }}>
                      {stats?.stats.subscriptions.active || 0}
                    </span>
                  </div>
                  <p className="text-sm" style={{ color: "rgba(200, 240, 200, 0.7)" }}>Active Subs</p>
                </div>
              </div>
            </GameCardContent>
          </GameCard>
        </motion.div>

        {/* Admin Modules Grid */}
        <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {ADMIN_MODULES.map((module, index) => {
            const Icon = module.icon;
            return (
              <motion.div
                key={module.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 + index * 0.1 }}
              >
                <Link href={module.href}>
                  <GameCard interactive>
                    <GameCardContent className="p-6 cursor-pointer relative">
                      {module.badge !== null && module.badge > 0 && (
                        <div
                          className={`absolute top-4 right-4 ${module.badgeColor} text-white text-xs font-bold px-2 py-1 rounded-full`}
                          style={{ boxShadow: "0 2px 8px rgba(0, 0, 0, 0.3)" }}
                        >
                          {module.badge}
                        </div>
                      )}
                      <Icon 
                        className="w-10 h-10 mb-4 text-amber-400" 
                        style={{ filter: "drop-shadow(0 0 8px rgba(251, 191, 36, 0.4))" }}
                      />
                      <h3
                        className="text-lg font-bold mb-2 pixelized"
                        style={{ 
                          textShadow: "0 0 6px rgba(251, 191, 36, 0.5), 1px 1px 0px rgba(0, 0, 0, 0.8)", 
                          color: "rgba(253, 230, 138, 0.95)" 
                        }}
                      >
                        {module.title}
                      </h3>
                      <p className="text-sm" style={{ color: "rgba(254, 243, 199, 0.7)" }}>
                        {module.description}
                      </p>
                    </GameCardContent>
                  </GameCard>
                </Link>
              </motion.div>
            );
          })}
        </div>

        {/* Recent Activity */}
        <motion.div
          className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          {/* Recent Users */}
          <GameCard>
            <GameCardContent className="p-6">
              <h3
                className="text-lg font-bold mb-4 pixelized flex items-center gap-2"
                style={{
                  textShadow: "0 0 6px rgba(147, 197, 253, 0.5), 1px 1px 0px rgba(0, 0, 0, 0.8)",
                  color: "rgba(186, 230, 253, 0.95)",
                }}
              >
                <Users className="w-5 h-5" />
                Recent Signups
              </h3>
              <div className="space-y-3">
                {stats?.recentActivity.users.map((u) => (
                  <div
                    key={u.id}
                    className="flex items-center justify-between p-3 rounded-lg"
                    style={{ background: "rgba(255, 255, 255, 0.05)" }}
                  >
                    <div>
                      <p className="font-medium" style={{ color: "rgba(200, 240, 200, 0.95)" }}>
                        {u.name}
                      </p>
                      <p className="text-xs" style={{ color: "rgba(200, 240, 200, 0.6)" }}>
                        {u.email}
                      </p>
                    </div>
                    <span
                      className={`text-xs px-2 py-1 rounded ${
                        u.role === "DEVELOPER" 
                          ? "bg-purple-500/20 text-purple-300" 
                          : "bg-blue-500/20 text-blue-300"
                      }`}
                    >
                      {u.role}
                    </span>
                  </div>
                ))}
                {(!stats?.recentActivity.users || stats.recentActivity.users.length === 0) && (
                  <p className="text-center py-4" style={{ color: "rgba(200, 240, 200, 0.5)" }}>
                    No recent signups
                  </p>
                )}
              </div>
            </GameCardContent>
          </GameCard>

          {/* Recent Games */}
          <GameCard>
            <GameCardContent className="p-6">
              <h3
                className="text-lg font-bold mb-4 pixelized flex items-center gap-2"
                style={{
                  textShadow: "0 0 6px rgba(196, 181, 253, 0.5), 1px 1px 0px rgba(0, 0, 0, 0.8)",
                  color: "rgba(221, 214, 254, 0.95)",
                }}
              >
                <Gamepad2 className="w-5 h-5" />
                Recent Games
              </h3>
              <div className="space-y-3">
                {stats?.recentActivity.games.map((game) => (
                  <div
                    key={game.id}
                    className="flex items-center justify-between p-3 rounded-lg"
                    style={{ background: "rgba(255, 255, 255, 0.05)" }}
                  >
                    <div>
                      <p className="font-medium" style={{ color: "rgba(200, 240, 200, 0.95)" }}>
                        {game.title}
                      </p>
                      <p className="text-xs" style={{ color: "rgba(200, 240, 200, 0.6)" }}>
                        by {game.developer.name}
                      </p>
                    </div>
                    <span
                      className={`text-xs px-2 py-1 rounded flex items-center gap-1 ${
                        game.releaseStatus === "RELEASED"
                          ? "bg-green-500/20 text-green-300"
                          : "bg-amber-500/20 text-amber-300"
                      }`}
                    >
                      {game.releaseStatus === "RELEASED" ? (
                        <CheckCircle className="w-3 h-3" />
                      ) : (
                        <Clock className="w-3 h-3" />
                      )}
                      {game.releaseStatus}
                    </span>
                  </div>
                ))}
                {(!stats?.recentActivity.games || stats.recentActivity.games.length === 0) && (
                  <p className="text-center py-4" style={{ color: "rgba(200, 240, 200, 0.5)" }}>
                    No recent games
                  </p>
                )}
              </div>
            </GameCardContent>
          </GameCard>
        </motion.div>
      </motion.main>
    </div>
  );
}

