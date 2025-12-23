'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import {
  User,
  MessageSquare,
  Eye,
  Pin,
  Lock,
  CheckCircle,
  Code2,
  TrendingUp,
  Send,
  Edit3,
  Trash2,
} from 'lucide-react';
import { VoteButton } from '@/components/discussions/VoteButton';
import { Toast } from '@/components/discussions/Toast';
import { ThreadCategory } from '@prisma/client';
import { Avatar } from '@/components/profile/Avatar';
import { UserProfileModal } from '@/components/profile/UserProfileModal';

interface ThreadDetailClientProps {
  threadId: string;
  gameId: string;
  gameSlug: string;
  gameDeveloperId: string;
  isDeveloper: boolean;
  isLoggedIn: boolean;
  userId?: string;
  userLevel: number;
  userRole?: 'DEVELOPER' | 'GAMER' | 'ADMIN';
  viewOnly?: boolean;
}

export function ThreadDetailClient({
  threadId,
  gameId,
  gameSlug,
  gameDeveloperId,
  isDeveloper,
  isLoggedIn,
  userId,
  userLevel,
  userRole,
  viewOnly = false,
}: ThreadDetailClientProps) {
  const [thread, setThread] = useState<any>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [replyContent, setReplyContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  useEffect(() => {
    loadThread();
  }, [threadId]);

  const loadThread = async () => {
    setIsLoading(true);
    try {
      const [threadRes, postsRes] = await Promise.all([
        fetch(`/api/discussions/threads/${threadId}`),
        fetch(`/api/discussions/posts?threadId=${threadId}`),
      ]);

      if (threadRes.ok) {
        const threadData = await threadRes.json();
        setThread(threadData);
      }

      if (postsRes.ok) {
        const postsData = await postsRes.json();
        setPosts(postsData.posts);
      }
    } catch (error) {
      console.error('Failed to load thread:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyContent.trim() || isSubmitting) return;

    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch('/api/discussions/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          threadId,
          content: replyContent,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to post reply');
      }

      const data = await response.json();
      setReplyContent('');
      setSuccess(`Reply posted! You earned +${data.reward.xpEarned} XP and +${data.reward.pointsEarned} Points`);
      await loadThread();
    } catch (err: any) {
      console.error('Failed to post reply:', err);
      setError(err.message || 'Failed to post reply');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="text-center py-12" style={{ color: 'rgba(180, 220, 180, 0.7)' }}>
        Loading thread...
      </div>
    );
  }

  if (!thread) {
    return (
      <div className="text-center py-12" style={{ color: 'rgba(250, 100, 100, 0.9)' }}>
        Thread not found
      </div>
    );
  }

  const isAuthor = userId === thread.userId;
  const isDevPost = gameDeveloperId === thread.author.id;

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
        {success && (
          <Toast
            message={success}
            type="success"
            onClose={() => setSuccess(null)}
          />
        )}
      </AnimatePresence>

      <div className="space-y-6">
      {/* Thread Header */}
      <div
        className="p-6 rounded-lg"
        style={{
          background: 'rgba(40, 50, 40, 0.8)',
          border: '1px solid rgba(100, 150, 100, 0.3)',
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.3)',
        }}
      >
        {/* Category & Badges */}
        <div className="flex items-center gap-2 mb-4">
          <div
            className="px-3 py-1 rounded text-xs font-bold uppercase"
            style={{
              background: 'rgba(180, 240, 180, 0.2)',
              color: 'rgba(180, 240, 180, 0.9)',
              border: '1px solid rgba(180, 240, 180, 0.4)',
            }}
          >
            {thread.category.replace('_', ' ')}
          </div>

          {thread.isPinned && (
            <div
              className="flex items-center gap-1 px-2 py-1 rounded text-xs font-bold"
              style={{
                background: 'rgba(240, 220, 140, 0.2)',
                color: 'rgba(240, 220, 140, 0.9)',
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

          {isDevPost && (
            <div
              className="flex items-center gap-1 px-2 py-1 rounded text-xs font-bold"
              style={{
                background: 'rgba(240, 220, 140, 0.2)',
                color: 'rgba(240, 220, 140, 0.9)',
              }}
            >
              <Code2 size={12} />
              <span>DEV</span>
            </div>
          )}
        </div>

        {/* Title */}
        <h1
          className="text-3xl font-bold mb-4 pixelized"
          style={{
            color: 'rgba(200, 240, 200, 0.95)',
            textShadow: '0 0 8px rgba(120, 200, 120, 0.6)',
          }}
        >
          {thread.title}
        </h1>

        {/* Author & Stats */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Avatar 
              image={thread.author.image} 
              role={thread.author.role} 
              size={24}
            />
            <button
              onClick={(e) => {
                e.preventDefault();
                setSelectedUserId(thread.author.id);
              }}
              className="font-semibold hover:underline cursor-pointer"
              style={{ color: 'rgba(180, 220, 180, 0.9)' }}
            >
              {thread.author.displayName || thread.author.name}
            </button>
            <div
              className="flex items-center gap-1 text-sm"
              style={{ color: 'rgba(150, 180, 150, 0.7)' }}
            >
              <TrendingUp size={12} />
              <span>Lv. {thread.author.level}</span>
            </div>
            <span
              className="text-sm"
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
              <Eye size={16} />
              <span>{thread.views} views</span>
            </div>
            <div
              className="flex items-center gap-1"
              style={{ color: 'rgba(180, 240, 180, 0.7)' }}
            >
              <MessageSquare size={16} />
              <span>{thread.replyCount} replies</span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div
          className="prose prose-invert max-w-none mb-6"
          style={{ color: 'rgba(200, 240, 200, 0.85)' }}
        >
          {thread.content}
        </div>

        {/* Vote Button */}
        {isLoggedIn && (
          <VoteButton
            threadId={threadId}
            initialUpvotes={thread.upvotes}
            initialDownvotes={thread.downvotes}
            userVote={thread.userVote}
          />
        )}
      </div>

      {/* Replies Section */}
      <div>
        <h2
          className="text-xl font-bold mb-4 pixelized"
          style={{
            color: 'rgba(180, 240, 180, 0.95)',
            textShadow: '0 0 6px rgba(120, 200, 120, 0.5)',
          }}
        >
          Replies ({posts.length})
        </h2>

        {posts.length === 0 ? (
          <div
            className="text-center py-8 rounded-lg"
            style={{
              background: 'rgba(40, 50, 40, 0.6)',
              border: '1px solid rgba(100, 150, 100, 0.3)',
            }}
          >
            <p style={{ color: 'rgba(180, 220, 180, 0.7)' }}>
              No replies yet. Be the first to reply!
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {posts.map((post) => (
              <div
                key={post.id}
                className="p-4 rounded-lg"
                style={{
                  background: post.isDevPost
                    ? 'linear-gradient(135deg, rgba(240, 220, 140, 0.1) 0%, rgba(40, 50, 40, 0.8) 100%)'
                    : 'rgba(40, 50, 40, 0.6)',
                  border: post.isDevPost
                    ? '1px solid rgba(240, 220, 140, 0.3)'
                    : '1px solid rgba(100, 150, 100, 0.3)',
                }}
              >
                <div className="flex gap-4">
                  {/* Vote Column */}
                  {isLoggedIn && (
                    <div className="flex-shrink-0">
                      <VoteButton
                        postId={post.id}
                        initialUpvotes={post.upvotes}
                        initialDownvotes={post.downvotes}
                        userVote={post.userVote}
                      />
                    </div>
                  )}

                  {/* Content Column */}
                  <div className="flex-grow">
                    {/* Author */}
                    <div className="flex items-center gap-2 mb-2">
                      <Avatar 
                        image={post.author.image} 
                        role={post.author.role} 
                        size={20}
                      />
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          setSelectedUserId(post.author.id);
                        }}
                        className="font-semibold hover:underline cursor-pointer"
                        style={{ color: 'rgba(180, 220, 180, 0.9)' }}
                      >
                        {post.author.displayName || post.author.name}
                      </button>
                      <div
                        className="flex items-center gap-1 text-xs"
                        style={{ color: 'rgba(150, 180, 150, 0.7)' }}
                      >
                        <TrendingUp size={10} />
                        <span>Lv. {post.author.level}</span>
                      </div>
                      {post.isDevPost && (
                        <div
                          className="flex items-center gap-1 px-2 py-0.5 rounded text-xs font-bold"
                          style={{
                            background: 'rgba(240, 220, 140, 0.2)',
                            color: 'rgba(240, 220, 140, 0.9)',
                          }}
                        >
                          <Code2 size={10} />
                          <span>DEV</span>
                        </div>
                      )}
                      {post.isHelpful && (
                        <div
                          className="flex items-center gap-1 px-2 py-0.5 rounded text-xs font-bold"
                          style={{
                            background: 'rgba(100, 200, 100, 0.2)',
                            color: 'rgba(100, 200, 100, 0.9)',
                          }}
                        >
                          <CheckCircle size={10} />
                          <span>HELPFUL</span>
                        </div>
                      )}
                      <span
                        className="text-xs"
                        style={{ color: 'rgba(150, 180, 150, 0.6)' }}
                      >
                        • {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
                      </span>
                    </div>

                    {/* Content */}
                    <div
                      className="prose prose-invert prose-sm max-w-none"
                      style={{ color: 'rgba(200, 240, 200, 0.85)' }}
                    >
                      {post.content}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Reply Form */}
      {isLoggedIn && !thread.isLocked && (!viewOnly || userRole === 'DEVELOPER') ? (
        <form onSubmit={handleReply} className="space-y-4">
          <div
            className="p-6 rounded-lg"
            style={{
              background: 'rgba(40, 50, 40, 0.8)',
              border: '1px solid rgba(100, 150, 100, 0.3)',
            }}
          >
            <h3
              className="text-lg font-bold mb-4 pixelized"
              style={{ color: 'rgba(180, 240, 180, 0.95)' }}
            >
              Post a Reply
            </h3>
            <textarea
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              placeholder="Share your thoughts..."
              rows={4}
              required
              className="w-full px-4 py-3 rounded-lg resize-none"
              style={{
                background: 'rgba(20, 30, 20, 0.8)',
                border: '1px solid rgba(100, 150, 100, 0.3)',
                color: 'rgba(200, 240, 200, 0.95)',
              }}
            />
            <div className="flex items-center justify-between mt-4">
              <p
                className="text-xs"
                style={{ color: 'rgba(150, 180, 150, 0.6)' }}
              >
                Min. 10 characters • Earn +3 XP and +5 Points
              </p>
              <motion.button
                type="submit"
                disabled={isSubmitting || replyContent.length < 10}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-6 py-2 rounded-lg font-bold uppercase tracking-wider flex items-center gap-2"
                style={{
                  background:
                    isSubmitting || replyContent.length < 10
                      ? 'rgba(100, 150, 100, 0.3)'
                      : 'linear-gradient(135deg, rgba(180, 240, 180, 0.4) 0%, rgba(120, 200, 120, 0.3) 100%)',
                  border: '1px solid rgba(180, 240, 180, 0.4)',
                  color:
                    isSubmitting || replyContent.length < 10
                      ? 'rgba(180, 220, 180, 0.5)'
                      : 'rgba(200, 240, 200, 0.95)',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
                }}
              >
                <Send size={16} />
                {isSubmitting ? 'Posting...' : 'Post Reply'}
              </motion.button>
            </div>
          </div>
        </form>
      ) : viewOnly && userRole !== 'DEVELOPER' ? (
        <div
          className="text-center py-8 rounded-lg"
          style={{
            background: 'rgba(40, 50, 40, 0.6)',
            border: '1px solid rgba(200, 200, 200, 0.3)',
          }}
        >
          <p style={{ color: 'rgba(200, 200, 200, 0.7)' }}>
            View only mode - Commenting is disabled
          </p>
        </div>
      ) : !isLoggedIn ? (
        <div
          className="text-center py-8 rounded-lg"
          style={{
            background: 'rgba(40, 50, 40, 0.6)',
            border: '1px solid rgba(100, 150, 100, 0.3)',
          }}
        >
          <p style={{ color: 'rgba(180, 220, 180, 0.7)' }}>
            <a href="/login" className="underline">
              Log in
            </a>{' '}
            to reply to this thread
          </p>
        </div>
      ) : (
        <div
          className="text-center py-8 rounded-lg"
          style={{
            background: 'rgba(40, 50, 40, 0.6)',
            border: '1px solid rgba(100, 150, 100, 0.3)',
          }}
        >
          <Lock size={24} style={{ color: 'rgba(255, 150, 150, 0.7)', margin: '0 auto 8px' }} />
          <p style={{ color: 'rgba(255, 150, 150, 0.9)' }}>This thread is locked          </p>
        </div>
      )}
      </div>

      {/* User Profile Modal */}
      <UserProfileModal
        userId={selectedUserId}
        onClose={() => setSelectedUserId(null)}
      />
    </>
  );
}

