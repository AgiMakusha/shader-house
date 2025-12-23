'use client';

import { useState, useEffect, use } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { formatDistanceToNow, format } from 'date-fns';
import {
  ArrowLeft,
  Calendar,
  Eye,
  Heart,
  MessageCircle,
  Share2,
  Gamepad2,
  UserPlus,
  UserMinus,
  Code2,
  Sparkles,
  Megaphone,
  BookOpen,
  Lightbulb,
  FlaskConical,
  TrendingUp,
  ExternalLink,
  Edit,
} from 'lucide-react';
import { DevlogComments } from '@/components/devlogs/DevlogComments';
import { Avatar } from '@/components/profile/Avatar';
import { UserProfileModal } from '@/components/profile/UserProfileModal';
import Particles from '@/components/fx/Particles';
import { DevlogCategory } from '@prisma/client';

const getCategoryInfo = (category: DevlogCategory) => {
  switch (category) {
    case 'BEHIND_THE_SCENES':
      return { icon: Sparkles, label: 'Behind the Scenes', color: 'rgba(200, 150, 255, 0.9)' };
    case 'DEVELOPMENT_UPDATE':
      return { icon: Code2, label: 'Development Update', color: 'rgba(100, 200, 255, 0.9)' };
    case 'ANNOUNCEMENT':
      return { icon: Megaphone, label: 'Announcement', color: 'rgba(255, 180, 100, 0.9)' };
    case 'TUTORIAL':
      return { icon: BookOpen, label: 'Tutorial', color: 'rgba(100, 220, 150, 0.9)' };
    case 'POSTMORTEM':
      return { icon: FlaskConical, label: 'Postmortem', color: 'rgba(255, 150, 150, 0.9)' };
    case 'TIPS_AND_TRICKS':
      return { icon: Lightbulb, label: 'Tips & Tricks', color: 'rgba(255, 220, 100, 0.9)' };
    default:
      return { icon: BookOpen, label: category.replace(/_/g, ' '), color: 'rgba(180, 220, 180, 0.9)' };
  }
};

export default function DevlogPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const [devlog, setDevlog] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [isLiked, setIsLiked] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  useEffect(() => {
    fetchUser();
    fetchDevlog();
  }, [slug]);

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

  const fetchDevlog = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/devlogs/${slug}`);
      if (!response.ok) {
        if (response.status === 404) {
          setDevlog(null);
          return;
        }
        throw new Error('Failed to load devlog');
      }

      const data = await response.json();
      setDevlog(data.devlog);
      setIsLiked(data.devlog.isLiked || false);
      setIsSubscribed(data.devlog.isSubscribed || false);
      setLikeCount(data.devlog._count.likes);
    } catch (error) {
      console.error('Failed to load devlog:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLike = async () => {
    if (!user) {
      window.location.href = '/login';
      return;
    }

    try {
      if (isLiked) {
        await fetch(`/api/devlogs/${slug}/like`, { method: 'DELETE' });
        setLikeCount(likeCount - 1);
      } else {
        await fetch(`/api/devlogs/${slug}/like`, { method: 'POST' });
        setLikeCount(likeCount + 1);
      }
      setIsLiked(!isLiked);
    } catch (error) {
      console.error('Failed to toggle like:', error);
    }
  };

  const handleSubscribe = async () => {
    if (!user) {
      window.location.href = '/login';
      return;
    }

    try {
      if (isSubscribed) {
        await fetch(`/api/devlogs/subscriptions?developerId=${devlog.developerId}`, {
          method: 'DELETE',
        });
      } else {
        await fetch('/api/devlogs/subscriptions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ developerId: devlog.developerId }),
        });
      }
      setIsSubscribed(!isSubscribed);
    } catch (error) {
      console.error('Failed to toggle subscription:', error);
    }
  };

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: devlog.title,
          text: devlog.excerpt || 'Check out this devlog!',
          url,
        });
      } catch (error) {
        console.log('Share cancelled');
      }
    } else {
      await navigator.clipboard.writeText(url);
      alert('Link copied to clipboard!');
    }
  };

  const handleCommentAdded = (comment: any) => {
    setDevlog({
      ...devlog,
      comments: [comment, ...devlog.comments],
      _count: { ...devlog._count, comments: devlog._count.comments + 1 },
    });
  };

  const handleCommentDeleted = (commentId: string) => {
    const removeComment = (comments: any[]): any[] => {
      return comments
        .filter((c) => c.id !== commentId)
        .map((c) => ({
          ...c,
          replies: c.replies ? removeComment(c.replies) : [],
        }));
    };
    setDevlog({
      ...devlog,
      comments: removeComment(devlog.comments),
      _count: { ...devlog._count, comments: devlog._count.comments - 1 },
    });
  };

  // Render markdown content
  const renderContent = (content: string) => {
    return content
      .replace(/^### (.*$)/gim, '<h3 class="text-lg font-bold text-green-300 mt-6 mb-3">$1</h3>')
      .replace(/^## (.*$)/gim, '<h2 class="text-xl font-bold text-green-200 mt-8 mb-4">$1</h2>')
      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold">$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`(.*?)`/g, '<code class="bg-black/30 px-1 py-0.5 rounded text-green-300">$1</code>')
      .replace(
        /!\[(.*?)\]\((.*?)\)/g,
        '<img src="$2" alt="$1" class="max-w-full rounded-lg my-6 shadow-lg" />'
      )
      .replace(
        /\[(.*?)\]\((.*?)\)/g,
        '<a href="$2" target="_blank" rel="noopener" class="text-green-400 underline hover:text-green-300">$1</a>'
      )
      .replace(
        /^> (.*$)/gim,
        '<blockquote class="border-l-4 border-green-500/50 pl-4 my-4 italic text-green-300/70">$1</blockquote>'
      )
      .replace(/^- (.*$)/gim, '<li class="ml-4 list-disc">$1</li>')
      .replace(/^\d+\. (.*$)/gim, '<li class="ml-4 list-decimal">$1</li>')
      .replace(/\n/g, '<br />');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'rgba(20, 30, 20, 0.95)' }}>
        <div className="text-center" style={{ color: 'rgba(180, 220, 180, 0.7)' }}>
          Loading devlog...
        </div>
      </div>
    );
  }

  if (!devlog) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'rgba(20, 30, 20, 0.95)' }}>
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4 pixelized" style={{ color: 'rgba(180, 240, 180, 0.95)' }}>
            Devlog not found
          </h1>
          <Link
            href="/devlogs"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-bold"
            style={{
              background: 'rgba(120, 200, 120, 0.3)',
              color: 'rgba(180, 240, 180, 0.9)',
              border: '1px solid rgba(120, 200, 120, 0.4)',
            }}
          >
            <ArrowLeft size={16} />
            Back to Devlogs
          </Link>
        </div>
      </div>
    );
  }

  const categoryInfo = getCategoryInfo(devlog.category);
  const CategoryIcon = categoryInfo.icon;
  const developerName =
    devlog.developer.developerProfile?.studioName ||
    devlog.developer.displayName ||
    devlog.developer.name;

  return (
    <div className="min-h-screen relative" style={{ background: 'rgba(20, 30, 20, 0.95)' }}>
      <Particles />

      <div className="relative z-10">
        {/* Cover Image */}
        {devlog.coverImage && (
          <div className="relative h-64 md:h-96 w-full">
            <Image
              src={devlog.coverImage}
              alt={devlog.title}
              fill
              className="object-cover"
              priority
            />
            <div
              className="absolute inset-0"
              style={{
                background: 'linear-gradient(to bottom, transparent 0%, rgba(20, 30, 20, 0.95) 100%)',
              }}
            />
          </div>
        )}

        <div className="container mx-auto px-4 py-8">
          {/* Back Link */}
          <Link
            href="/devlogs"
            className="inline-flex items-center gap-2 mb-6 hover:underline"
            style={{ color: 'rgba(180, 240, 180, 0.7)' }}
          >
            <ArrowLeft size={16} />
            Back to Devlogs
          </Link>

          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <header className="mb-8">
              {/* Category & Game */}
              <div className="flex flex-wrap items-center gap-3 mb-4">
                <span
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-bold uppercase tracking-wider"
                  style={{
                    background: `${categoryInfo.color}20`,
                    color: categoryInfo.color,
                    border: `1px solid ${categoryInfo.color}40`,
                  }}
                >
                  <CategoryIcon size={14} />
                  {categoryInfo.label}
                </span>

                {devlog.game && (
                  <Link
                    href={`/games/${devlog.game.slug}`}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold hover:opacity-80 transition-opacity"
                    style={{
                      background: 'rgba(120, 200, 120, 0.15)',
                      color: 'rgba(180, 240, 180, 0.9)',
                      border: '1px solid rgba(120, 200, 120, 0.3)',
                    }}
                  >
                    <Gamepad2 size={14} />
                    {devlog.game.title}
                    <ExternalLink size={12} />
                  </Link>
                )}

                {devlog.isOwner && (
                  <Link
                    href={`/profile/developer/devlogs/edit/${devlog.slug}`}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold hover:opacity-80 transition-opacity"
                    style={{
                      background: 'rgba(255, 200, 100, 0.15)',
                      color: 'rgba(255, 220, 150, 0.9)',
                      border: '1px solid rgba(255, 200, 100, 0.3)',
                    }}
                  >
                    <Edit size={14} />
                    Edit
                  </Link>
                )}
              </div>

              {/* Title */}
              <h1
                className="text-3xl md:text-4xl font-bold mb-4 pixelized"
                style={{
                  color: 'rgba(200, 240, 200, 0.95)',
                  textShadow: '0 0 12px rgba(120, 200, 120, 0.6)',
                }}
              >
                {devlog.title}
              </h1>

              {/* Meta Row */}
              <div className="flex flex-wrap items-center gap-6">
                {/* Author */}
                <div className="flex items-center gap-3">
                  <Avatar image={devlog.developer.image} role={devlog.developer.role} size={40} />
                  <div>
                    <button
                      onClick={() => setSelectedUserId(devlog.developerId)}
                      className="font-semibold hover:underline"
                      style={{ color: 'rgba(180, 220, 180, 0.95)' }}
                    >
                      {developerName}
                    </button>
                    <div className="flex items-center gap-2 text-xs" style={{ color: 'rgba(150, 180, 150, 0.6)' }}>
                      <Calendar size={12} />
                      {devlog.publishedAt
                        ? format(new Date(devlog.publishedAt), 'MMM d, yyyy')
                        : formatDistanceToNow(new Date(devlog.createdAt), { addSuffix: true })}
                    </div>
                  </div>
                </div>

                {/* Stats */}
                <div className="flex items-center gap-4 text-sm" style={{ color: 'rgba(180, 220, 180, 0.7)' }}>
                  <span className="flex items-center gap-1">
                    <Eye size={16} />
                    {devlog.views}
                  </span>
                  <span className="flex items-center gap-1">
                    <Heart size={16} />
                    {likeCount}
                  </span>
                  <span className="flex items-center gap-1">
                    <MessageCircle size={16} />
                    {devlog._count.comments}
                  </span>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 ml-auto">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleLike}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm transition-all"
                    style={{
                      background: isLiked ? 'rgba(255, 100, 150, 0.3)' : 'rgba(40, 50, 40, 0.8)',
                      color: isLiked ? 'rgba(255, 150, 180, 0.95)' : 'rgba(180, 220, 180, 0.9)',
                      border: isLiked ? '1px solid rgba(255, 100, 150, 0.4)' : '1px solid rgba(100, 150, 100, 0.3)',
                    }}
                  >
                    <Heart size={16} fill={isLiked ? 'currentColor' : 'none'} />
                    {isLiked ? 'Liked' : 'Like'}
                  </motion.button>

                  {user?.id !== devlog.developerId && (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleSubscribe}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm transition-all"
                      style={{
                        background: isSubscribed
                          ? 'rgba(100, 150, 255, 0.3)'
                          : 'linear-gradient(135deg, rgba(120, 200, 120, 0.4) 0%, rgba(80, 160, 80, 0.3) 100%)',
                        color: isSubscribed ? 'rgba(150, 200, 255, 0.95)' : 'rgba(180, 240, 180, 0.95)',
                        border: isSubscribed ? '1px solid rgba(100, 150, 255, 0.4)' : '1px solid rgba(120, 200, 120, 0.4)',
                      }}
                    >
                      {isSubscribed ? <UserMinus size={16} /> : <UserPlus size={16} />}
                      {isSubscribed ? 'Following' : 'Follow'}
                    </motion.button>
                  )}

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleShare}
                    className="p-2 rounded-lg transition-all"
                    style={{
                      background: 'rgba(40, 50, 40, 0.8)',
                      color: 'rgba(180, 220, 180, 0.9)',
                      border: '1px solid rgba(100, 150, 100, 0.3)',
                    }}
                  >
                    <Share2 size={16} />
                  </motion.button>
                </div>
              </div>

              {/* Tags */}
              {devlog.tags && devlog.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-4">
                  {devlog.tags.map((tag: string) => (
                    <span
                      key={tag}
                      className="px-3 py-1 rounded-full text-xs"
                      style={{
                        background: 'rgba(100, 150, 100, 0.2)',
                        color: 'rgba(180, 220, 180, 0.8)',
                      }}
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </header>

            {/* Content */}
            <article
              className="prose prose-invert max-w-none mb-12 p-8 rounded-xl"
              style={{
                background: 'rgba(30, 40, 30, 0.8)',
                border: '1px solid rgba(100, 150, 100, 0.2)',
                color: 'rgba(200, 240, 200, 0.9)',
              }}
              dangerouslySetInnerHTML={{ __html: renderContent(devlog.content) }}
            />

            {/* Game Card */}
            {devlog.game && (
              <Link
                href={`/games/${devlog.game.slug}`}
                className="block mb-12 rounded-xl overflow-hidden transition-transform hover:scale-[1.02]"
                style={{
                  background: 'rgba(30, 40, 30, 0.8)',
                  border: '1px solid rgba(100, 150, 100, 0.3)',
                }}
              >
                <div className="flex items-center gap-6 p-6">
                  <div className="relative w-24 h-24 rounded-lg overflow-hidden flex-shrink-0">
                    <Image
                      src={devlog.game.coverUrl}
                      alt={devlog.game.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Gamepad2 size={16} style={{ color: 'rgba(180, 240, 180, 0.7)' }} />
                      <span className="text-xs uppercase tracking-wider" style={{ color: 'rgba(180, 220, 180, 0.6)' }}>
                        Related Game
                      </span>
                    </div>
                    <h3 className="text-lg font-bold pixelized" style={{ color: 'rgba(200, 240, 200, 0.95)' }}>
                      {devlog.game.title}
                    </h3>
                    {devlog.game.tagline && (
                      <p className="text-sm" style={{ color: 'rgba(180, 220, 180, 0.7)' }}>
                        {devlog.game.tagline}
                      </p>
                    )}
                  </div>
                  <ExternalLink size={20} style={{ color: 'rgba(180, 240, 180, 0.5)' }} />
                </div>
              </Link>
            )}

            {/* Comments */}
            <DevlogComments
              comments={devlog.comments}
              devlogSlug={slug}
              developerId={devlog.developerId}
              currentUserId={user?.id}
              onCommentAdded={handleCommentAdded}
              onCommentDeleted={handleCommentDeleted}
            />
          </div>
        </div>
      </div>

      <UserProfileModal userId={selectedUserId} onClose={() => setSelectedUserId(null)} />
    </div>
  );
}

