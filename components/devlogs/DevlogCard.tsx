'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { formatDistanceToNow } from 'date-fns';
import {
  Eye,
  Heart,
  MessageCircle,
  Calendar,
  Gamepad2,
  Sparkles,
  Code2,
  Megaphone,
  BookOpen,
  Lightbulb,
  FlaskConical,
  ChevronRight,
} from 'lucide-react';
import { DevlogCategory } from '@prisma/client';
import { Avatar } from '@/components/profile/Avatar';
import { UserProfileModal } from '@/components/profile/UserProfileModal';

interface DevlogCardProps {
  devlog: {
    id: string;
    slug: string;
    title: string;
    excerpt?: string | null;
    coverImage?: string | null;
    category: DevlogCategory;
    views: number;
    likeCount: number;
    publishedAt: Date | null;
    createdAt: Date;
    isLiked?: boolean;
    developer: {
      id: string;
      name: string;
      displayName?: string | null;
      image?: string | null;
      role: string;
      developerProfile?: {
        studioName?: string | null;
        verificationStatus?: string;
      } | null;
    };
    game?: {
      id: string;
      title: string;
      slug: string;
      coverUrl: string;
      releaseStatus?: string;
    } | null;
    _count: {
      comments: number;
      likes: number;
    };
  };
  compact?: boolean;
}

const getCategoryInfo = (category: DevlogCategory) => {
  switch (category) {
    case 'BEHIND_THE_SCENES':
      return {
        icon: Sparkles,
        label: 'Behind the Scenes',
        color: 'rgba(200, 150, 255, 0.9)',
        bgColor: 'rgba(200, 150, 255, 0.15)',
      };
    case 'DEVELOPMENT_UPDATE':
      return {
        icon: Code2,
        label: 'Dev Update',
        color: 'rgba(100, 200, 255, 0.9)',
        bgColor: 'rgba(100, 200, 255, 0.15)',
      };
    case 'ANNOUNCEMENT':
      return {
        icon: Megaphone,
        label: 'Announcement',
        color: 'rgba(255, 180, 100, 0.9)',
        bgColor: 'rgba(255, 180, 100, 0.15)',
      };
    case 'TUTORIAL':
      return {
        icon: BookOpen,
        label: 'Tutorial',
        color: 'rgba(100, 220, 150, 0.9)',
        bgColor: 'rgba(100, 220, 150, 0.15)',
      };
    case 'POSTMORTEM':
      return {
        icon: FlaskConical,
        label: 'Postmortem',
        color: 'rgba(255, 150, 150, 0.9)',
        bgColor: 'rgba(255, 150, 150, 0.15)',
      };
    case 'TIPS_AND_TRICKS':
      return {
        icon: Lightbulb,
        label: 'Tips & Tricks',
        color: 'rgba(255, 220, 100, 0.9)',
        bgColor: 'rgba(255, 220, 100, 0.15)',
      };
    default:
      return {
        icon: BookOpen,
        label: category.replace(/_/g, ' '),
        color: 'rgba(180, 220, 180, 0.9)',
        bgColor: 'rgba(180, 220, 180, 0.15)',
      };
  }
};

export function DevlogCard({ devlog, compact = false }: DevlogCardProps) {
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const categoryInfo = getCategoryInfo(devlog.category);
  const CategoryIcon = categoryInfo.icon;

  const handleAuthorClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedUserId(devlog.developer.id);
  };

  const developerName =
    devlog.developer.developerProfile?.studioName ||
    devlog.developer.displayName ||
    devlog.developer.name;

  return (
    <>
      <Link href={`/devlogs/${devlog.slug}`}>
        <motion.article
          whileHover={{ y: -4, scale: 1.01 }}
          transition={{ type: 'spring', stiffness: 300 }}
          className={`relative overflow-hidden rounded-xl transition-all ${
            compact ? 'flex gap-4' : ''
          }`}
          style={{
            background:
              'linear-gradient(135deg, rgba(40, 50, 40, 0.95) 0%, rgba(30, 40, 30, 0.9) 100%)',
            border: '1px solid rgba(100, 150, 100, 0.3)',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.4)',
          }}
        >
          {/* Cover Image */}
          {devlog.coverImage && !compact && (
            <div className="relative h-48 w-full overflow-hidden">
              <Image
                src={devlog.coverImage}
                alt={devlog.title}
                fill
                className="object-cover"
              />
              <div
                className="absolute inset-0"
                style={{
                  background:
                    'linear-gradient(to top, rgba(30, 40, 30, 0.95) 0%, transparent 60%)',
                }}
              />
            </div>
          )}

          {/* Compact Cover */}
          {devlog.coverImage && compact && (
            <div className="relative h-24 w-32 flex-shrink-0 overflow-hidden rounded-lg">
              <Image
                src={devlog.coverImage}
                alt={devlog.title}
                fill
                className="object-cover"
              />
            </div>
          )}

          <div className={`p-5 ${devlog.coverImage && !compact ? '-mt-8 relative z-10' : ''}`}>
            {/* Category & Game Badge */}
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider"
                style={{
                  background: categoryInfo.bgColor,
                  color: categoryInfo.color,
                  border: `1px solid ${categoryInfo.color}40`,
                }}
              >
                <CategoryIcon size={12} />
                {categoryInfo.label}
              </span>

              {devlog.game && (
                <span
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
                  style={{
                    background: 'rgba(120, 200, 120, 0.15)',
                    color: 'rgba(180, 240, 180, 0.9)',
                    border: '1px solid rgba(120, 200, 120, 0.3)',
                  }}
                >
                  <Gamepad2 size={12} />
                  {devlog.game.title}
                  {devlog.game.releaseStatus === 'BETA' && (
                    <FlaskConical size={10} style={{ color: 'rgba(255, 180, 100, 0.9)' }} />
                  )}
                </span>
              )}
            </div>

            {/* Title */}
            <h3
              className={`font-bold mb-2 pixelized line-clamp-2 ${
                compact ? 'text-base' : 'text-xl'
              }`}
              style={{
                color: 'rgba(200, 240, 200, 0.95)',
                textShadow: '0 0 8px rgba(120, 200, 120, 0.4)',
              }}
            >
              {devlog.title}
            </h3>

            {/* Excerpt */}
            {devlog.excerpt && !compact && (
              <p
                className="text-sm mb-4 line-clamp-2"
                style={{ color: 'rgba(180, 220, 180, 0.7)' }}
              >
                {devlog.excerpt}
              </p>
            )}

            {/* Author Row */}
            <div className="flex items-center gap-2">
              <Avatar
                image={devlog.developer.image}
                role={devlog.developer.role}
                size={compact ? 20 : 24}
              />
              <button
                onClick={handleAuthorClick}
                className="text-sm font-medium hover:underline"
                style={{ color: 'rgba(180, 220, 180, 0.9)' }}
              >
                {developerName}
              </button>
              <span
                className="text-xs flex items-center gap-1"
                style={{ color: 'rgba(150, 180, 150, 0.6)' }}
              >
                <Calendar size={12} />
                {formatDistanceToNow(
                  new Date(devlog.publishedAt || devlog.createdAt),
                  { addSuffix: true }
                )}
              </span>
            </div>

            {/* Stats & Read More Row */}
            <div className="flex items-center justify-between mt-3">
              <div className="flex items-center gap-3 text-xs">
                <span
                  className="flex items-center gap-1"
                  style={{ color: 'rgba(180, 220, 180, 0.7)' }}
                >
                  <Eye size={14} />
                  {devlog.views}
                </span>
                <span
                  className={`flex items-center gap-1 ${
                    devlog.isLiked ? 'text-pink-400' : ''
                  }`}
                  style={
                    devlog.isLiked
                      ? undefined
                      : { color: 'rgba(180, 220, 180, 0.7)' }
                  }
                >
                  <Heart size={14} fill={devlog.isLiked ? 'currentColor' : 'none'} />
                  {devlog._count.likes}
                </span>
                <span
                  className="flex items-center gap-1"
                  style={{ color: 'rgba(180, 220, 180, 0.7)' }}
                >
                  <MessageCircle size={14} />
                  {devlog._count.comments}
                </span>
              </div>

              {/* Read More Arrow */}
              {!compact && (
                <div
                  className="flex items-center gap-1 text-xs font-semibold"
                  style={{ color: 'rgba(180, 240, 180, 0.7)' }}
                >
                  Read More
                  <ChevronRight size={14} />
                </div>
              )}
            </div>
          </div>
        </motion.article>
      </Link>

      <UserProfileModal
        userId={selectedUserId}
        onClose={() => setSelectedUserId(null)}
      />
    </>
  );
}

