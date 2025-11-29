'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Particles from '@/components/fx/Particles';
import { 
  DollarSign, 
  TrendingUp, 
  Users, 
  Heart, 
  ShoppingCart, 
  Gift,
  Calendar,
  Download
} from 'lucide-react';

interface RevenueData {
  activeSupports: number;
  monthlyRevenue: {
    directSales: number;
    creatorSupport: number;
    proPlaytime: number;
    tips: number;
  };
  totalRevenue: number;
  revenueHistory: Array<{
    month: string;
    directSales: number;
    creatorSupport: number;
    proPlaytime: number;
    tips: number;
    total: number;
  }>;
}

export default function DeveloperRevenuePage() {
  const router = useRouter();
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
    ? revenueData.monthlyRevenue.directSales +
      revenueData.monthlyRevenue.creatorSupport +
      revenueData.monthlyRevenue.proPlaytime +
      revenueData.monthlyRevenue.tips
    : 0;

  if (isLoading) {
    return (
      <div className="min-h-screen relative overflow-hidden flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <Particles />
        <div className="text-xl font-semibold text-white">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Particles />

      <motion.main
        className="relative z-10 container mx-auto px-6 py-20"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        {/* Header */}
        <motion.div
          className="mb-12"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
            Revenue Dashboard
          </h1>
          <p className="text-xl text-white/70">
            Track your earnings and supporter growth
          </p>
        </motion.div>

        {/* Overview Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {/* Total Monthly Revenue */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 backdrop-blur-sm rounded-2xl p-6 border border-green-500/30"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="p-3 bg-green-500/20 rounded-xl">
                <DollarSign className="w-6 h-6 text-green-400" />
              </div>
              <h3 className="text-white/80 font-semibold">Monthly Revenue</h3>
            </div>
            <p className="text-4xl font-bold text-white">
              {formatCurrency(totalMonthlyRevenue)}
            </p>
          </motion.div>

          {/* Active Supporters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-br from-pink-500/20 to-rose-500/20 backdrop-blur-sm rounded-2xl p-6 border border-pink-500/30"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="p-3 bg-pink-500/20 rounded-xl">
                <Heart className="w-6 h-6 text-pink-400" />
              </div>
              <h3 className="text-white/80 font-semibold">Active Supporters</h3>
            </div>
            <p className="text-4xl font-bold text-white">
              {revenueData?.activeSupports || 0}
            </p>
          </motion.div>

          {/* Direct Sales */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 backdrop-blur-sm rounded-2xl p-6 border border-blue-500/30"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="p-3 bg-blue-500/20 rounded-xl">
                <ShoppingCart className="w-6 h-6 text-blue-400" />
              </div>
              <h3 className="text-white/80 font-semibold">Direct Sales</h3>
            </div>
            <p className="text-4xl font-bold text-white">
              {formatCurrency(revenueData?.monthlyRevenue.directSales || 0)}
            </p>
          </motion.div>

          {/* Creator Support */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-gradient-to-br from-purple-500/20 to-violet-500/20 backdrop-blur-sm rounded-2xl p-6 border border-purple-500/30"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="p-3 bg-purple-500/20 rounded-xl">
                <Users className="w-6 h-6 text-purple-400" />
              </div>
              <h3 className="text-white/80 font-semibold">Creator Support</h3>
            </div>
            <p className="text-4xl font-bold text-white">
              {formatCurrency(revenueData?.monthlyRevenue.creatorSupport || 0)}
            </p>
          </motion.div>
        </div>

        {/* Revenue Breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 mb-12"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">Revenue Breakdown</h2>
            <button className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-white transition-all">
              <Download size={18} />
              Export
            </button>
          </div>

          <div className="space-y-4">
            {/* Direct Sales */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <ShoppingCart size={18} className="text-blue-400" />
                  <span className="text-white">Direct Game Sales</span>
                </div>
                <span className="text-white font-semibold">
                  {formatCurrency(revenueData?.monthlyRevenue.directSales || 0)}
                </span>
              </div>
              <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-cyan-500"
                  style={{
                    width: `${totalMonthlyRevenue > 0 ? ((revenueData?.monthlyRevenue.directSales || 0) / totalMonthlyRevenue) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>

            {/* Creator Support */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Heart size={18} className="text-pink-400" />
                  <span className="text-white">Creator Support Subscriptions</span>
                </div>
                <span className="text-white font-semibold">
                  {formatCurrency(revenueData?.monthlyRevenue.creatorSupport || 0)}
                </span>
              </div>
              <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-pink-500 to-rose-500"
                  style={{
                    width: `${totalMonthlyRevenue > 0 ? ((revenueData?.monthlyRevenue.creatorSupport || 0) / totalMonthlyRevenue) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>

            {/* Pro Playtime */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <TrendingUp size={18} className="text-purple-400" />
                  <span className="text-white">Gamer Pro Playtime Revenue</span>
                </div>
                <span className="text-white font-semibold">
                  {formatCurrency(revenueData?.monthlyRevenue.proPlaytime || 0)}
                </span>
              </div>
              <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-purple-500 to-violet-500"
                  style={{
                    width: `${totalMonthlyRevenue > 0 ? ((revenueData?.monthlyRevenue.proPlaytime || 0) / totalMonthlyRevenue) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>

            {/* Tips */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Gift size={18} className="text-yellow-400" />
                  <span className="text-white">Tips & Donations</span>
                </div>
                <span className="text-white font-semibold">
                  {formatCurrency(revenueData?.monthlyRevenue.tips || 0)}
                </span>
              </div>
              <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-yellow-500 to-orange-500"
                  style={{
                    width: `${totalMonthlyRevenue > 0 ? ((revenueData?.monthlyRevenue.tips || 0) / totalMonthlyRevenue) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Info Cards */}
        <div className="grid md:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 backdrop-blur-sm rounded-2xl p-6 border border-purple-500/20"
          >
            <h3 className="text-xl font-bold text-white mb-4">How It Works</h3>
            <ul className="space-y-3 text-white/80">
              <li className="flex items-start gap-2">
                <span className="text-pink-400 mt-1">•</span>
                <span><strong>Direct Sales:</strong> 70% revenue from individual game purchases</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-pink-400 mt-1">•</span>
                <span><strong>Creator Support:</strong> Monthly revenue split among supported developers</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-pink-400 mt-1">•</span>
                <span><strong>Pro Playtime:</strong> Revenue based on gameplay hours from Pro members</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-pink-400 mt-1">•</span>
                <span><strong>Tips:</strong> 100% of tips go directly to you</span>
              </li>
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 backdrop-blur-sm rounded-2xl p-6 border border-green-500/20"
          >
            <h3 className="text-xl font-bold text-white mb-4">Grow Your Revenue</h3>
            <ul className="space-y-3 text-white/80">
              <li className="flex items-start gap-2">
                <span className="text-green-400 mt-1">✓</span>
                <span>Post regular devlogs to engage supporters</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-400 mt-1">✓</span>
                <span>Offer exclusive beta access and cosmetics</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-400 mt-1">✓</span>
                <span>Get featured on the homepage</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-400 mt-1">✓</span>
                <span>Join the Pro Library for more exposure</span>
              </li>
            </ul>
          </motion.div>
        </div>
      </motion.main>
    </div>
  );
}

