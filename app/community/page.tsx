'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { TrendingUp, MessageCircle, Flame, Clock } from 'lucide-react';
import { ThreadCard } from '@/components/discussions/ThreadCard';
import Particles from '@/components/fx/Particles';

export default function CommunityHubPage() {
  const [threads, setThreads] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'hot' | 'recent' | 'trending'>('all');
  const [user, setUser] = useState<any>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 1,
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchUser();
  }, []);

  useEffect(() => {
    loadAllThreads();
  }, [filter, pagination.page]);

  const fetchUser = async () => {
    try {
      const response = await fetch('/api/auth/me');
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
      }
    } catch (error) {
      console.error('Failed to fetch user:', error);
    }
  };

  const loadAllThreads = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        filter,
        page: pagination.page.toString(),
        limit: '20',
      });

      const response = await fetch(`/api/discussions/global?${params}`);

      if (!response.ok) {
        throw new Error('Failed to load discussions. Please try again.');
      }

      const data = await response.json();
      setThreads(data.threads);
      setPagination(data.pagination);
    } catch (err: any) {
      console.error('Failed to load threads:', err);
      setError(err.message || 'Failed to load discussions');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative" style={{ background: 'rgba(20, 30, 20, 0.95)' }}>
      <Particles />

      <div className="relative z-10 container mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-8">
          {user && (
            <div className="mb-4">
              <Link
                href={user.role === 'DEVELOPER' ? '/profile/developer' : '/profile/gamer'}
                className="text-sm hover:underline inline-block"
                style={{ color: 'rgba(180, 240, 180, 0.7)' }}
              >
                ← {user.role === 'DEVELOPER' ? 'Back to Developer Hub' : 'Back to Gamer Hub'}
              </Link>
            </div>
          )}
          
          <h1
            className="text-4xl font-bold mb-2 pixelized"
            style={{
              color: 'rgba(180, 240, 180, 0.95)',
              textShadow: '0 0 12px rgba(120, 200, 120, 0.6), 2px 2px 0px rgba(0, 0, 0, 0.8)',
            }}
          >
            Community Hub
          </h1>
          <p style={{ color: 'rgba(180, 220, 180, 0.7)' }}>
            Explore discussions across all games
          </p>
        </div>

        {/* Filter Buttons */}
        <div className="mb-8 flex flex-wrap items-center gap-3">
          <button
            onClick={() => {
              setFilter('all');
              setPagination({ ...pagination, page: 1 });
            }}
            className="px-6 py-3 rounded-lg font-bold text-sm uppercase tracking-wider transition-all"
            style={{
              background:
                filter === 'all'
                  ? 'linear-gradient(135deg, rgba(180, 240, 180, 0.4) 0%, rgba(120, 200, 120, 0.3) 100%)'
                  : 'rgba(40, 50, 40, 0.6)',
              border:
                filter === 'all'
                  ? '1px solid rgba(180, 240, 180, 0.4)'
                  : '1px solid rgba(100, 150, 100, 0.3)',
              color:
                filter === 'all'
                  ? 'rgba(200, 240, 200, 0.95)'
                  : 'rgba(180, 220, 180, 0.7)',
              boxShadow:
                filter === 'all'
                  ? '0 4px 12px rgba(120, 200, 120, 0.3)'
                  : 'none',
            }}
          >
            All Discussions
          </button>
          <button
            onClick={() => {
              setFilter('trending');
              setPagination({ ...pagination, page: 1 });
            }}
            className="px-6 py-3 rounded-lg font-bold text-sm uppercase tracking-wider transition-all flex items-center gap-2"
            style={{
              background:
                filter === 'trending'
                  ? 'linear-gradient(135deg, rgba(180, 240, 180, 0.4) 0%, rgba(120, 200, 120, 0.3) 100%)'
                  : 'rgba(40, 50, 40, 0.6)',
              border:
                filter === 'trending'
                  ? '1px solid rgba(180, 240, 180, 0.4)'
                  : '1px solid rgba(100, 150, 100, 0.3)',
              color:
                filter === 'trending'
                  ? 'rgba(200, 240, 200, 0.95)'
                  : 'rgba(180, 220, 180, 0.7)',
              boxShadow:
                filter === 'trending'
                  ? '0 4px 12px rgba(120, 200, 120, 0.3)'
                  : 'none',
            }}
          >
            <TrendingUp size={16} />
            Trending
          </button>
          <button
            onClick={() => {
              setFilter('hot');
              setPagination({ ...pagination, page: 1 });
            }}
            className="px-6 py-3 rounded-lg font-bold text-sm uppercase tracking-wider transition-all flex items-center gap-2"
            style={{
              background:
                filter === 'hot'
                  ? 'linear-gradient(135deg, rgba(255, 150, 100, 0.4) 0%, rgba(255, 100, 50, 0.3) 100%)'
                  : 'rgba(40, 50, 40, 0.6)',
              border:
                filter === 'hot'
                  ? '1px solid rgba(255, 150, 100, 0.4)'
                  : '1px solid rgba(100, 150, 100, 0.3)',
              color:
                filter === 'hot'
                  ? 'rgba(255, 200, 150, 0.95)'
                  : 'rgba(180, 220, 180, 0.7)',
              boxShadow:
                filter === 'hot'
                  ? '0 4px 12px rgba(255, 100, 50, 0.3)'
                  : 'none',
            }}
          >
            <Flame size={16} />
            Hot
          </button>
          <button
            onClick={() => {
              setFilter('recent');
              setPagination({ ...pagination, page: 1 });
            }}
            className="px-6 py-3 rounded-lg font-bold text-sm uppercase tracking-wider transition-all flex items-center gap-2"
            style={{
              background:
                filter === 'recent'
                  ? 'linear-gradient(135deg, rgba(150, 200, 255, 0.4) 0%, rgba(100, 150, 255, 0.3) 100%)'
                  : 'rgba(40, 50, 40, 0.6)',
              border:
                filter === 'recent'
                  ? '1px solid rgba(150, 200, 255, 0.4)'
                  : '1px solid rgba(100, 150, 100, 0.3)',
              color:
                filter === 'recent'
                  ? 'rgba(200, 220, 255, 0.95)'
                  : 'rgba(180, 220, 180, 0.7)',
              boxShadow:
                filter === 'recent'
                  ? '0 4px 12px rgba(100, 150, 255, 0.3)'
                  : 'none',
            }}
          >
            <Clock size={16} />
            Recent
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 rounded-lg mb-6"
            style={{
              background: 'rgba(255, 100, 100, 0.2)',
              border: '1px solid rgba(255, 150, 150, 0.4)',
              color: 'rgba(255, 200, 200, 0.9)',
            }}
          >
            {error}
          </motion.div>
        )}

        {/* Threads List */}
        {isLoading ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
            style={{ color: 'rgba(180, 220, 180, 0.7)' }}
          >
            Loading discussions...
          </motion.div>
        ) : threads.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-8 rounded-lg text-center"
            style={{
              background: 'rgba(40, 50, 40, 0.8)',
              border: '1px solid rgba(100, 150, 100, 0.3)',
              boxShadow: '0 4px 16px rgba(0, 0, 0, 0.3)',
            }}
          >
            <MessageCircle
              size={64}
              style={{
                color: 'rgba(180, 240, 180, 0.5)',
                margin: '0 auto 24px',
              }}
            />
            <h2
              className="text-2xl font-bold mb-4 pixelized"
              style={{
                color: 'rgba(180, 240, 180, 0.95)',
                textShadow: '0 0 8px rgba(120, 200, 120, 0.6)',
              }}
            >
              No discussions yet
            </h2>
            <p
              className="mb-6"
              style={{ color: 'rgba(180, 220, 180, 0.8)' }}
            >
              Be the first to start a conversation! Visit individual game pages to join discussions.
            </p>
            <Link
              href="/games"
              className="inline-block px-6 py-3 rounded-lg font-bold uppercase tracking-wider transition-all"
              style={{
                background: 'linear-gradient(135deg, rgba(180, 240, 180, 0.4) 0%, rgba(120, 200, 120, 0.3) 100%)',
                border: '1px solid rgba(180, 240, 180, 0.4)',
                color: 'rgba(200, 240, 200, 0.95)',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
              }}
            >
              Browse Games →
            </Link>
          </motion.div>
        ) : (
          <div className="flex flex-col gap-6">
            {threads.map((thread) => (
              <ThreadCard
                key={thread.id}
                thread={thread}
                gameSlug={thread.game.slug}
              />
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="mt-8 flex items-center justify-center gap-2">
            {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => {
                  setPagination({ ...pagination, page: p });
                }}
                className="px-4 py-2 rounded-lg font-bold transition-all"
                style={{
                  background:
                    p === pagination.page
                      ? 'linear-gradient(135deg, rgba(180, 240, 180, 0.4) 0%, rgba(120, 200, 120, 0.3) 100%)'
                      : 'rgba(40, 50, 40, 0.6)',
                  border:
                    p === pagination.page
                      ? '1px solid rgba(180, 240, 180, 0.4)'
                      : '1px solid rgba(100, 150, 100, 0.3)',
                  color:
                    p === pagination.page
                      ? 'rgba(200, 240, 200, 0.95)'
                      : 'rgba(180, 220, 180, 0.7)',
                }}
              >
                {p}
              </button>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
