'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Particles from '@/components/fx/Particles';
import { GameCard as GameCardComponent } from '@/components/games/GameCard';
import { FeatureGate } from '@/components/subscriptions/FeatureGate';
import { Crown, Star, TrendingUp, Clock } from 'lucide-react';

interface Game {
  id: string;
  slug: string;
  title: string;
  tagline: string;
  coverUrl: string;
  priceCents: number;
  avgRating: number;
  favCount: number;
  developer: {
    name: string;
  };
}

export default function ProLibraryPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [games, setGames] = useState<Game[]>([]);
  const [filter, setFilter] = useState<'all' | 'new' | 'popular' | 'hidden'>('all');

  useEffect(() => {
    loadData();
  }, [filter, router]);

  const loadData = async () => {
    try {
      const userRes = await fetch('/api/auth/me');
      if (userRes.ok) {
        const userData = await userRes.json();
        setUser(userData.user);
        
        // Redirect if user doesn't have Gamer Pro access
        if (userData.user.subscriptionTier !== 'GAMER_PRO') {
          // Give them a moment to see what they're missing, then redirect
          setTimeout(() => {
            router.push('/membership');
          }, 2000);
        }
      }

      // Fetch Pro Library games
      const gamesRes = await fetch(`/api/games/pro-library?filter=${filter}`);
      if (gamesRes.ok) {
        const gamesData = await gamesRes.json();
        setGames(gamesData.games);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

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
          <div className="flex items-center justify-between mb-6">
            <Link
              href="/profile/gamer"
              className="text-sm font-semibold uppercase tracking-wider text-white/70 hover:text-white transition-all hover:underline"
            >
              ← Back to Gamer Hub
            </Link>
            <Link
              href="/games"
              className="text-sm font-semibold uppercase tracking-wider text-white/70 hover:text-white transition-all hover:underline"
            >
              Browse All Games →
            </Link>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Crown className="w-12 h-12 text-purple-400" />
              <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                Pro Library
              </h1>
            </div>
            <p className="text-xl text-white/70 mb-8">
              Unlimited access to curated indie games
            </p>
          </div>
        </motion.div>

        <FeatureGate requiredTier="GAMER_PRO" userTier={user?.subscriptionTier}>
          {/* Filter Tabs */}
          <motion.div
            className="flex flex-wrap justify-center gap-4 mb-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            {[
              { id: 'all', label: 'All Games', icon: Crown },
              { id: 'new', label: 'New This Month', icon: Star },
              { id: 'popular', label: 'Most Popular', icon: TrendingUp },
              { id: 'hidden', label: 'Hidden Gems', icon: Clock },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setFilter(tab.id as any)}
                  className={`
                    flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all
                    ${
                      filter === tab.id
                        ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/50'
                        : 'bg-white/10 text-white/70 hover:bg-white/20'
                    }
                  `}
                >
                  <Icon size={18} />
                  {tab.label}
                </button>
              );
            })}
          </motion.div>

          {/* Games Grid */}
          {games.length > 0 ? (
            <motion.div
              className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              {games.map((game, index) => (
                <motion.div
                  key={game.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index }}
                >
                  <GameCardComponent game={game} userTier={user?.subscriptionTier} />
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <div className="text-center py-20">
              <p className="text-white/60 text-lg">No games found in this category</p>
            </div>
          )}

          {/* Benefits Banner */}
          <motion.div
            className="mt-16 bg-gradient-to-br from-purple-500/20 to-pink-500/20 backdrop-blur-sm rounded-2xl p-8 border border-purple-500/30"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <h3 className="text-2xl font-bold text-white mb-4 text-center">
              Gamer Pro Benefits
            </h3>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <Crown className="w-10 h-10 text-purple-400 mx-auto mb-3" />
                <h4 className="font-semibold text-white mb-2">Unlimited Access</h4>
                <p className="text-white/70 text-sm">
                  Play any game in the Pro Library whenever you want
                </p>
              </div>
              <div className="text-center">
                <Star className="w-10 h-10 text-yellow-400 mx-auto mb-3" />
                <h4 className="font-semibold text-white mb-2">New Games Monthly</h4>
                <p className="text-white/70 text-sm">
                  Fresh indie titles added every month
                </p>
              </div>
              <div className="text-center">
                <TrendingUp className="w-10 h-10 text-green-400 mx-auto mb-3" />
                <h4 className="font-semibold text-white mb-2">Support Developers</h4>
                <p className="text-white/70 text-sm">
                  Your playtime generates revenue for creators
                </p>
              </div>
            </div>
          </motion.div>
        </FeatureGate>
      </motion.main>
    </div>
  );
}

