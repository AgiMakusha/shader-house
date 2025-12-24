'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Particles from '@/components/fx/Particles';
import { GameCard, GameCardContent } from '@/components/game/GameCard';
import { useAudio } from '@/components/audio/AudioProvider';
import { 
  DollarSign, 
  ShoppingCart, 
  Gift,
  Download,
  ArrowRight,
  CheckCircle2
} from 'lucide-react';

interface RevenueData {
  monthlyRevenue: {
    directSales: number;
    tips: number;
  };
  totalRevenue: number;
}

export default function DeveloperRevenuePage() {
  const router = useRouter();
  const { play } = useAudio();
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [revenueData, setRevenueData] = useState<RevenueData | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Get current user
      const userRes = await fetch('/api/auth/me');
      if (!userRes.ok) {
        router.push('/login');
        return;
      }
      const userData = await userRes.json();
      
      if (userData.user.role !== 'DEVELOPER') {
        router.push('/profile/gamer');
        return;
      }
      
      setUser(userData.user);

      // Get revenue data
      const revenueRes = await fetch('/api/developer/revenue');
      if (revenueRes.ok) {
        const revenue = await revenueRes.json();
        setRevenueData(revenue);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (cents: number) => {
    return `$${(cents / 100).toFixed(2)}`;
  };

  const totalMonthlyRevenue = revenueData
    ? (revenueData.monthlyRevenue?.directSales || 0) + (revenueData.monthlyRevenue?.tips || 0)
    : 0;

  if (isLoading) {
    return (
      <div className="min-h-dvh relative overflow-hidden flex items-center justify-center">
        <Particles />
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <div className="text-xl font-semibold pixelized" style={{ color: 'rgba(200, 240, 200, 0.9)' }}>
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
          className="w-full max-w-5xl mb-8 flex items-center justify-between gap-4"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div>
            <p className="text-xs uppercase tracking-[0.3em] pixelized" style={{ color: "rgba(200, 240, 200, 0.6)" }}>
              Earnings Overview
            </p>
            <h1
              className="text-4xl font-bold tracking-wider uppercase pixelized"
              style={{
                textShadow: `
                  0 0 12px rgba(120, 200, 120, 0.8),
                  0 0 24px rgba(100, 180, 100, 0.6),
                  2px 2px 0px rgba(0, 0, 0, 0.9)
                `,
                color: "rgba(180, 220, 180, 0.95)",
              }}
            >
              Revenue & Tips
            </h1>
            <p
              className="mt-2 text-sm pixelized"
              style={{ color: "rgba(200, 240, 200, 0.65)", textShadow: "1px 1px 0px rgba(0, 0, 0, 0.8)" }}
            >
              Track your earnings from game sales and tips
            </p>
          </div>

          <div className="flex items-center gap-4">
            <Link
              href="/profile/developer/analytics"
              className="text-xs font-semibold uppercase tracking-[0.2em] hover:underline transition-all"
              style={{ color: "rgba(200, 240, 200, 0.75)" }}
            >
              Analytics →
            </Link>
            <Link
              href="/profile/developer"
              className="text-xs font-semibold uppercase tracking-[0.2em] hover:underline transition-all"
              style={{ color: "rgba(200, 240, 200, 0.75)" }}
            >
              ← Back to Developer Hub
            </Link>
          </div>
        </motion.div>

        {/* Overview Cards */}
        <motion.div
          className="w-full max-w-5xl mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Total Monthly Revenue */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.35 }}
            >
              <GameCard>
                <GameCardContent className="p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <DollarSign size={20} style={{ color: "rgba(150, 250, 150, 0.9)", filter: "drop-shadow(0 0 4px rgba(150, 250, 150, 0.5))" }} />
                    <p className="text-sm font-medium" style={{ color: "rgba(200, 240, 200, 0.6)" }}>
                      Total Revenue
                    </p>
                  </div>
                  <p
                    className="text-3xl font-bold pixelized"
                    style={{ textShadow: "0 0 8px rgba(120, 200, 120, 0.5), 1px 1px 0px rgba(0, 0, 0, 0.8)", color: "rgba(150, 250, 150, 0.95)" }}
                  >
                    {formatCurrency(totalMonthlyRevenue)}
                  </p>
                </GameCardContent>
              </GameCard>
            </motion.div>

            {/* Direct Sales */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <GameCard>
                <GameCardContent className="p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <ShoppingCart size={20} style={{ color: "rgba(150, 200, 250, 0.9)", filter: "drop-shadow(0 0 4px rgba(150, 200, 250, 0.5))" }} />
                    <p className="text-sm font-medium" style={{ color: "rgba(200, 240, 200, 0.6)" }}>
                      Game Sales
                    </p>
                  </div>
                  <p
                    className="text-3xl font-bold pixelized"
                    style={{ textShadow: "0 0 8px rgba(120, 200, 120, 0.5), 1px 1px 0px rgba(0, 0, 0, 0.8)", color: "rgba(150, 250, 150, 0.95)" }}
                  >
                    {formatCurrency(revenueData?.monthlyRevenue?.directSales || 0)}
                  </p>
                </GameCardContent>
              </GameCard>
            </motion.div>

            {/* Tips */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.45 }}
            >
              <GameCard>
                <GameCardContent className="p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <Gift size={20} style={{ color: "rgba(250, 220, 100, 0.9)", filter: "drop-shadow(0 0 4px rgba(250, 220, 100, 0.5))" }} />
                    <p className="text-sm font-medium" style={{ color: "rgba(200, 240, 200, 0.6)" }}>
                      Tips & Donations
                    </p>
                  </div>
                  <p
                    className="text-3xl font-bold pixelized"
                    style={{ textShadow: "0 0 8px rgba(120, 200, 120, 0.5), 1px 1px 0px rgba(0, 0, 0, 0.8)", color: "rgba(150, 250, 150, 0.95)" }}
                  >
                    {formatCurrency(revenueData?.monthlyRevenue?.tips || 0)}
                  </p>
                </GameCardContent>
              </GameCard>
            </motion.div>
          </div>
        </motion.div>

        {/* Revenue Breakdown */}
        <motion.div
          className="w-full max-w-5xl mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <GameCard>
            <GameCardContent className="p-6">
              <div className="flex items-center justify-between mb-5 gap-6">
                <h2
                  className="text-2xl font-bold pixelized"
                  style={{ textShadow: "0 0 8px rgba(120, 200, 120, 0.6), 1px 1px 0px rgba(0, 0, 0, 0.8)", color: "rgba(180, 220, 180, 0.95)" }}
                >
                  Revenue Breakdown
                </h2>
                <button 
                  onClick={() => play("hover")}
                  className="flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-xs uppercase tracking-wider transition-all hover:scale-105"
                  style={{
                    background: "linear-gradient(135deg, rgba(100, 200, 100, 0.2) 0%, rgba(80, 180, 80, 0.1) 100%)",
                    border: "1px solid rgba(200, 240, 200, 0.3)",
                    color: "rgba(200, 240, 200, 0.8)",
                  }}
                >
                  <Download size={14} />
                  Export
                </button>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                {/* Game Sales Card */}
                <div className="p-4 rounded-lg" style={{ background: "rgba(150, 200, 250, 0.08)", border: "1px solid rgba(150, 200, 250, 0.15)" }}>
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center" style={{ background: "rgba(150, 200, 250, 0.15)" }}>
                      <ShoppingCart size={24} style={{ color: "rgba(150, 200, 250, 0.9)" }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="font-semibold" style={{ color: "rgba(200, 240, 200, 0.95)" }}>Game Sales</span>
                        <span className="text-xs px-2 py-0.5 rounded font-medium" style={{ background: "rgba(150, 250, 150, 0.2)", color: "rgba(150, 250, 150, 0.95)" }}>85%</span>
                      </div>
                      <p className="text-2xl font-bold pixelized mb-2" style={{ color: "rgba(150, 250, 150, 0.95)", textShadow: "0 0 6px rgba(150, 250, 150, 0.3)" }}>
                        {formatCurrency(revenueData?.monthlyRevenue?.directSales || 0)}
                      </p>
                      <div className="h-2 rounded-full overflow-hidden" style={{ background: "rgba(100, 180, 100, 0.2)" }}>
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${totalMonthlyRevenue > 0 ? ((revenueData?.monthlyRevenue?.directSales || 0) / totalMonthlyRevenue) * 100 : 0}%`,
                            minWidth: (revenueData?.monthlyRevenue?.directSales || 0) > 0 ? "8px" : "0",
                            background: "linear-gradient(90deg, rgba(150, 200, 250, 0.8), rgba(100, 180, 250, 0.9))",
                            boxShadow: "0 0 8px rgba(150, 200, 250, 0.4)",
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Tips Card */}
                <div className="p-4 rounded-lg" style={{ background: "rgba(250, 220, 100, 0.08)", border: "1px solid rgba(250, 220, 100, 0.15)" }}>
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center" style={{ background: "rgba(250, 220, 100, 0.15)" }}>
                      <Gift size={24} style={{ color: "rgba(250, 220, 100, 0.9)" }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="font-semibold" style={{ color: "rgba(200, 240, 200, 0.95)" }}>Tips & Donations</span>
                        <span className="text-xs px-2 py-0.5 rounded font-medium" style={{ background: "rgba(150, 250, 150, 0.2)", color: "rgba(150, 250, 150, 0.95)" }}>85%</span>
                      </div>
                      <p className="text-2xl font-bold pixelized mb-2" style={{ color: "rgba(150, 250, 150, 0.95)", textShadow: "0 0 6px rgba(150, 250, 150, 0.3)" }}>
                        {formatCurrency(revenueData?.monthlyRevenue?.tips || 0)}
                      </p>
                      <div className="h-2 rounded-full overflow-hidden" style={{ background: "rgba(100, 180, 100, 0.2)" }}>
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${totalMonthlyRevenue > 0 ? ((revenueData?.monthlyRevenue?.tips || 0) / totalMonthlyRevenue) * 100 : 0}%`,
                            minWidth: (revenueData?.monthlyRevenue?.tips || 0) > 0 ? "8px" : "0",
                            background: "linear-gradient(90deg, rgba(250, 220, 100, 0.8), rgba(250, 200, 80, 0.9))",
                            boxShadow: "0 0 8px rgba(250, 220, 100, 0.4)",
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Empty state */}
              {totalMonthlyRevenue === 0 && (
                <div className="mt-5 text-center py-6 rounded-lg" style={{ background: "rgba(100, 180, 100, 0.1)", border: "1px dashed rgba(200, 240, 200, 0.3)" }}>
                  <DollarSign size={28} className="mx-auto mb-2" style={{ color: "rgba(200, 240, 200, 0.4)" }} />
                  <p className="text-sm" style={{ color: "rgba(200, 240, 200, 0.6)" }}>
                    No revenue yet. Start selling games or receive tips to see your earnings here!
                  </p>
                </div>
              )}
            </GameCardContent>
          </GameCard>
        </motion.div>

        {/* Info Cards */}
        <div className="w-full max-w-5xl grid md:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.55 }}
          >
            <GameCard>
              <GameCardContent className="p-6">
                <h3
                  className="text-xl font-bold pixelized mb-5"
                  style={{ textShadow: "0 0 6px rgba(120, 200, 120, 0.5), 1px 1px 0px rgba(0, 0, 0, 0.8)", color: "rgba(180, 220, 180, 0.95)" }}
                >
                  How It Works
                </h3>
                <div className="space-y-4">
                  {/* Game Sales */}
                  <div className="flex gap-4 p-3 rounded-lg" style={{ background: "rgba(150, 200, 250, 0.08)" }}>
                    <div className="flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: "rgba(150, 200, 250, 0.15)" }}>
                      <ShoppingCart size={20} style={{ color: "rgba(150, 200, 250, 0.9)" }} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold" style={{ color: "rgba(200, 240, 200, 0.95)" }}>Game Sales</span>
                        <span className="text-xs px-2 py-0.5 rounded font-medium" style={{ background: "rgba(150, 250, 150, 0.2)", color: "rgba(150, 250, 150, 0.95)" }}>85%</span>
                      </div>
                      <p className="text-sm text-left" style={{ color: "rgba(200, 240, 200, 0.65)" }}>
                        15% platform fee on each purchase
                      </p>
                    </div>
                  </div>

                  {/* Tips */}
                  <div className="flex gap-4 p-3 rounded-lg" style={{ background: "rgba(250, 220, 100, 0.08)" }}>
                    <div className="flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: "rgba(250, 220, 100, 0.15)" }}>
                      <Gift size={20} style={{ color: "rgba(250, 220, 100, 0.9)" }} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold" style={{ color: "rgba(200, 240, 200, 0.95)" }}>Tips & Donations</span>
                        <span className="text-xs px-2 py-0.5 rounded font-medium" style={{ background: "rgba(150, 250, 150, 0.2)", color: "rgba(150, 250, 150, 0.95)" }}>85%</span>
                      </div>
                      <p className="text-sm text-left" style={{ color: "rgba(200, 240, 200, 0.65)" }}>
                        15% platform fee on all tips
                      </p>
                    </div>
                  </div>

                  {/* Publishing Fee */}
                  <div className="flex gap-4 p-3 rounded-lg" style={{ background: "rgba(150, 250, 150, 0.08)" }}>
                    <div className="flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: "rgba(150, 250, 150, 0.15)" }}>
                      <DollarSign size={20} style={{ color: "rgba(150, 250, 150, 0.9)" }} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold" style={{ color: "rgba(200, 240, 200, 0.95)" }}>Publishing Fee</span>
                        <span className="text-xs px-2 py-0.5 rounded font-medium" style={{ background: "rgba(200, 240, 200, 0.2)", color: "rgba(200, 240, 200, 0.9)" }}>One-time</span>
                      </div>
                      <p className="text-sm text-left" style={{ color: "rgba(200, 240, 200, 0.65)" }}>
                        $50 per game to list on platform
                      </p>
                    </div>
                  </div>

                  {/* Platform Fee Explanation */}
                  <div className="mt-4 p-4 rounded-lg" style={{ background: "rgba(100, 180, 100, 0.08)", border: "1px solid rgba(200, 240, 200, 0.15)" }}>
                    <p className="text-sm leading-relaxed" style={{ color: "rgba(200, 240, 200, 0.75)" }}>
                      <strong style={{ color: "rgba(150, 250, 150, 0.95)" }}>15% platform fee on all transactions.</strong>
                      {" "}Used for platform development, developer support, and external marketing to grow your audience.
                    </p>
                  </div>
                </div>
              </GameCardContent>
            </GameCard>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <GameCard>
              <GameCardContent className="p-6">
                <h3
                  className="text-xl font-bold pixelized mb-5"
                  style={{ textShadow: "0 0 6px rgba(120, 200, 120, 0.5), 1px 1px 0px rgba(0, 0, 0, 0.8)", color: "rgba(180, 220, 180, 0.95)" }}
                >
                  Grow Your Revenue
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 rounded-lg" style={{ background: "rgba(100, 180, 100, 0.08)" }}>
                    <CheckCircle2 size={18} style={{ color: "rgba(150, 250, 150, 0.9)" }} />
                    <span style={{ color: "rgba(200, 240, 200, 0.85)" }}>
                      Post regular devlogs to engage your audience
                    </span>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-lg" style={{ background: "rgba(100, 180, 100, 0.08)" }}>
                    <CheckCircle2 size={18} style={{ color: "rgba(150, 250, 150, 0.9)" }} />
                    <span style={{ color: "rgba(200, 240, 200, 0.85)" }}>
                      Offer exclusive beta access to build excitement
                    </span>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-lg" style={{ background: "rgba(100, 180, 100, 0.08)" }}>
                    <CheckCircle2 size={18} style={{ color: "rgba(150, 250, 150, 0.9)" }} />
                    <span style={{ color: "rgba(200, 240, 200, 0.85)" }}>
                      Get featured on the homepage for visibility
                    </span>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-lg" style={{ background: "rgba(100, 180, 100, 0.08)" }}>
                    <CheckCircle2 size={18} style={{ color: "rgba(150, 250, 150, 0.9)" }} />
                    <span style={{ color: "rgba(200, 240, 200, 0.85)" }}>
                      Respond to community feedback to build loyalty
                    </span>
                  </div>
                </div>
                
                <Link
                  href="/profile/developer/settings"
                  className="mt-5 flex items-center justify-center gap-2 w-full py-3 rounded-lg font-semibold text-sm uppercase tracking-wider transition-all hover:scale-[1.02]"
                  style={{
                    background: "linear-gradient(135deg, rgba(100, 200, 100, 0.3) 0%, rgba(80, 180, 80, 0.2) 100%)",
                    border: "1px solid rgba(200, 240, 200, 0.4)",
                    color: "rgba(200, 240, 200, 0.9)",
                  }}
                >
                  Set Up Payments
                  <ArrowRight size={16} />
                </Link>
              </GameCardContent>
            </GameCard>
          </motion.div>
        </div>
      </motion.main>
    </div>
  );
}
