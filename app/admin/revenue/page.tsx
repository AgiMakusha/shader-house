"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { GameCard, GameCardContent } from "@/components/game/GameCard";
import Particles from "@/components/fx/Particles";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  DollarSign,
  TrendingUp,
  CreditCard,
  Wallet,
  Receipt,
  Crown,
  Gift,
  Gamepad2,
  ExternalLink,
  CheckCircle,
  AlertCircle,
  Clock,
  Zap,
} from "lucide-react";

interface RevenueData {
  overview: {
    totalVolume: number;
    totalPlatformRevenue: number;
    totalDeveloperPayouts: number;
    formatted: {
      totalVolume: string;
      totalPlatformRevenue: string;
      totalDeveloperPayouts: string;
    };
  };
  breakdown: {
    gameSales: {
      count: number;
      totalRevenue: number;
      platformFees: number;
      developerPayouts: number;
      formatted: {
        totalRevenue: string;
        platformFees: string;
        developerPayouts: string;
      };
    };
    tips: {
      count: number;
      totalRevenue: number;
      platformFees: number;
      developerPayouts: number;
      formatted: {
        totalRevenue: string;
        platformFees: string;
        developerPayouts: string;
      };
    };
    publishingFees: {
      count: number;
      totalRevenue: number;
      formatted: {
        totalRevenue: string;
      };
    };
    subscriptions: {
      activeCount: number;
      monthlyRevenue: number;
      formatted: {
        monthlyRevenue: string;
      };
    };
  };
  recentTransactions: {
    purchases: Array<{
      id: string;
      pricePaid: number;
      platformFee: number | null;
      formattedAmount: string;
      formattedPlatformFee: string;
      createdAt: string;
      game: { title: string; slug: string };
      user: { name: string; email: string };
    }>;
    tips: Array<{
      id: string;
      amountCents: number;
      platformFee: number;
      formattedAmount: string;
      formattedPlatformFee: string;
      message: string | null;
      createdAt: string;
      fromUser: { name: string };
      toUser: { name: string };
    }>;
    publishingFees: Array<{
      id: string;
      amountCents: number;
      formattedAmount: string;
      paidAt: string;
      game: { title: string; slug: string };
      developer: { name: string };
    }>;
  };
  stripeStatus: {
    configured: boolean;
    connectConfigured: boolean;
    mode: string;
    webhookConfigured: boolean;
  };
  feeConfig: {
    gameSaleFee: number;
    tipFee: number;
    creatorSupportFee: number;
    publishingFee: number;
  };
}

export default function AdminRevenuePage() {
  const router = useRouter();
  const [data, setData] = useState<RevenueData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"overview" | "transactions" | "stripe">("overview");

  useEffect(() => {
    const fetchRevenue = async () => {
      try {
        const res = await fetch("/api/admin/revenue");
        if (!res.ok) {
          if (res.status === 401 || res.status === 403) {
            router.push("/login");
            return;
          }
          throw new Error("Failed to fetch revenue");
        }
        const result = await res.json();
        setData(result);
      } catch (error) {
        console.error("Error fetching revenue:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRevenue();
  }, [router]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-dvh relative overflow-hidden flex items-center justify-center">
        <Particles />
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
          <div
            className="text-xl font-semibold pixelized"
            style={{ color: "rgba(200, 240, 200, 0.9)" }}
          >
            Loading revenue data...
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
          className="w-full max-w-6xl mb-8 flex justify-between items-center"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="flex items-center gap-5">
            <Link href="/admin">
              <motion.button
                className="p-2.5 rounded-lg transition-all"
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
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-500/20 to-green-600/20 border border-emerald-400/30">
                <DollarSign
                  className="w-8 h-8 text-emerald-400"
                  style={{ filter: "drop-shadow(0 0 8px rgba(52, 211, 153, 0.5))" }}
                />
              </div>
              <div>
                <h1
                  className="text-2xl font-bold tracking-wider uppercase pixelized"
                  style={{
                    textShadow: `0 0 12px rgba(52, 211, 153, 0.8), 2px 2px 0px rgba(0, 0, 0, 0.9)`,
                    color: "rgba(167, 243, 208, 0.95)",
                  }}
                >
                  Revenue Dashboard
                </h1>
                <p
                  className="text-sm font-semibold pixelized mt-1"
                  style={{ color: "rgba(200, 240, 200, 0.7)" }}
                >
                  Platform earnings & transactions
                </p>
              </div>
            </div>
          </div>

          {/* Stripe Mode Badge */}
          {data?.stripeStatus && (
            <div
              className={`flex items-center gap-3 px-5 py-2.5 rounded-lg ${
                data.stripeStatus.mode === "live"
                  ? "bg-emerald-500/20 border-emerald-400/30"
                  : "bg-amber-500/20 border-amber-400/30"
              } border`}
            >
              {data.stripeStatus.mode === "live" ? (
                <CheckCircle className="w-4 h-4 text-emerald-400" />
              ) : (
                <AlertCircle className="w-4 h-4 text-amber-400" />
              )}
              <span
                className="text-sm font-semibold uppercase"
                style={{
                  color:
                    data.stripeStatus.mode === "live"
                      ? "rgba(167, 243, 208, 0.9)"
                      : "rgba(253, 230, 138, 0.9)",
                }}
              >
                {data.stripeStatus.configured
                  ? data.stripeStatus.mode === "live"
                    ? "Live Mode"
                    : "Test Mode"
                  : "Demo Mode"}
              </span>
            </div>
          )}
        </motion.div>

        {/* Tab Navigation */}
        <motion.div
          className="w-full max-w-6xl mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.25 }}
        >
          <div
            className="flex gap-2 p-1.5 rounded-lg"
            style={{ background: "rgba(255, 255, 255, 0.05)" }}
          >
            {[
              { id: "overview", label: "Overview", icon: TrendingUp },
              { id: "transactions", label: "Transactions", icon: Receipt },
              { id: "stripe", label: "Stripe Status", icon: CreditCard },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as typeof activeTab)}
                  className={`flex-1 flex items-center justify-center gap-3 px-5 py-3.5 rounded-lg transition-all ${
                    activeTab === tab.id ? "bg-white/10" : "hover:bg-white/5"
                  }`}
                  style={{
                    color:
                      activeTab === tab.id
                        ? "rgba(167, 243, 208, 0.95)"
                        : "rgba(200, 240, 200, 0.6)",
                  }}
                >
                  <Icon className="w-4 h-4" />
                  <span className="font-medium">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </motion.div>

        {data && (
          <>
            {/* Overview Tab */}
            {activeTab === "overview" && (
              <>
                {/* Main Stats */}
                <motion.div
                  className="w-full max-w-6xl mb-6"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                >
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Total Volume */}
                    <GameCard>
                      <GameCardContent className="p-5 h-full flex flex-col">
                        <div className="flex items-center gap-4 mb-5">
                          <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                            <Wallet className="w-6 h-6 text-blue-400" />
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-base truncate" style={{ color: "rgba(147, 197, 253, 0.95)" }}>
                              Total Volume
                            </p>
                            <p className="text-sm mt-1" style={{ color: "rgba(200, 240, 200, 0.5)" }}>
                              All money processed
                            </p>
                          </div>
                        </div>
                        <div className="space-y-4 mt-auto pt-4 border-t border-white/5">
                          <div className="flex justify-between items-center gap-4">
                            <span className="text-sm" style={{ color: "rgba(200, 240, 200, 0.6)" }}>Amount</span>
                            <span className="font-semibold text-base" style={{ color: "rgba(147, 197, 253, 0.95)" }}>
                              {data.overview.formatted.totalVolume}
                            </span>
                          </div>
                        </div>
                      </GameCardContent>
                    </GameCard>

                    {/* Platform Revenue */}
                    <GameCard>
                      <GameCardContent className="p-5 h-full flex flex-col">
                        <div className="flex items-center gap-4 mb-5">
                          <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                            <DollarSign className="w-6 h-6 text-emerald-400" />
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-base truncate" style={{ color: "rgba(167, 243, 208, 0.95)" }}>
                              Platform Revenue
                            </p>
                            <p className="text-sm mt-1" style={{ color: "rgba(200, 240, 200, 0.5)" }}>
                              Fees + subscriptions
                            </p>
                          </div>
                        </div>
                        <div className="space-y-4 mt-auto pt-4 border-t border-white/5">
                          <div className="flex justify-between items-center gap-4">
                            <span className="text-sm" style={{ color: "rgba(200, 240, 200, 0.6)" }}>Amount</span>
                            <span className="font-semibold text-base" style={{ color: "rgba(167, 243, 208, 0.95)" }}>
                              {data.overview.formatted.totalPlatformRevenue}
                            </span>
                          </div>
                        </div>
                      </GameCardContent>
                    </GameCard>

                    {/* Developer Payouts */}
                    <GameCard>
                      <GameCardContent className="p-5 h-full flex flex-col">
                        <div className="flex items-center gap-4 mb-5">
                          <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                            <TrendingUp className="w-6 h-6 text-purple-400" />
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-base truncate" style={{ color: "rgba(196, 181, 253, 0.95)" }}>
                              Developer Payouts
                            </p>
                            <p className="text-sm mt-1" style={{ color: "rgba(200, 240, 200, 0.5)" }}>
                              Sent to developers
                            </p>
                          </div>
                        </div>
                        <div className="space-y-4 mt-auto pt-4 border-t border-white/5">
                          <div className="flex justify-between items-center gap-4">
                            <span className="text-sm" style={{ color: "rgba(200, 240, 200, 0.6)" }}>Amount</span>
                            <span className="font-semibold text-base" style={{ color: "rgba(196, 181, 253, 0.95)" }}>
                              {data.overview.formatted.totalDeveloperPayouts}
                            </span>
                          </div>
                        </div>
                      </GameCardContent>
                    </GameCard>
                  </div>
                </motion.div>

                {/* Revenue Breakdown */}
                <motion.div
                  className="w-full max-w-6xl mb-6"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                >
                  <h2
                    className="text-lg font-bold mb-5 flex items-center gap-3"
                    style={{ color: "rgba(200, 240, 200, 0.9)" }}
                  >
                    <Zap className="w-5 h-5" />
                    Revenue Breakdown
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Game Sales */}
                    <GameCard>
                      <GameCardContent className="p-5 h-full flex flex-col">
                        <div className="flex items-center gap-4 mb-5">
                          <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center flex-shrink-0">
                            <Gamepad2 className="w-6 h-6 text-amber-400" />
                          </div>
                          <div className="min-w-0">
                            <p
                              className="font-semibold text-base truncate"
                              style={{ color: "rgba(253, 230, 138, 0.95)" }}
                            >
                              Game Sales
                            </p>
                            <p className="text-sm mt-1" style={{ color: "rgba(200, 240, 200, 0.5)" }}>
                              {data.breakdown.gameSales.count} sales
                            </p>
                          </div>
                        </div>
                        <div className="space-y-4 mt-auto pt-4 border-t border-white/5">
                          <div className="flex justify-between items-center gap-4">
                            <span className="text-sm" style={{ color: "rgba(200, 240, 200, 0.6)" }}>Total</span>
                            <span className="font-semibold text-base" style={{ color: "rgba(200, 240, 200, 0.9)" }}>
                              {data.breakdown.gameSales.formatted.totalRevenue}
                            </span>
                          </div>
                          <div className="flex justify-between items-center gap-4">
                            <span className="text-sm" style={{ color: "rgba(200, 240, 200, 0.6)" }}>Platform Fee</span>
                            <span className="font-semibold text-base" style={{ color: "rgba(167, 243, 208, 0.9)" }}>
                              {data.breakdown.gameSales.formatted.platformFees}
                            </span>
                          </div>
                        </div>
                      </GameCardContent>
                    </GameCard>

                    {/* Tips */}
                    <GameCard>
                      <GameCardContent className="p-5 h-full flex flex-col">
                        <div className="flex items-center gap-4 mb-5">
                          <div className="w-12 h-12 rounded-xl bg-pink-500/20 flex items-center justify-center flex-shrink-0">
                            <Gift className="w-6 h-6 text-pink-400" />
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-base truncate" style={{ color: "rgba(251, 207, 232, 0.95)" }}>
                              Tips
                            </p>
                            <p className="text-sm mt-1" style={{ color: "rgba(200, 240, 200, 0.5)" }}>
                              {data.breakdown.tips.count} tips
                            </p>
                          </div>
                        </div>
                        <div className="space-y-4 mt-auto pt-4 border-t border-white/5">
                          <div className="flex justify-between items-center gap-4">
                            <span className="text-sm" style={{ color: "rgba(200, 240, 200, 0.6)" }}>Total</span>
                            <span className="font-semibold text-base" style={{ color: "rgba(200, 240, 200, 0.9)" }}>
                              {data.breakdown.tips.formatted.totalRevenue}
                            </span>
                          </div>
                          <div className="flex justify-between items-center gap-4">
                            <span className="text-sm" style={{ color: "rgba(200, 240, 200, 0.6)" }}>Platform Fee</span>
                            <span className="font-semibold text-base" style={{ color: "rgba(167, 243, 208, 0.9)" }}>
                              {data.breakdown.tips.formatted.platformFees}
                            </span>
                          </div>
                        </div>
                      </GameCardContent>
                    </GameCard>

                    {/* Publishing Fees */}
                    <GameCard>
                      <GameCardContent className="p-5 h-full flex flex-col">
                        <div className="flex items-center gap-4 mb-5">
                          <div className="w-12 h-12 rounded-xl bg-cyan-500/20 flex items-center justify-center flex-shrink-0">
                            <Receipt className="w-6 h-6 text-cyan-400" />
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-base truncate" style={{ color: "rgba(165, 243, 252, 0.95)" }}>
                              Publishing Fees
                            </p>
                            <p className="text-sm mt-1" style={{ color: "rgba(200, 240, 200, 0.5)" }}>
                              {data.breakdown.publishingFees.count} games
                            </p>
                          </div>
                        </div>
                        <div className="space-y-4 mt-auto pt-4 border-t border-white/5">
                          <div className="flex justify-between items-center gap-4">
                            <span className="text-sm" style={{ color: "rgba(200, 240, 200, 0.6)" }}>Total</span>
                            <span className="font-semibold text-base" style={{ color: "rgba(167, 243, 208, 0.9)" }}>
                              {data.breakdown.publishingFees.formatted.totalRevenue}
                            </span>
                          </div>
                          <div className="flex justify-between items-center gap-4">
                            <span className="text-sm" style={{ color: "rgba(200, 240, 200, 0.6)" }}>Per Game</span>
                            <span className="font-semibold text-base" style={{ color: "rgba(200, 240, 200, 0.9)" }}>$50.00</span>
                          </div>
                        </div>
                      </GameCardContent>
                    </GameCard>

                    {/* Subscriptions */}
                    <GameCard>
                      <GameCardContent className="p-5 h-full flex flex-col">
                        <div className="flex items-center gap-4 mb-5">
                          <div className="w-12 h-12 rounded-xl bg-yellow-500/20 flex items-center justify-center flex-shrink-0">
                            <Crown className="w-6 h-6 text-yellow-400" />
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-base truncate" style={{ color: "rgba(254, 249, 195, 0.95)" }}>
                              Subscriptions
                            </p>
                            <p className="text-sm mt-1" style={{ color: "rgba(200, 240, 200, 0.5)" }}>
                              {data.breakdown.subscriptions.activeCount} active
                            </p>
                          </div>
                        </div>
                        <div className="space-y-4 mt-auto pt-4 border-t border-white/5">
                          <div className="flex justify-between items-center gap-4">
                            <span className="text-sm" style={{ color: "rgba(200, 240, 200, 0.6)" }}>Monthly</span>
                            <span className="font-semibold text-base" style={{ color: "rgba(167, 243, 208, 0.9)" }}>
                              {data.breakdown.subscriptions.formatted.monthlyRevenue}
                            </span>
                          </div>
                          <div className="flex justify-between items-center gap-4">
                            <span className="text-sm" style={{ color: "rgba(200, 240, 200, 0.6)" }}>Split</span>
                            <span className="font-semibold text-base" style={{ color: "rgba(167, 243, 208, 0.9)" }}>100% Platform</span>
                          </div>
                        </div>
                      </GameCardContent>
                    </GameCard>
                  </div>
                </motion.div>
              </>
            )}

            {/* Transactions Tab */}
            {activeTab === "transactions" && (
              <motion.div
                className="w-full max-w-6xl"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Recent Purchases */}
                  <GameCard>
                    <GameCardContent className="p-6 flex flex-col min-h-[320px]">
                      <h3
                        className="text-lg font-bold mb-5 flex items-center gap-3"
                        style={{ color: "rgba(253, 230, 138, 0.95)" }}
                      >
                        <Gamepad2 className="w-5 h-5" />
                        Recent Purchases
                      </h3>
                      <div className="space-y-3 flex-1">
                        {data.recentTransactions.purchases.length > 0 ? (
                          data.recentTransactions.purchases.slice(0, 5).map((purchase) => (
                            <div
                              key={purchase.id}
                              className="p-4 rounded-lg"
                              style={{ background: "rgba(255, 255, 255, 0.05)" }}
                            >
                              <div className="flex justify-between items-start gap-4 mb-2">
                                <div className="min-w-0 flex-1">
                                  <p
                                    className="font-medium truncate"
                                    style={{ color: "rgba(200, 240, 200, 0.95)" }}
                                  >
                                    {purchase.game.title}
                                  </p>
                                  <p className="text-xs mt-1" style={{ color: "rgba(200, 240, 200, 0.5)" }}>
                                    by {purchase.user.name}
                                  </p>
                                </div>
                                <div className="text-right flex-shrink-0">
                                  <p
                                    className="font-semibold"
                                    style={{ color: "rgba(167, 243, 208, 0.95)" }}
                                  >
                                    {purchase.formattedAmount}
                                  </p>
                                  <p className="text-xs mt-1" style={{ color: "rgba(200, 240, 200, 0.5)" }}>
                                    Fee: {purchase.formattedPlatformFee}
                                  </p>
                                </div>
                              </div>
                              <p className="text-xs mt-2" style={{ color: "rgba(200, 240, 200, 0.4)" }}>
                                {formatDate(purchase.createdAt)}
                              </p>
                            </div>
                          ))
                        ) : (
                          <div className="flex-1 flex flex-col items-center justify-center py-8">
                            <Gamepad2 className="w-10 h-10 mb-3" style={{ color: "rgba(200, 240, 200, 0.2)" }} />
                            <p style={{ color: "rgba(200, 240, 200, 0.5)" }}>No purchases yet</p>
                          </div>
                        )}
                      </div>
                    </GameCardContent>
                  </GameCard>

                  {/* Recent Tips */}
                  <GameCard>
                    <GameCardContent className="p-6 flex flex-col min-h-[320px]">
                      <h3
                        className="text-lg font-bold mb-5 flex items-center gap-3"
                        style={{ color: "rgba(251, 207, 232, 0.95)" }}
                      >
                        <Gift className="w-5 h-5" />
                        Recent Tips
                      </h3>
                      <div className="space-y-3 flex-1">
                        {data.recentTransactions.tips.length > 0 ? (
                          data.recentTransactions.tips.slice(0, 5).map((tip) => (
                            <div
                              key={tip.id}
                              className="p-4 rounded-lg"
                              style={{ background: "rgba(255, 255, 255, 0.05)" }}
                            >
                              <div className="flex justify-between items-start gap-4 mb-2">
                                <div className="min-w-0 flex-1">
                                  <p
                                    className="font-medium truncate"
                                    style={{ color: "rgba(200, 240, 200, 0.95)" }}
                                  >
                                    {tip.fromUser.name} → {tip.toUser.name}
                                  </p>
                                  {tip.message ? (
                                    <p
                                      className="text-xs truncate mt-1"
                                      style={{ color: "rgba(200, 240, 200, 0.5)" }}
                                    >
                                      "{tip.message}"
                                    </p>
                                  ) : (
                                    <p className="text-xs mt-1" style={{ color: "rgba(200, 240, 200, 0.4)" }}>
                                      No message
                                    </p>
                                  )}
                                </div>
                                <div className="text-right flex-shrink-0">
                                  <p
                                    className="font-semibold"
                                    style={{ color: "rgba(251, 207, 232, 0.95)" }}
                                  >
                                    {tip.formattedAmount}
                                  </p>
                                  <p className="text-xs mt-1" style={{ color: "rgba(200, 240, 200, 0.5)" }}>
                                    Fee: {tip.formattedPlatformFee}
                                  </p>
                                </div>
                              </div>
                              <p className="text-xs mt-2" style={{ color: "rgba(200, 240, 200, 0.4)" }}>
                                {formatDate(tip.createdAt)}
                              </p>
                            </div>
                          ))
                        ) : (
                          <div className="flex-1 flex flex-col items-center justify-center py-8">
                            <Gift className="w-10 h-10 mb-3" style={{ color: "rgba(200, 240, 200, 0.2)" }} />
                            <p style={{ color: "rgba(200, 240, 200, 0.5)" }}>No tips yet</p>
                          </div>
                        )}
                      </div>
                    </GameCardContent>
                  </GameCard>

                  {/* Recent Publishing Fees */}
                  <GameCard className="lg:col-span-2">
                    <GameCardContent className="p-6">
                      <h3
                        className="text-lg font-bold mb-5 flex items-center gap-3"
                        style={{ color: "rgba(165, 243, 252, 0.95)" }}
                      >
                        <Receipt className="w-5 h-5" />
                        Recent Publishing Fees
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {data.recentTransactions.publishingFees.length > 0 ? (
                          data.recentTransactions.publishingFees.slice(0, 6).map((fee) => (
                            <div
                              key={fee.id}
                              className="p-4 rounded-lg"
                              style={{ background: "rgba(255, 255, 255, 0.05)" }}
                            >
                              <div className="flex justify-between items-start gap-4">
                                <div className="min-w-0 flex-1">
                                  <p
                                    className="font-medium truncate"
                                    style={{ color: "rgba(200, 240, 200, 0.95)" }}
                                  >
                                    {fee.game.title}
                                  </p>
                                  <p className="text-xs mt-1" style={{ color: "rgba(200, 240, 200, 0.5)" }}>
                                    by {fee.developer.name}
                                  </p>
                                  <p className="text-xs mt-2" style={{ color: "rgba(200, 240, 200, 0.4)" }}>
                                    {formatDate(fee.paidAt)}
                                  </p>
                                </div>
                                <p
                                  className="font-semibold flex-shrink-0"
                                  style={{ color: "rgba(167, 243, 208, 0.95)" }}
                                >
                                  {fee.formattedAmount}
                                </p>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="col-span-full flex flex-col items-center justify-center py-8">
                            <Receipt className="w-10 h-10 mb-3" style={{ color: "rgba(200, 240, 200, 0.2)" }} />
                            <p style={{ color: "rgba(200, 240, 200, 0.5)" }}>No publishing fees yet</p>
                          </div>
                        )}
                      </div>
                    </GameCardContent>
                  </GameCard>
                </div>
              </motion.div>
            )}

            {/* Stripe Status Tab */}
            {activeTab === "stripe" && (
              <motion.div
                className="w-full max-w-6xl"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Connection Status */}
                  <GameCard>
                    <GameCardContent className="p-6 h-full flex flex-col">
                      <h3
                        className="text-lg font-bold mb-5 flex items-center gap-3"
                        style={{ color: "rgba(200, 240, 200, 0.95)" }}
                      >
                        <CreditCard className="w-5 h-5" />
                        Connection Status
                      </h3>
                      <div className="space-y-4 flex-1">
                        <div
                          className="flex items-center justify-between gap-4 p-4 rounded-lg"
                          style={{ background: "rgba(255, 255, 255, 0.05)" }}
                        >
                          <span className="text-sm" style={{ color: "rgba(200, 240, 200, 0.7)" }}>Stripe API</span>
                          <div className="flex items-center gap-3">
                            {data.stripeStatus.configured ? (
                              <>
                                <CheckCircle className="w-5 h-5 text-emerald-400" />
                                <span className="font-medium" style={{ color: "rgba(167, 243, 208, 0.9)" }}>Connected</span>
                              </>
                            ) : (
                              <>
                                <AlertCircle className="w-5 h-5 text-amber-400" />
                                <span className="font-medium" style={{ color: "rgba(253, 230, 138, 0.9)" }}>Demo Mode</span>
                              </>
                            )}
                          </div>
                        </div>

                        <div
                          className="flex items-center justify-between gap-4 p-4 rounded-lg"
                          style={{ background: "rgba(255, 255, 255, 0.05)" }}
                        >
                          <span className="text-sm" style={{ color: "rgba(200, 240, 200, 0.7)" }}>Stripe Connect</span>
                          <div className="flex items-center gap-3">
                            {data.stripeStatus.connectConfigured ? (
                              <>
                                <CheckCircle className="w-5 h-5 text-emerald-400" />
                                <span className="font-medium" style={{ color: "rgba(167, 243, 208, 0.9)" }}>Enabled</span>
                              </>
                            ) : (
                              <>
                                <Clock className="w-5 h-5 text-gray-400" />
                                <span className="font-medium" style={{ color: "rgba(200, 240, 200, 0.5)" }}>Not Set</span>
                              </>
                            )}
                          </div>
                        </div>

                        <div
                          className="flex items-center justify-between gap-4 p-4 rounded-lg"
                          style={{ background: "rgba(255, 255, 255, 0.05)" }}
                        >
                          <span className="text-sm" style={{ color: "rgba(200, 240, 200, 0.7)" }}>Webhooks</span>
                          <div className="flex items-center gap-3">
                            {data.stripeStatus.webhookConfigured ? (
                              <>
                                <CheckCircle className="w-5 h-5 text-emerald-400" />
                                <span className="font-medium" style={{ color: "rgba(167, 243, 208, 0.9)" }}>Configured</span>
                              </>
                            ) : (
                              <>
                                <Clock className="w-5 h-5 text-gray-400" />
                                <span className="font-medium" style={{ color: "rgba(200, 240, 200, 0.5)" }}>Not Set</span>
                              </>
                            )}
                          </div>
                        </div>

                        <div
                          className="flex items-center justify-between gap-4 p-4 rounded-lg"
                          style={{ background: "rgba(255, 255, 255, 0.05)" }}
                        >
                          <span className="text-sm" style={{ color: "rgba(200, 240, 200, 0.7)" }}>Mode</span>
                          <div className="flex items-center gap-3">
                            {data.stripeStatus.mode === "live" ? (
                              <>
                                <CheckCircle className="w-5 h-5 text-emerald-400" />
                                <span className="font-medium" style={{ color: "rgba(167, 243, 208, 0.9)" }}>Live</span>
                              </>
                            ) : (
                              <>
                                <AlertCircle className="w-5 h-5 text-amber-400" />
                                <span className="font-medium" style={{ color: "rgba(253, 230, 138, 0.9)" }}>Test</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      {data.stripeStatus.configured && (
                        <a
                          href="https://dashboard.stripe.com"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-5 flex items-center justify-center gap-3 px-4 py-3 rounded-lg transition-all hover:bg-white/10"
                          style={{
                            background: "rgba(99, 102, 241, 0.2)",
                            border: "1px solid rgba(129, 140, 248, 0.3)",
                            color: "rgba(199, 210, 254, 0.95)",
                          }}
                        >
                          <ExternalLink className="w-4 h-4" />
                          Open Stripe Dashboard
                        </a>
                      )}
                    </GameCardContent>
                  </GameCard>

                  {/* Fee Configuration */}
                  <GameCard>
                    <GameCardContent className="p-6 h-full flex flex-col">
                      <h3
                        className="text-lg font-bold mb-5 flex items-center gap-3"
                        style={{ color: "rgba(200, 240, 200, 0.95)" }}
                      >
                        <DollarSign className="w-5 h-5" />
                        Platform Fees
                      </h3>
                      <div className="grid grid-cols-2 gap-4 flex-1">
                        <div
                          className="p-4 rounded-lg flex flex-col"
                          style={{ background: "rgba(255, 255, 255, 0.05)" }}
                        >
                          <span className="text-sm mb-2" style={{ color: "rgba(200, 240, 200, 0.7)" }}>Game Sales</span>
                          <span
                            className="font-bold text-2xl mb-2"
                            style={{ color: "rgba(253, 230, 138, 0.95)" }}
                          >
                            {data.feeConfig.gameSaleFee}%
                          </span>
                          <p className="text-xs mt-auto" style={{ color: "rgba(200, 240, 200, 0.5)" }}>
                            Dev keeps {100 - data.feeConfig.gameSaleFee}%
                          </p>
                        </div>

                        <div
                          className="p-4 rounded-lg flex flex-col"
                          style={{ background: "rgba(255, 255, 255, 0.05)" }}
                        >
                          <span className="text-sm mb-2" style={{ color: "rgba(200, 240, 200, 0.7)" }}>Tips</span>
                          <span
                            className="font-bold text-2xl mb-2"
                            style={{ color: "rgba(251, 207, 232, 0.95)" }}
                          >
                            {data.feeConfig.tipFee}%
                          </span>
                          <p className="text-xs mt-auto" style={{ color: "rgba(200, 240, 200, 0.5)" }}>
                            Dev keeps {100 - data.feeConfig.tipFee}%
                          </p>
                        </div>

                        <div
                          className="p-4 rounded-lg flex flex-col"
                          style={{ background: "rgba(255, 255, 255, 0.05)" }}
                        >
                          <span className="text-sm mb-2" style={{ color: "rgba(200, 240, 200, 0.7)" }}>Creator Support</span>
                          <span
                            className="font-bold text-2xl mb-2"
                            style={{ color: "rgba(196, 181, 253, 0.95)" }}
                          >
                            {data.feeConfig.creatorSupportFee}%
                          </span>
                          <p className="text-xs mt-auto" style={{ color: "rgba(200, 240, 200, 0.5)" }}>
                            Split to devs
                          </p>
                        </div>

                        <div
                          className="p-4 rounded-lg flex flex-col"
                          style={{ background: "rgba(255, 255, 255, 0.05)" }}
                        >
                          <span className="text-sm mb-2" style={{ color: "rgba(200, 240, 200, 0.7)" }}>Publishing</span>
                          <span
                            className="font-bold text-2xl mb-2"
                            style={{ color: "rgba(165, 243, 252, 0.95)" }}
                          >
                            ${(data.feeConfig.publishingFee / 100).toFixed(0)}
                          </span>
                          <p className="text-xs mt-auto" style={{ color: "rgba(200, 240, 200, 0.5)" }}>
                            One-time/game
                          </p>
                        </div>
                      </div>
                    </GameCardContent>
                  </GameCard>

                  {/* Setup Instructions */}
                  {!data.stripeStatus.configured && (
                    <GameCard className="lg:col-span-2">
                      <GameCardContent className="p-6">
                        <div
                          className="p-5 rounded-lg"
                          style={{
                            background: "rgba(251, 191, 36, 0.1)",
                            border: "1px solid rgba(251, 191, 36, 0.2)",
                          }}
                        >
                          <div className="flex items-center gap-2 mb-4">
                            <AlertCircle className="w-5 h-5 text-amber-400" />
                            <span
                              className="font-semibold text-lg"
                              style={{ color: "rgba(253, 230, 138, 0.9)" }}
                            >
                              Stripe Setup Required
                            </span>
                          </div>
                          <p className="text-sm mb-4" style={{ color: "rgba(253, 230, 138, 0.7)" }}>
                            To process real payments, configure these environment variables:
                          </p>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                            <div className="p-3 rounded-lg" style={{ background: "rgba(0, 0, 0, 0.2)" }}>
                              <p className="text-xs mb-1" style={{ color: "rgba(253, 230, 138, 0.6)" }}>Step 1</p>
                              <p className="text-sm" style={{ color: "rgba(253, 230, 138, 0.9)" }}>
                                Create account at <a href="https://stripe.com" target="_blank" rel="noopener noreferrer" className="underline">stripe.com</a>
                              </p>
                            </div>
                            <div className="p-3 rounded-lg" style={{ background: "rgba(0, 0, 0, 0.2)" }}>
                              <p className="text-xs mb-1" style={{ color: "rgba(253, 230, 138, 0.6)" }}>Step 2</p>
                              <p className="text-sm" style={{ color: "rgba(253, 230, 138, 0.9)" }}>
                                Add <code className="bg-black/30 px-1 rounded text-xs">STRIPE_SECRET_KEY</code>
                              </p>
                            </div>
                            <div className="p-3 rounded-lg" style={{ background: "rgba(0, 0, 0, 0.2)" }}>
                              <p className="text-xs mb-1" style={{ color: "rgba(253, 230, 138, 0.6)" }}>Step 3</p>
                              <p className="text-sm" style={{ color: "rgba(253, 230, 138, 0.9)" }}>
                                Add <code className="bg-black/30 px-1 rounded text-xs">STRIPE_CONNECT_CLIENT_ID</code>
                              </p>
                            </div>
                            <div className="p-3 rounded-lg" style={{ background: "rgba(0, 0, 0, 0.2)" }}>
                              <p className="text-xs mb-1" style={{ color: "rgba(253, 230, 138, 0.6)" }}>Step 4</p>
                              <p className="text-sm" style={{ color: "rgba(253, 230, 138, 0.9)" }}>
                                Add <code className="bg-black/30 px-1 rounded text-xs">STRIPE_WEBHOOK_SECRET</code>
                              </p>
                            </div>
                            <div className="p-3 rounded-lg md:col-span-2" style={{ background: "rgba(0, 0, 0, 0.2)" }}>
                              <p className="text-xs mb-1" style={{ color: "rgba(253, 230, 138, 0.6)" }}>Step 5</p>
                              <p className="text-sm" style={{ color: "rgba(253, 230, 138, 0.9)" }}>
                                Restart your server and refresh this page
                              </p>
                            </div>
                          </div>
                        </div>
                      </GameCardContent>
                    </GameCard>
                  )}
                </div>
              </motion.div>
            )}
          </>
        )}
      </motion.main>
    </div>
  );
}

