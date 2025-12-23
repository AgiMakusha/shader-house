'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronUp, ChevronDown } from 'lucide-react';
import { Toast } from './Toast';

interface VoteButtonProps {
  threadId?: string;
  postId?: string;
  initialUpvotes: number;
  initialDownvotes: number;
  userVote: number; // -1, 0, or 1
  onVoteChange?: (newVote: number) => void;
}

export function VoteButton({
  threadId,
  postId,
  initialUpvotes,
  initialDownvotes,
  userVote: initialUserVote,
  onVoteChange,
}: VoteButtonProps) {
  const [upvotes, setUpvotes] = useState(initialUpvotes);
  const [downvotes, setDownvotes] = useState(initialDownvotes);
  const [userVote, setUserVote] = useState(initialUserVote);
  const [isVoting, setIsVoting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleVote = async (value: number) => {
    if (isVoting) return;

    setIsVoting(true);
    setError(null);

    try {
      const newVote = userVote === value ? 0 : value;

      const response = await fetch('/api/discussions/vote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          threadId,
          postId,
          value: newVote,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to vote');
      }

      const data = await response.json();

      setUpvotes(data.upvotes);
      setDownvotes(data.downvotes);
      setUserVote(newVote);

      if (onVoteChange) {
        onVoteChange(newVote);
      }
    } catch (err: any) {
      // Error is shown via Toast notification to user
      setError(err.message || 'Failed to vote');
    } finally {
      setIsVoting(false);
    }
  };

  const total = upvotes - downvotes;

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

      <div className="flex flex-col items-center gap-1">
      {/* Upvote */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => handleVote(1)}
        disabled={isVoting}
        className="p-1 rounded transition-all"
        style={{
          background:
            userVote === 1
              ? 'rgba(100, 200, 100, 0.3)'
              : 'rgba(40, 50, 40, 0.5)',
          color:
            userVote === 1
              ? 'rgba(100, 200, 100, 0.95)'
              : 'rgba(180, 240, 180, 0.7)',
          border:
            userVote === 1
              ? '1px solid rgba(100, 200, 100, 0.5)'
              : '1px solid rgba(100, 150, 100, 0.3)',
        }}
      >
        <ChevronUp size={20} />
      </motion.button>

      {/* Vote Count */}
      <span
        className="text-sm font-bold"
        style={{
          color:
            total > 0
              ? 'rgba(100, 200, 100, 0.95)'
              : total < 0
              ? 'rgba(255, 100, 100, 0.95)'
              : 'rgba(180, 220, 180, 0.7)',
        }}
      >
        {total}
      </span>

      {/* Downvote */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => handleVote(-1)}
        disabled={isVoting}
        className="p-1 rounded transition-all"
        style={{
          background:
            userVote === -1
              ? 'rgba(255, 100, 100, 0.3)'
              : 'rgba(40, 50, 40, 0.5)',
          color:
            userVote === -1
              ? 'rgba(255, 150, 150, 0.95)'
              : 'rgba(180, 240, 180, 0.7)',
          border:
            userVote === -1
              ? '1px solid rgba(255, 100, 100, 0.5)'
              : '1px solid rgba(100, 150, 100, 0.3)',
        }}
      >
        <ChevronDown size={20} />
      </motion.button>
      </div>
    </>
  );
}
