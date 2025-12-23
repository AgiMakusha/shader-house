'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import {
  User,
  MessageSquare,
  ChevronUp,
  Eye,
  Pin,
  Lock,
  CheckCircle,
  Code2,
  TrendingUp,
  Flame,
  Bug,
  Lightbulb,
} from 'lucide-react';
import { ThreadCategory } from '@prisma/client';
import { Avatar } from '@/components/profile/Avatar';
import { UserProfileModal } from '@/components/profile/UserProfileModal';

interface ThreadCardProps {
  thread: {
    id: string;
    title: string;
    category: ThreadCategory;
    isPinned: boolean;
    isLocked: boolean;
    isSolved: boolean;
    views: number;
    replyCount: number;
    createdAt: Date;
    author: {
      id: string;
      name: string;
      displayName?: string | null;
      image?: string | null;
      level: number;
      badges: string[];
      role: string;
    };
    game: {
      slug: string;
      title?: string;
      developerId: string;
    };
    gameName?: string; // Stored game name when thread was created
    _count?: {
      votes: number;
    };
  };
  gameSlug: string;
}

const getCategoryIcon = (category: ThreadCategory) => {
  switch (category) {
    case 'GENERAL':
      return MessageSquare;
    case 'BUG_REPORT':
      return Bug;
    case 'SUGGESTION':
      return Lightbulb;
    case 'SHOWCASE':
      return Eye;
    case 'ANNOUNCEMENT':
      return TrendingUp;
    default:
      return MessageSquare;
  }
};

const getCategoryColor = (category: ThreadCategory) => {
  switch (category) {
    case 'GENERAL':
      return 'rgba(150, 200, 255, 0.9)';
    case 'BUG_REPORT':
      return 'rgba(250, 150, 150, 0.9)';
    case 'SUGGESTION':
      return 'rgba(250, 220, 100, 0.9)';
    case 'SHOWCASE':
      return 'rgba(200, 150, 255, 0.9)';
    case 'ANNOUNCEMENT':
      return 'rgba(240, 220, 140, 0.9)';
    default:
      return 'rgba(150, 200, 255, 0.9)';
  }
};

export function ThreadCard({ thread, gameSlug }: ThreadCardProps) {
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const CategoryIcon = getCategoryIcon(thread.category);
  const categoryColor = getCategoryColor(thread.category);
  const isDevPost = thread.game.developerId === thread.author.id;
  const isHot = thread.replyCount > 20 && thread.views > 100;

  const handleAuthorClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedUserId(thread.author.id);
  };

  return (
    <>
      <Link href={`/games/${gameSlug}/community/${thread.id}`}>
        <motion.div
          whileHover={{ y: -2 }}
          className="relative p-4 rounded-lg transition-all"
          style={{
            background: thread.isPinned
              ? 'linear-gradient(135deg, rgba(240, 220, 140, 0.15) 0%, rgba(40, 50, 40, 0.8) 100%)'
              : 'rgba(40, 50, 40, 0.8)',
            border: thread.isPinned
              ? '1px solid rgba(240, 220, 140, 0.4)'
              : '1px solid rgba(100, 150, 100, 0.3)',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
          }}
        >
        {/* Top Badges */}
        <div className="flex items-center gap-2 mb-2">
          <div
            className="flex items-center gap-1 px-2 py-1 rounded text-xs font-bold uppercase"
            style={{
              background: `${categoryColor}20`,
              color: categoryColor,
              border: `1px solid ${categoryColor}40`,
            }}
          >
            <CategoryIcon size={12} />
            <span>{thread.category.replace('_', ' ')}</span>
          </div>

          {thread.isPinned && (
            <div
              className="flex items-center gap-1 px-2 py-1 rounded text-xs font-bold"
              style={{
                background: 'rgba(240, 220, 140, 0.2)',
                color: 'rgba(240, 220, 140, 0.9)',
                border: '1px solid rgba(240, 220, 140, 0.4)',
              }}
            >
              <Pin size={12} />
              <span>PINNED</span>
            </div>
          )}

          {thread.isLocked && (
            <div
              className="flex items-center gap-1 px-2 py-1 rounded text-xs"
              style={{
                background: 'rgba(255, 100, 100, 0.2)',
                color: 'rgba(255, 150, 150, 0.9)',
              }}
            >
              <Lock size={12} />
            </div>
          )}

          {thread.isSolved && (
            <div
              className="flex items-center gap-1 px-2 py-1 rounded text-xs font-bold"
              style={{
                background: 'rgba(100, 200, 100, 0.2)',
                color: 'rgba(100, 200, 100, 0.9)',
              }}
            >
              <CheckCircle size={12} />
              <span>SOLVED</span>
            </div>
          )}

          {isHot && (
            <div
              className="flex items-center gap-1 px-2 py-1 rounded text-xs font-bold"
              style={{
                background: 'rgba(255, 100, 50, 0.2)',
                color: 'rgba(255, 150, 100, 0.9)',
              }}
            >
              <Flame size={12} />
              <span>HOT</span>
            </div>
          )}

          {isDevPost && (
            <div
              className="flex items-center gap-1 px-2 py-1 rounded text-xs font-bold"
              style={{
                background: 'rgba(240, 220, 140, 0.2)',
                color: 'rgba(240, 220, 140, 0.9)',
                border: '1px solid rgba(240, 220, 140, 0.4)',
              }}
            >
              <Code2 size={12} />
              <span>DEV</span>
            </div>
          )}
        </div>

        {/* Game Name */}
        {(thread.gameName || thread.game.title) && (
          <div className="mb-2">
            <span
              className="text-xs font-semibold uppercase tracking-wider px-2 py-1 rounded"
              style={{
                background: 'rgba(120, 200, 120, 0.15)',
                color: 'rgba(180, 240, 180, 0.8)',
                border: '1px solid rgba(120, 200, 120, 0.3)',
              }}
            >
              {thread.gameName || thread.game.title}
            </span>
          </div>
        )}

        {/* Title */}
        <h3
          className="text-lg font-bold mb-2 pixelized line-clamp-2"
          style={{
            color: 'rgba(200, 240, 200, 0.95)',
            textShadow: '0 0 4px rgba(120, 200, 120, 0.3)',
          }}
        >
          {thread.title}
        </h3>

        {/* Author and Stats */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Avatar 
              image={thread.author.image} 
              role={thread.author.role} 
              size={20}
            />
            <button
              onClick={handleAuthorClick}
              className="text-sm hover:underline cursor-pointer"
              style={{ color: 'rgba(180, 220, 180, 0.9)' }}
            >
              {thread.author.displayName || thread.author.name}
            </button>
            <div
              className="flex items-center gap-1 text-xs"
              style={{ color: 'rgba(150, 180, 150, 0.7)' }}
            >
              <TrendingUp size={12} />
              <span>Lv. {thread.author.level}</span>
            </div>
            <span
              className="text-xs"
              style={{ color: 'rgba(150, 180, 150, 0.6)' }}
            >
              • {formatDistanceToNow(new Date(thread.createdAt), { addSuffix: true })}
            </span>
          </div>

          <div className="flex items-center gap-4 text-sm">
            <div
              className="flex items-center gap-1"
              style={{ color: 'rgba(180, 240, 180, 0.7)' }}
            >
              <MessageSquare size={14} />
              <span>{thread.replyCount}</span>
            </div>
            <div
              className="flex items-center gap-1"
              style={{ color: 'rgba(180, 240, 180, 0.7)' }}
            >
              <Eye size={14} />
              <span>{thread.views}</span>
            </div>
            {thread._count && thread._count.votes > 0 && (
              <div
                className="flex items-center gap-1"
                style={{ color: 'rgba(100, 200, 100, 0.9)' }}
              >
                <ChevronUp size={14} />
                <span>{thread._count.votes}</span>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </Link>
    <UserProfileModal
      userId={selectedUserId}
      onClose={() => setSelectedUserId(null)}
    />
    </>
  );
}
