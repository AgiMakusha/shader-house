'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import {
  MessageCircle,
  Reply,
  Trash2,
  Edit2,
  X,
  Send,
  Code2,
} from 'lucide-react';
import { Avatar } from '@/components/profile/Avatar';
import { UserProfileModal } from '@/components/profile/UserProfileModal';

interface Comment {
  id: string;
  content: string;
  createdAt: Date;
  author: {
    id: string;
    name: string;
    displayName?: string | null;
    image?: string | null;
    role: string;
    level: number;
    badges: string[];
  };
  replies?: Comment[];
}

interface DevlogCommentsProps {
  comments: Comment[];
  devlogSlug: string;
  developerId: string;
  currentUserId?: string;
  onCommentAdded: (comment: Comment) => void;
  onCommentDeleted: (commentId: string) => void;
}

export function DevlogComments({
  comments,
  devlogSlug,
  developerId,
  currentUserId,
  onCommentAdded,
  onCommentDeleted,
}: DevlogCommentsProps) {
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  const handleSubmitComment = async (parentId?: string) => {
    const content = parentId ? replyContent : newComment;
    if (!content.trim()) return;

    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/devlogs/${devlogSlug}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, parentId }),
      });

      if (!response.ok) throw new Error('Failed to post comment');

      const data = await response.json();
      onCommentAdded(data.comment);

      if (parentId) {
        setReplyContent('');
        setReplyingTo(null);
      } else {
        setNewComment('');
      }
    } catch (error) {
      console.error('Error posting comment:', error);
      alert('Failed to post comment');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!confirm('Are you sure you want to delete this comment?')) return;

    try {
      const response = await fetch(
        `/api/devlogs/${devlogSlug}/comments/${commentId}`,
        { method: 'DELETE' }
      );

      if (!response.ok) throw new Error('Failed to delete comment');

      onCommentDeleted(commentId);
    } catch (error) {
      console.error('Error deleting comment:', error);
      alert('Failed to delete comment');
    }
  };

  const CommentItem = ({
    comment,
    isReply = false,
  }: {
    comment: Comment;
    isReply?: boolean;
  }) => {
    const isAuthor = currentUserId === comment.author.id;
    const isDeveloper = comment.author.id === developerId;
    const canDelete = isAuthor || currentUserId === developerId;

    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        id={`comment-${comment.id}`}
        className={`${isReply ? 'ml-8 mt-3' : ''}`}
      >
        <div
          className="p-4 rounded-lg"
          style={{
            background: isDeveloper
              ? 'linear-gradient(135deg, rgba(240, 220, 140, 0.1) 0%, rgba(40, 50, 40, 0.8) 100%)'
              : 'rgba(40, 50, 40, 0.6)',
            border: isDeveloper
              ? '1px solid rgba(240, 220, 140, 0.3)'
              : '1px solid rgba(100, 150, 100, 0.2)',
          }}
        >
          {/* Author Row */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <Avatar
                image={comment.author.image}
                role={comment.author.role}
                size={32}
              />
              <div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setSelectedUserId(comment.author.id)}
                    className="font-semibold hover:underline"
                    style={{ color: 'rgba(180, 220, 180, 0.95)' }}
                  >
                    {comment.author.displayName || comment.author.name}
                  </button>
                  {isDeveloper && (
                    <span
                      className="flex items-center gap-1 px-2 py-0.5 rounded text-xs font-bold"
                      style={{
                        background: 'rgba(240, 220, 140, 0.2)',
                        color: 'rgba(240, 220, 140, 0.9)',
                        border: '1px solid rgba(240, 220, 140, 0.3)',
                      }}
                    >
                      <Code2 size={10} />
                      DEV
                    </span>
                  )}
                </div>
                <span
                  className="text-xs"
                  style={{ color: 'rgba(150, 180, 150, 0.6)' }}
                >
                  {formatDistanceToNow(new Date(comment.createdAt), {
                    addSuffix: true,
                  })}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              {!isReply && currentUserId && (
                <button
                  onClick={() => setReplyingTo(comment.id)}
                  className="p-1.5 rounded hover:bg-white/10 transition-colors"
                  title="Reply"
                >
                  <Reply size={14} style={{ color: 'rgba(180, 220, 180, 0.7)' }} />
                </button>
              )}
              {canDelete && (
                <button
                  onClick={() => handleDeleteComment(comment.id)}
                  className="p-1.5 rounded hover:bg-red-500/20 transition-colors"
                  title="Delete"
                >
                  <Trash2 size={14} style={{ color: 'rgba(255, 150, 150, 0.7)' }} />
                </button>
              )}
            </div>
          </div>

          {/* Content */}
          <p
            className="text-sm whitespace-pre-wrap"
            style={{ color: 'rgba(200, 240, 200, 0.9)' }}
          >
            {comment.content}
          </p>
        </div>

        {/* Reply Form */}
        <AnimatePresence>
          {replyingTo === comment.id && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="ml-8 mt-3"
            >
              <div className="flex gap-3">
                <textarea
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  placeholder="Write a reply..."
                  rows={2}
                  className="flex-1 px-3 py-2 rounded-lg text-sm resize-none"
                  style={{
                    background: 'rgba(40, 50, 40, 0.8)',
                    border: '1px solid rgba(100, 150, 100, 0.3)',
                    color: 'rgba(200, 240, 200, 0.95)',
                  }}
                />
                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => handleSubmitComment(comment.id)}
                    disabled={isSubmitting || !replyContent.trim()}
                    className="p-2 rounded-lg transition-all"
                    style={{
                      background: 'rgba(120, 200, 120, 0.3)',
                      color: 'rgba(180, 240, 180, 0.9)',
                      border: '1px solid rgba(120, 200, 120, 0.4)',
                    }}
                  >
                    <Send size={16} />
                  </button>
                  <button
                    onClick={() => {
                      setReplyingTo(null);
                      setReplyContent('');
                    }}
                    className="p-2 rounded-lg transition-all hover:bg-white/10"
                  >
                    <X size={16} style={{ color: 'rgba(180, 220, 180, 0.7)' }} />
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Nested Replies */}
        {comment.replies && comment.replies.length > 0 && (
          <div className="mt-3 space-y-3">
            {comment.replies.map((reply) => (
              <CommentItem key={reply.id} comment={reply} isReply />
            ))}
          </div>
        )}
      </motion.div>
    );
  };

  return (
    <div className="mt-8">
      {/* Header */}
      <h3
        className="flex items-center gap-2 text-xl font-bold mb-6 pixelized"
        style={{
          color: 'rgba(180, 240, 180, 0.95)',
          textShadow: '0 0 8px rgba(120, 200, 120, 0.4)',
        }}
      >
        <MessageCircle size={24} />
        Comments ({comments.length})
      </h3>

      {/* New Comment Form */}
      {currentUserId ? (
        <div className="mb-8">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Share your thoughts..."
            rows={3}
            className="w-full px-4 py-3 rounded-lg resize-none"
            style={{
              background: 'rgba(40, 50, 40, 0.8)',
              border: '1px solid rgba(100, 150, 100, 0.3)',
              color: 'rgba(200, 240, 200, 0.95)',
            }}
          />
          <div className="flex justify-end mt-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleSubmitComment()}
              disabled={isSubmitting || !newComment.trim()}
              className="flex items-center gap-2 px-6 py-2 rounded-lg font-bold transition-all"
              style={{
                background: isSubmitting || !newComment.trim()
                  ? 'rgba(100, 150, 100, 0.2)'
                  : 'linear-gradient(135deg, rgba(120, 200, 120, 0.5) 0%, rgba(80, 160, 80, 0.4) 100%)',
                color: isSubmitting || !newComment.trim()
                  ? 'rgba(180, 220, 180, 0.5)'
                  : 'rgba(220, 255, 220, 0.95)',
                border: '1px solid rgba(150, 220, 150, 0.4)',
              }}
            >
              <Send size={16} />
              {isSubmitting ? 'Posting...' : 'Post Comment'}
            </motion.button>
          </div>
        </div>
      ) : (
        <div
          className="mb-8 p-4 rounded-lg text-center"
          style={{
            background: 'rgba(40, 50, 40, 0.6)',
            border: '1px solid rgba(100, 150, 100, 0.2)',
            color: 'rgba(180, 220, 180, 0.7)',
          }}
        >
          <a
            href="/login"
            className="font-semibold hover:underline"
            style={{ color: 'rgba(180, 240, 180, 0.9)' }}
          >
            Log in
          </a>{' '}
          to join the conversation
        </div>
      )}

      {/* Comments List */}
      {comments.length === 0 ? (
        <div
          className="text-center py-12"
          style={{ color: 'rgba(180, 220, 180, 0.5)' }}
        >
          <MessageCircle size={48} className="mx-auto mb-4 opacity-50" />
          <p>No comments yet. Be the first to share your thoughts!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {comments.map((comment) => (
            <CommentItem key={comment.id} comment={comment} />
          ))}
        </div>
      )}

      <UserProfileModal
        userId={selectedUserId}
        onClose={() => setSelectedUserId(null)}
      />
    </div>
  );
}

