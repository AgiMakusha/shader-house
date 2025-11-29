'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Particles from '@/components/fx/Particles';
import { DeveloperSupportCard } from '@/components/subscriptions/DeveloperSupportCard';
import { Heart, AlertCircle } from 'lucide-react';

interface Developer {
  id: string;
  name: string;
  email: string;
  image?: string;
  _count: {
    games: number;
  };
  isSupported?: boolean;
}

export default function DeveloperSupportPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [developers, setDevelopers] = useState<Developer[]>([]);
  const [supportedCount, setSupportedCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');

  const maxSupports = user?.subscriptionTier === 'CREATOR_SUPPORT' ? 3 : 
                      user?.subscriptionTier === 'GAMER_PRO' ? Infinity : 0;

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
      setUser(userData.user);

      // Check subscription
      if (userData.user.subscriptionTier === 'FREE') {
        router.push('/membership');
        return;
      }

      // Get developers and support status
      const devsRes = await fetch('/api/developers/list');
      const devsData = await devsRes.json();

      // Get user's supported developers
      const supportRes = await fetch('/api/subscriptions/supported-developers');
      const supportData = await supportRes.json();
      const supportedIds = new Set(supportData.supported.map((s: any) => s.developerId));

      const devsWithSupport = devsData.developers.map((dev: Developer) => ({
        ...dev,
        isSupported: supportedIds.has(dev.id),
      }));

      setDevelopers(devsWithSupport);
      setSupportedCount(supportedIds.size);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSupport = async (developerId: string) => {
    try {
      const res = await fetch('/api/subscriptions/support-developer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ developerId }),
      });

      if (res.ok) {
        await loadData();
      } else {
        const error = await res.json();
        alert(error.error || 'Failed to support developer');
      }
    } catch (error) {
      console.error('Error supporting developer:', error);
      alert('An error occurred');
    }
  };

  const handleUnsupport = async (developerId: string) => {
    try {
      const res = await fetch('/api/subscriptions/unsupport-developer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ developerId }),
      });

      if (res.ok) {
        await loadData();
      } else {
        const error = await res.json();
        alert(error.error || 'Failed to unsupport developer');
      }
    } catch (error) {
      console.error('Error unsupporting developer:', error);
      alert('An error occurred');
    }
  };

  const filteredDevelopers = developers.filter((dev) =>
    dev.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const supportedDevelopers = filteredDevelopers.filter((dev) => dev.isSupported);
  const availableDevelopers = filteredDevelopers.filter((dev) => !dev.isSupported);

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
          className="max-w-4xl mx-auto mb-12 text-center"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <Heart className="w-12 h-12 text-pink-400 fill-current" />
            <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Support Developers
            </h1>
          </div>
          <p className="text-xl text-white/70 mb-6">
            Choose developers to support and get exclusive access to their content
          </p>

          {/* Support Status */}
          <div className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-xl px-6 py-3 border border-white/20">
            <span className="text-white/80">Supporting:</span>
            <span className="text-2xl font-bold text-white">
              {supportedCount}
            </span>
            {maxSupports !== Infinity && (
              <>
                <span className="text-white/60">/</span>
                <span className="text-xl font-semibold text-white/80">
                  {maxSupports}
                </span>
              </>
            )}
          </div>
        </motion.div>

        {/* Info Box */}
        {maxSupports !== Infinity && supportedCount >= maxSupports && (
          <motion.div
            className="max-w-4xl mx-auto mb-8 bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 flex items-start gap-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-yellow-200 font-semibold mb-1">
                Maximum developers reached
              </p>
              <p className="text-yellow-200/80 text-sm">
                Unsupport a developer to add a new one, or upgrade to Gamer Pro for unlimited support.
              </p>
            </div>
          </motion.div>
        )}

        {/* Search */}
        <div className="max-w-4xl mx-auto mb-8">
          <input
            type="text"
            placeholder="Search developers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-6 py-4 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
          />
        </div>

        {/* Supported Developers */}
        {supportedDevelopers.length > 0 && (
          <motion.div
            className="max-w-4xl mx-auto mb-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <h2 className="text-2xl font-bold text-white mb-6">
              Currently Supporting
            </h2>
            <div className="grid gap-4">
              {supportedDevelopers.map((dev) => (
                <DeveloperSupportCard
                  key={dev.id}
                  developer={{
                    id: dev.id,
                    name: dev.name,
                    image: dev.image,
                    gamesCount: dev._count.games,
                    isSupported: true,
                  }}
                  onSupport={handleSupport}
                  onUnsupport={handleUnsupport}
                />
              ))}
            </div>
          </motion.div>
        )}

        {/* Available Developers */}
        <motion.div
          className="max-w-4xl mx-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <h2 className="text-2xl font-bold text-white mb-6">
            {supportedDevelopers.length > 0 ? 'Discover More' : 'All Developers'}
          </h2>
          <div className="grid gap-4">
            {availableDevelopers.map((dev) => (
              <DeveloperSupportCard
                key={dev.id}
                developer={{
                  id: dev.id,
                  name: dev.name,
                  image: dev.image,
                  gamesCount: dev._count.games,
                  isSupported: false,
                }}
                onSupport={handleSupport}
                onUnsupport={handleUnsupport}
                disabled={supportedCount >= maxSupports}
              />
            ))}
          </div>

          {availableDevelopers.length === 0 && (
            <div className="text-center py-12">
              <p className="text-white/60">No developers found</p>
            </div>
          )}
        </motion.div>
      </motion.main>
    </div>
  );
}

