'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  BookOpen,
  Users,
  FlaskConical,
  Sparkles,
  Filter,
  TrendingUp,
  Calendar,
  ChevronDown,
  Search,
  Rss,
} from 'lucide-react';
import { DevlogCard } from '@/components/devlogs/DevlogCard';
import Particles from '@/components/fx/Particles';
import { DevlogCategory } from '@prisma/client';

const categoryFilters: { value: DevlogCategory | 'all'; label: string; icon: any }[] = [
  { value: 'all', label: 'All Categories', icon: BookOpen },
  { value: 'BEHIND_THE_SCENES', label: 'Behind the Scenes', icon: Sparkles },
  { value: 'DEVELOPMENT_UPDATE', label: 'Dev Updates', icon: TrendingUp },
  { value: 'ANNOUNCEMENT', label: 'Announcements', icon: Rss },
  { value: 'TUTORIAL', label: 'Tutorials', icon: BookOpen },
  { value: 'POSTMORTEM', label: 'Postmortems', icon: FlaskConical },
  { value: 'TIPS_AND_TRICKS', label: 'Tips & Tricks', icon: Sparkles },
];

export default function DevlogsPage() {
  const [devlogs, setDevlogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [filter, setFilter] = useState<'all' | 'followed' | 'beta'>('all');
  const [category, setCategory] = useState<DevlogCategory | 'all'>('all');
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    pages: 1,
  });

  useEffect(() => {
    fetchUser();
  }, []);

  useEffect(() => {
    loadDevlogs();
  }, [filter, category, pagination.page]);

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

  const loadDevlogs = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        filter,
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
      });

      if (category !== 'all') {
        params.set('category', category);
      }

      const response = await fetch(`/api/devlogs?${params}`);
      if (!response.ok) throw new Error('Failed to load devlogs');

      const data = await response.json();
      setDevlogs(data.devlogs);
      setPagination(data.pagination);
    } catch (error) {
      console.error('Failed to load devlogs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const activeCategory = categoryFilters.find((c) => c.value === category);
  const ActiveIcon = activeCategory?.icon || BookOpen;

  return (
    <div className="min-h-screen relative" style={{ background: 'rgba(20, 30, 20, 0.95)' }}>
      <Particles />

      <div className="relative z-10 container mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-8">
          <div className="mb-4">
            <Link
              href="/profile/gamer"
              className="text-sm hover:underline inline-block"
              style={{ color: 'rgba(180, 240, 180, 0.7)' }}
            >
              ← Back to Gamer Hub
            </Link>
          </div>

          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div>
              <h1
                className="text-4xl font-bold mb-2 pixelized flex items-center gap-3"
                style={{
                  color: 'rgba(180, 240, 180, 0.95)',
                  textShadow: '0 0 12px rgba(120, 200, 120, 0.6), 2px 2px 0px rgba(0, 0, 0, 0.8)',
                }}
              >
                <BookOpen size={36} />
                Developer Devlogs
              </h1>
              <p style={{ color: 'rgba(180, 220, 180, 0.7)' }}>
                Behind-the-scenes stories, updates, and insights from indie developers
              </p>
            </div>

            {/* Featured Label */}
            <div
              className="flex items-center gap-2 px-4 py-2 rounded-lg"
              style={{
                background: 'rgba(200, 150, 255, 0.15)',
                border: '1px solid rgba(200, 150, 255, 0.3)',
              }}
            >
              <Sparkles size={18} style={{ color: 'rgba(200, 150, 255, 0.9)' }} />
              <span
                className="text-sm font-semibold"
                style={{ color: 'rgba(200, 150, 255, 0.9)' }}
              >
                Behind the Scenes
              </span>
            </div>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="mb-8 flex flex-wrap items-center gap-3">
          {/* Main Filters */}
          <button
            onClick={() => {
              setFilter('all');
              setPagination({ ...pagination, page: 1 });
            }}
            className="px-5 py-2.5 rounded-lg font-bold text-sm uppercase tracking-wider transition-all flex items-center gap-2"
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
                filter === 'all' ? '0 4px 12px rgba(120, 200, 120, 0.3)' : 'none',
            }}
          >
            <BookOpen size={16} />
            All Games
          </button>

          <button
            onClick={() => {
              setFilter('followed');
              setPagination({ ...pagination, page: 1 });
            }}
            className="px-5 py-2.5 rounded-lg font-bold text-sm uppercase tracking-wider transition-all flex items-center gap-2"
            style={{
              background:
                filter === 'followed'
                  ? 'linear-gradient(135deg, rgba(150, 200, 255, 0.4) 0%, rgba(100, 150, 255, 0.3) 100%)'
                  : 'rgba(40, 50, 40, 0.6)',
              border:
                filter === 'followed'
                  ? '1px solid rgba(150, 200, 255, 0.4)'
                  : '1px solid rgba(100, 150, 100, 0.3)',
              color:
                filter === 'followed'
                  ? 'rgba(200, 220, 255, 0.95)'
                  : 'rgba(180, 220, 180, 0.7)',
              boxShadow:
                filter === 'followed' ? '0 4px 12px rgba(100, 150, 255, 0.3)' : 'none',
            }}
          >
            <Users size={16} />
            Followed Devs
          </button>

          <button
            onClick={() => {
              setFilter('beta');
              setPagination({ ...pagination, page: 1 });
            }}
            className="px-5 py-2.5 rounded-lg font-bold text-sm uppercase tracking-wider transition-all flex items-center gap-2"
            style={{
              background:
                filter === 'beta'
                  ? 'linear-gradient(135deg, rgba(255, 180, 100, 0.4) 0%, rgba(255, 140, 60, 0.3) 100%)'
                  : 'rgba(40, 50, 40, 0.6)',
              border:
                filter === 'beta'
                  ? '1px solid rgba(255, 180, 100, 0.4)'
                  : '1px solid rgba(100, 150, 100, 0.3)',
              color:
                filter === 'beta'
                  ? 'rgba(255, 220, 180, 0.95)'
                  : 'rgba(180, 220, 180, 0.7)',
              boxShadow:
                filter === 'beta' ? '0 4px 12px rgba(255, 140, 60, 0.3)' : 'none',
            }}
          >
            <FlaskConical size={16} />
            Beta Games
          </button>

          {/* Divider */}
          <div
            className="hidden md:block w-px h-8"
            style={{ background: 'rgba(100, 150, 100, 0.3)' }}
          />

          {/* Category Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
              className="px-5 py-2.5 rounded-lg font-bold text-sm uppercase tracking-wider transition-all flex items-center gap-2"
              style={{
                background:
                  category !== 'all'
                    ? 'linear-gradient(135deg, rgba(200, 150, 255, 0.4) 0%, rgba(160, 100, 220, 0.3) 100%)'
                    : 'rgba(40, 50, 40, 0.6)',
                border:
                  category !== 'all'
                    ? '1px solid rgba(200, 150, 255, 0.4)'
                    : '1px solid rgba(100, 150, 100, 0.3)',
                color:
                  category !== 'all'
                    ? 'rgba(220, 200, 255, 0.95)'
                    : 'rgba(180, 220, 180, 0.7)',
              }}
            >
              <ActiveIcon size={16} />
              {activeCategory?.label || 'Category'}
              <ChevronDown size={14} />
            </button>

            {showCategoryDropdown && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute top-full left-0 mt-2 w-56 rounded-lg overflow-hidden z-50"
                style={{
                  background: 'rgba(30, 40, 30, 0.98)',
                  border: '1px solid rgba(100, 150, 100, 0.3)',
                  boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)',
                }}
              >
                {categoryFilters.map((cat) => {
                  const Icon = cat.icon;
                  return (
                    <button
                      key={cat.value}
                      onClick={() => {
                        setCategory(cat.value);
                        setShowCategoryDropdown(false);
                        setPagination({ ...pagination, page: 1 });
                      }}
                      className="w-full px-4 py-2.5 flex items-center gap-3 text-left hover:bg-white/10 transition-colors"
                      style={{
                        color:
                          category === cat.value
                            ? 'rgba(200, 240, 200, 0.95)'
                            : 'rgba(180, 220, 180, 0.8)',
                        background:
                          category === cat.value
                            ? 'rgba(120, 200, 120, 0.15)'
                            : 'transparent',
                      }}
                    >
                      <Icon size={16} />
                      <span className="text-sm font-medium">{cat.label}</span>
                    </button>
                  );
                })}
              </motion.div>
            )}
          </div>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="h-80 rounded-xl animate-pulse"
                style={{ background: 'rgba(40, 50, 40, 0.6)' }}
              />
            ))}
          </div>
        ) : devlogs.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16"
          >
            <BookOpen
              size={64}
              className="mx-auto mb-6"
              style={{ color: 'rgba(180, 240, 180, 0.3)' }}
            />
            <h2
              className="text-2xl font-bold mb-4 pixelized"
              style={{
                color: 'rgba(180, 240, 180, 0.95)',
                textShadow: '0 0 8px rgba(120, 200, 120, 0.6)',
              }}
            >
              No devlogs found
            </h2>
            <p className="mb-6" style={{ color: 'rgba(180, 220, 180, 0.7)' }}>
              {filter === 'followed'
                ? "You're not following any developers yet, or they haven't posted devlogs."
                : filter === 'beta'
                ? 'No devlogs for beta games available right now.'
                : 'Check back soon for new developer insights!'}
            </p>
            {filter !== 'all' && (
              <button
                onClick={() => setFilter('all')}
                className="px-6 py-3 rounded-lg font-bold transition-all"
                style={{
                  background: 'linear-gradient(135deg, rgba(180, 240, 180, 0.4) 0%, rgba(120, 200, 120, 0.3) 100%)',
                  border: '1px solid rgba(180, 240, 180, 0.4)',
                  color: 'rgba(200, 240, 200, 0.95)',
                }}
              >
                View All Devlogs
              </button>
            )}
          </motion.div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {devlogs.map((devlog) => (
                <DevlogCard key={devlog.id} devlog={devlog} />
              ))}
            </div>

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="mt-12 flex items-center justify-center gap-2">
                <button
                  onClick={() =>
                    setPagination({ ...pagination, page: Math.max(1, pagination.page - 1) })
                  }
                  disabled={pagination.page === 1}
                  className="px-4 py-2 rounded-lg font-bold transition-all disabled:opacity-50"
                  style={{
                    background: 'rgba(40, 50, 40, 0.6)',
                    border: '1px solid rgba(100, 150, 100, 0.3)',
                    color: 'rgba(180, 220, 180, 0.7)',
                  }}
                >
                  Previous
                </button>

                {[...Array(pagination.pages)].map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setPagination({ ...pagination, page: i + 1 })}
                    className="px-4 py-2 rounded-lg font-bold transition-all"
                    style={{
                      background:
                        pagination.page === i + 1
                          ? 'linear-gradient(135deg, rgba(180, 240, 180, 0.4) 0%, rgba(120, 200, 120, 0.3) 100%)'
                          : 'rgba(40, 50, 40, 0.6)',
                      border:
                        pagination.page === i + 1
                          ? '1px solid rgba(180, 240, 180, 0.4)'
                          : '1px solid rgba(100, 150, 100, 0.3)',
                      color:
                        pagination.page === i + 1
                          ? 'rgba(200, 240, 200, 0.95)'
                          : 'rgba(180, 220, 180, 0.7)',
                    }}
                  >
                    {i + 1}
                  </button>
                ))}

                <button
                  onClick={() =>
                    setPagination({
                      ...pagination,
                      page: Math.min(pagination.pages, pagination.page + 1),
                    })
                  }
                  disabled={pagination.page === pagination.pages}
                  className="px-4 py-2 rounded-lg font-bold transition-all disabled:opacity-50"
                  style={{
                    background: 'rgba(40, 50, 40, 0.6)',
                    border: '1px solid rgba(100, 150, 100, 0.3)',
                    color: 'rgba(180, 220, 180, 0.7)',
                  }}
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Click outside to close dropdown */}
      {showCategoryDropdown && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowCategoryDropdown(false)}
        />
      )}
    </div>
  );
}

