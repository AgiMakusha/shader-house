'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { formatDistanceToNow } from 'date-fns';
import {
  BookOpen,
  Plus,
  Eye,
  Heart,
  MessageCircle,
  Edit2,
  Trash2,
  FileText,
  Send,
  Clock,
  TrendingUp,
  ArrowLeft,
} from 'lucide-react';
import Particles from '@/components/fx/Particles';
import { DevlogCategory } from '@prisma/client';

const getCategoryLabel = (category: DevlogCategory) => {
  switch (category) {
    case 'BEHIND_THE_SCENES': return 'Behind the Scenes';
    case 'DEVELOPMENT_UPDATE': return 'Dev Update';
    case 'ANNOUNCEMENT': return 'Announcement';
    case 'TUTORIAL': return 'Tutorial';
    case 'POSTMORTEM': return 'Postmortem';
    case 'TIPS_AND_TRICKS': return 'Tips & Tricks';
    default: return category;
  }
};

export default function DeveloperDevlogsPage() {
  const router = useRouter();
  const [devlogs, setDevlogs] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalPosts: 0,
    totalViews: 0,
    totalLikes: 0,
    draftCount: 0,
    publishedCount: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'published' | 'draft'>('all');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 1,
  });

  useEffect(() => {
    loadDevlogs();
  }, [filter, pagination.page]);

  const loadDevlogs = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        status: filter,
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
      });

      const response = await fetch(`/api/devlogs/my?${params}`);
      if (!response.ok) {
        if (response.status === 401) {
          router.push('/login');
          return;
        }
        throw new Error('Failed to load devlogs');
      }

      const data = await response.json();
      setDevlogs(data.devlogs);
      setStats(data.stats);
      setPagination(data.pagination);
    } catch (error) {
      console.error('Failed to load devlogs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (slug: string) => {
    if (!confirm('Are you sure you want to delete this devlog? This cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/devlogs/${slug}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete');

      setDevlogs(devlogs.filter((d) => d.slug !== slug));
    } catch (error) {
      console.error('Failed to delete devlog:', error);
      alert('Failed to delete devlog');
    }
  };

  return (
    <div className="min-h-screen relative" style={{ background: 'rgba(20, 30, 20, 0.95)' }}>
      <Particles />

      <div className="relative z-10 container mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/profile/developer"
            className="text-sm hover:underline inline-block mb-4"
            style={{ color: 'rgba(180, 240, 180, 0.7)' }}
          >
            <span className="flex items-center gap-1">
              <ArrowLeft size={14} />
              Back to Developer Hub
            </span>
          </Link>

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1
                className="text-4xl font-bold mb-2 pixelized flex items-center gap-3"
                style={{
                  color: 'rgba(180, 240, 180, 0.95)',
                  textShadow: '0 0 12px rgba(120, 200, 120, 0.6), 2px 2px 0px rgba(0, 0, 0, 0.8)',
                }}
              >
                <BookOpen size={36} />
                My Devlogs
              </h1>
              <p style={{ color: 'rgba(180, 220, 180, 0.7)' }}>
                Share your development journey with the community
              </p>
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => router.push('/profile/developer/devlogs/new')}
              className="flex items-center gap-2 px-6 py-3 rounded-lg font-bold transition-all"
              style={{
                background: 'linear-gradient(135deg, rgba(120, 200, 120, 0.5) 0%, rgba(80, 160, 80, 0.4) 100%)',
                color: 'rgba(220, 255, 220, 0.95)',
                border: '1px solid rgba(150, 220, 150, 0.5)',
                boxShadow: '0 4px 16px rgba(120, 200, 120, 0.3)',
              }}
            >
              <Plus size={20} />
              Write New Devlog
            </motion.button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <div
            className="p-4 rounded-xl text-center"
            style={{
              background: 'rgba(40, 50, 40, 0.8)',
              border: '1px solid rgba(100, 150, 100, 0.3)',
            }}
          >
            <div className="text-2xl font-bold pixelized" style={{ color: 'rgba(180, 240, 180, 0.95)' }}>
              {stats.totalPosts}
            </div>
            <div className="text-xs uppercase tracking-wider" style={{ color: 'rgba(180, 220, 180, 0.6)' }}>
              Total Posts
            </div>
          </div>

          <div
            className="p-4 rounded-xl text-center"
            style={{
              background: 'rgba(40, 50, 40, 0.8)',
              border: '1px solid rgba(100, 150, 100, 0.3)',
            }}
          >
            <div className="text-2xl font-bold pixelized" style={{ color: 'rgba(100, 200, 255, 0.95)' }}>
              {stats.publishedCount}
            </div>
            <div className="text-xs uppercase tracking-wider" style={{ color: 'rgba(180, 220, 180, 0.6)' }}>
              Published
            </div>
          </div>

          <div
            className="p-4 rounded-xl text-center"
            style={{
              background: 'rgba(40, 50, 40, 0.8)',
              border: '1px solid rgba(100, 150, 100, 0.3)',
            }}
          >
            <div className="text-2xl font-bold pixelized" style={{ color: 'rgba(255, 200, 100, 0.95)' }}>
              {stats.draftCount}
            </div>
            <div className="text-xs uppercase tracking-wider" style={{ color: 'rgba(180, 220, 180, 0.6)' }}>
              Drafts
            </div>
          </div>

          <div
            className="p-4 rounded-xl text-center"
            style={{
              background: 'rgba(40, 50, 40, 0.8)',
              border: '1px solid rgba(100, 150, 100, 0.3)',
            }}
          >
            <div className="text-2xl font-bold pixelized flex items-center justify-center gap-1" style={{ color: 'rgba(180, 220, 180, 0.95)' }}>
              <Eye size={18} />
              {stats.totalViews.toLocaleString()}
            </div>
            <div className="text-xs uppercase tracking-wider" style={{ color: 'rgba(180, 220, 180, 0.6)' }}>
              Total Views
            </div>
          </div>

          <div
            className="p-4 rounded-xl text-center"
            style={{
              background: 'rgba(40, 50, 40, 0.8)',
              border: '1px solid rgba(100, 150, 100, 0.3)',
            }}
          >
            <div className="text-2xl font-bold pixelized flex items-center justify-center gap-1" style={{ color: 'rgba(255, 150, 180, 0.95)' }}>
              <Heart size={18} />
              {stats.totalLikes}
            </div>
            <div className="text-xs uppercase tracking-wider" style={{ color: 'rgba(180, 220, 180, 0.6)' }}>
              Total Likes
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => {
              setFilter('all');
              setPagination({ ...pagination, page: 1 });
            }}
            className="px-5 py-2 rounded-lg font-bold text-sm uppercase tracking-wider transition-all"
            style={{
              background: filter === 'all' ? 'rgba(120, 200, 120, 0.3)' : 'rgba(40, 50, 40, 0.6)',
              border: filter === 'all' ? '1px solid rgba(120, 200, 120, 0.4)' : '1px solid rgba(100, 150, 100, 0.3)',
              color: filter === 'all' ? 'rgba(180, 240, 180, 0.95)' : 'rgba(180, 220, 180, 0.7)',
            }}
          >
            All ({stats.totalPosts})
          </button>
          <button
            onClick={() => {
              setFilter('published');
              setPagination({ ...pagination, page: 1 });
            }}
            className="px-5 py-2 rounded-lg font-bold text-sm uppercase tracking-wider transition-all flex items-center gap-2"
            style={{
              background: filter === 'published' ? 'rgba(100, 200, 255, 0.3)' : 'rgba(40, 50, 40, 0.6)',
              border: filter === 'published' ? '1px solid rgba(100, 200, 255, 0.4)' : '1px solid rgba(100, 150, 100, 0.3)',
              color: filter === 'published' ? 'rgba(150, 220, 255, 0.95)' : 'rgba(180, 220, 180, 0.7)',
            }}
          >
            <Send size={14} />
            Published ({stats.publishedCount})
          </button>
          <button
            onClick={() => {
              setFilter('draft');
              setPagination({ ...pagination, page: 1 });
            }}
            className="px-5 py-2 rounded-lg font-bold text-sm uppercase tracking-wider transition-all flex items-center gap-2"
            style={{
              background: filter === 'draft' ? 'rgba(255, 200, 100, 0.3)' : 'rgba(40, 50, 40, 0.6)',
              border: filter === 'draft' ? '1px solid rgba(255, 200, 100, 0.4)' : '1px solid rgba(100, 150, 100, 0.3)',
              color: filter === 'draft' ? 'rgba(255, 220, 150, 0.95)' : 'rgba(180, 220, 180, 0.7)',
            }}
          >
            <FileText size={14} />
            Drafts ({stats.draftCount})
          </button>
        </div>

        {/* Devlogs List */}
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="h-24 rounded-xl animate-pulse"
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
              {filter === 'draft'
                ? 'No drafts yet'
                : filter === 'published'
                ? 'No published devlogs yet'
                : 'Start your devlog journey'}
            </h2>
            <p className="mb-6" style={{ color: 'rgba(180, 220, 180, 0.7)' }}>
              Share your development stories, tips, and behind-the-scenes content with the community.
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => router.push('/profile/developer/devlogs/new')}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-bold"
              style={{
                background: 'linear-gradient(135deg, rgba(120, 200, 120, 0.5) 0%, rgba(80, 160, 80, 0.4) 100%)',
                color: 'rgba(220, 255, 220, 0.95)',
                border: '1px solid rgba(150, 220, 150, 0.5)',
              }}
            >
              <Plus size={20} />
              Write Your First Devlog
            </motion.button>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {devlogs.map((devlog) => (
              <motion.div
                key={devlog.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-4 p-4 rounded-xl"
                style={{
                  background: 'rgba(40, 50, 40, 0.8)',
                  border: '1px solid rgba(100, 150, 100, 0.3)',
                }}
              >
                {/* Cover Thumbnail */}
                {devlog.coverImage ? (
                  <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
                    <img
                      src={devlog.coverImage}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div
                    className="w-20 h-20 rounded-lg flex-shrink-0 flex items-center justify-center"
                    style={{ background: 'rgba(60, 80, 60, 0.6)' }}
                  >
                    <BookOpen size={32} style={{ color: 'rgba(180, 220, 180, 0.4)' }} />
                  </div>
                )}

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3
                      className="font-bold truncate pixelized"
                      style={{ color: 'rgba(200, 240, 200, 0.95)' }}
                    >
                      {devlog.title}
                    </h3>
                    {!devlog.isPublished && (
                      <span
                        className="px-2 py-0.5 rounded text-xs font-bold uppercase"
                        style={{
                          background: 'rgba(255, 200, 100, 0.2)',
                          color: 'rgba(255, 220, 150, 0.9)',
                        }}
                      >
                        Draft
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-4 text-xs" style={{ color: 'rgba(180, 220, 180, 0.6)' }}>
                    <span>{getCategoryLabel(devlog.category)}</span>
                    {devlog.game && <span>• {devlog.game.title}</span>}
                    <span className="flex items-center gap-1">
                      <Clock size={12} />
                      {formatDistanceToNow(new Date(devlog.updatedAt), { addSuffix: true })}
                    </span>
                  </div>

                  {devlog.isPublished && (
                    <div className="flex items-center gap-4 mt-2 text-xs" style={{ color: 'rgba(180, 220, 180, 0.7)' }}>
                      <span className="flex items-center gap-1">
                        <Eye size={12} />
                        {devlog.views}
                      </span>
                      <span className="flex items-center gap-1">
                        <Heart size={12} />
                        {devlog._count.likes}
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageCircle size={12} />
                        {devlog._count.comments}
                      </span>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  {devlog.isPublished && (
                    <Link
                      href={`/devlogs/${devlog.slug}`}
                      className="p-2 rounded-lg transition-all hover:bg-white/10"
                      title="View"
                    >
                      <Eye size={18} style={{ color: 'rgba(180, 220, 180, 0.7)' }} />
                    </Link>
                  )}
                  <Link
                    href={`/profile/developer/devlogs/edit/${devlog.slug}`}
                    className="p-2 rounded-lg transition-all hover:bg-white/10"
                    title="Edit"
                  >
                    <Edit2 size={18} style={{ color: 'rgba(180, 220, 180, 0.7)' }} />
                  </Link>
                  <button
                    onClick={() => handleDelete(devlog.slug)}
                    className="p-2 rounded-lg transition-all hover:bg-red-500/20"
                    title="Delete"
                  >
                    <Trash2 size={18} style={{ color: 'rgba(255, 150, 150, 0.7)' }} />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="mt-8 flex items-center justify-center gap-2">
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
          </div>
        )}
      </div>
    </div>
  );
}



