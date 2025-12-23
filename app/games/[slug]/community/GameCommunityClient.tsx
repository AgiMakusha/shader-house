'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, Filter } from 'lucide-react';
import { ThreadCard } from '@/components/discussions/ThreadCard';
import { ThreadComposer } from '@/components/discussions/ThreadComposer';
import { Toast } from '@/components/discussions/Toast';
import { ThreadCategory } from '@prisma/client';

interface GameCommunityClientProps {
  gameId: string;
  gameSlug: string;
  isDeveloper: boolean;
  isLoggedIn: boolean;
  userRole?: 'DEVELOPER' | 'GAMER' | 'ADMIN';
  initialCategory: string;
  initialPage: number;
  viewOnly?: boolean;
}

const CATEGORIES = [
  { value: 'ALL', label: 'All Discussions' },
  { value: 'GENERAL', label: 'General' },
  { value: 'BUG_REPORT', label: 'Bug Reports' },
  { value: 'SUGGESTION', label: 'Suggestions' },
  { value: 'SHOWCASE', label: 'Showcase' },
  { value: 'ANNOUNCEMENT', label: 'Announcements' },
];

export function GameCommunityClient({
  gameId,
  gameSlug,
  isDeveloper,
  isLoggedIn,
  userRole,
  initialCategory,
  initialPage,
  viewOnly = false,
}: GameCommunityClientProps) {
  const [category, setCategory] = useState(initialCategory);
  const [page, setPage] = useState(initialPage);
  const [threads, setThreads] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showComposer, setShowComposer] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 1,
  });

  useEffect(() => {
    loadThreads();
  }, [category, page]);

  const loadThreads = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        gameId,
        page: page.toString(),
        limit: '20',
      });

      if (category !== 'ALL') {
        params.append('category', category);
      }

      const response = await fetch(`/api/discussions/threads?${params}`);

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
    <>
      <AnimatePresence>
        {error && (
          <Toast
            message={error}
            type="error"
            onClose={() => setError(null)}
          />
        )}
      </AnimatePresence>

      <div className="space-y-6">
      {/* Actions Bar */}
      <div className="flex flex-col gap-4">
        {/* Category Filter */}
        <div className="flex flex-wrap items-center gap-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              onClick={() => {
                setCategory(cat.value);
                setPage(1);
              }}
              className="px-4 py-2 rounded-lg font-bold text-sm uppercase tracking-wider whitespace-nowrap transition-all"
              style={{
                background:
                  category === cat.value
                    ? 'linear-gradient(135deg, rgba(180, 240, 180, 0.4) 0%, rgba(120, 200, 120, 0.3) 100%)'
                    : 'rgba(40, 50, 40, 0.6)',
                border:
                  category === cat.value
                    ? '1px solid rgba(180, 240, 180, 0.4)'
                    : '1px solid rgba(100, 150, 100, 0.3)',
                color:
                  category === cat.value
                    ? 'rgba(200, 240, 200, 0.95)'
                    : 'rgba(180, 220, 180, 0.7)',
                boxShadow:
                  category === cat.value
                    ? '0 4px 12px rgba(120, 200, 120, 0.3)'
                    : 'none',
              }}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* New Thread Button */}
        <div className="flex items-center">
          {isLoggedIn && (!viewOnly || userRole === 'DEVELOPER') && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowComposer(true)}
              className="px-6 py-2 rounded-lg font-bold text-sm uppercase tracking-wider flex items-center gap-2 whitespace-nowrap"
              style={{
                background: 'linear-gradient(135deg, rgba(180, 240, 180, 0.4) 0%, rgba(120, 200, 120, 0.3) 100%)',
                border: '1px solid rgba(180, 240, 180, 0.4)',
                color: 'rgba(200, 240, 200, 0.95)',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
              }}
            >
              <Plus size={16} />
              New Thread
            </motion.button>
          )}

          {viewOnly && userRole !== 'DEVELOPER' && (
            <p className="text-sm" style={{ color: 'rgba(200, 200, 200, 0.7)' }}>
              View only mode - Creating threads is disabled
            </p>
          )}

          {!isLoggedIn && (!viewOnly || userRole !== 'DEVELOPER') && (
            <p className="text-sm" style={{ color: 'rgba(180, 220, 180, 0.7)' }}>
              <a href="/login" className="underline">
                Log in
              </a>{' '}
              to start a discussion
            </p>
          )}
        </div>
      </div>

      {/* Threads List */}
      {isLoading ? (
        <div className="text-center py-12" style={{ color: 'rgba(180, 220, 180, 0.7)' }}>
          Loading discussions...
        </div>
      ) : threads.length === 0 ? (
        <div
          className="text-center py-12 rounded-lg"
          style={{
            background: 'rgba(40, 50, 40, 0.6)',
            border: '1px solid rgba(100, 150, 100, 0.3)',
          }}
        >
          <p className="text-lg mb-2" style={{ color: 'rgba(180, 220, 180, 0.9)' }}>
            No discussions yet
          </p>
          <p style={{ color: 'rgba(150, 180, 150, 0.7)' }}>
            Be the first to start a conversation!
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {threads.map((thread) => (
            <ThreadCard key={thread.id} thread={thread} gameSlug={gameSlug} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex items-center justify-center gap-2">
          {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => setPage(p)}
              className="px-4 py-2 rounded-lg font-bold transition-all"
              style={{
                background:
                  p === page
                    ? 'linear-gradient(135deg, rgba(180, 240, 180, 0.4) 0%, rgba(120, 200, 120, 0.3) 100%)'
                    : 'rgba(40, 50, 40, 0.6)',
                border:
                  p === page
                    ? '1px solid rgba(180, 240, 180, 0.4)'
                    : '1px solid rgba(100, 150, 100, 0.3)',
                color:
                  p === page ? 'rgba(200, 240, 200, 0.95)' : 'rgba(180, 220, 180, 0.7)',
              }}
            >
              {p}
            </button>
          ))}
        </div>
      )}

      {/* Thread Composer Modal */}
      <AnimatePresence>
        {showComposer && (
          <ThreadComposer
            gameId={gameId}
            gameSlug={gameSlug}
            onClose={() => setShowComposer(false)}
            isDeveloper={isDeveloper}
            userRole={userRole}
          />
        )}
      </AnimatePresence>
      </div>
    </>
  );
}

