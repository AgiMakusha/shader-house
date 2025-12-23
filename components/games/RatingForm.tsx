"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useAudio } from "@/components/audio/AudioProvider";

interface RatingFormProps {
  gameId: string;
  userRating: {
    stars: number;
    comment: string | null;
  } | null;
}

export function RatingForm({ gameId, userRating }: RatingFormProps) {
  const router = useRouter();
  const { play } = useAudio();
  const [stars, setStars] = useState(userRating?.stars || 0);
  const [comment, setComment] = useState(userRating?.comment || '');
  const [hoveredStar, setHoveredStar] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (stars === 0) {
      setError('Please select a rating');
      play("error");
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const response = await fetch(`/api/games/${gameId}/rate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          stars,
          comment: comment.trim() || undefined,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit rating');
      }

      play("success");
      router.refresh();
    } catch (error) {
      console.error('Error submitting rating:', error);
      setError('Failed to submit rating. Please try again.');
      play("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 pt-6 border-t" style={{ borderColor: "rgba(200, 240, 200, 0.2)" }}>
      <h3
        className="text-lg font-bold pixelized"
        style={{ 
          color: "rgba(180, 220, 180, 0.95)",
          textShadow: "0 0 8px rgba(120, 200, 120, 0.5), 1px 1px 0px rgba(0, 0, 0, 0.8)"
        }}
      >
        {userRating ? 'Update Your Rating' : 'Rate This Game'}
      </h3>

      {/* Star Rating */}
      <div>
        <label
          className="block text-sm font-medium mb-2 pixelized"
          style={{ 
            color: "rgba(200, 240, 200, 0.7)",
            textShadow: "1px 1px 0px rgba(0, 0, 0, 0.8)"
          }}
        >
          Your Rating
        </label>
        <div className="flex items-center gap-2">
          {[1, 2, 3, 4, 5].map((star) => {
            const isActive = star <= (hoveredStar || stars);
            return (
              <button
                key={star}
                type="button"
                onClick={() => {
                  setStars(star);
                  play("success");
                }}
                onMouseEnter={() => setHoveredStar(star)}
                onMouseLeave={() => setHoveredStar(0)}
                className="transition-all hover:scale-110"
                style={{
                  filter: isActive 
                    ? "drop-shadow(0 0 8px rgba(250, 200, 100, 0.6)) drop-shadow(0 0 4px rgba(250, 200, 100, 0.4))"
                    : "none"
                }}
              >
                <svg
                  className="w-10 h-10"
                  fill={isActive ? "currentColor" : "none"}
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  style={{
                    color: isActive
                      ? "rgba(250, 220, 100, 0.95)"
                      : "rgba(200, 240, 200, 0.3)",
                    strokeWidth: isActive ? "1" : "1.5",
                  }}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                  />
                </svg>
              </button>
            );
          })}
          {stars > 0 && (
            <span
              className="ml-2 text-sm font-semibold pixelized"
              style={{ 
                color: "rgba(250, 220, 100, 0.95)",
                textShadow: "0 0 6px rgba(250, 220, 100, 0.5), 1px 1px 0px rgba(0, 0, 0, 0.8)"
              }}
            >
              {stars} / 5
            </span>
          )}
        </div>
      </div>

      {/* Comment */}
      <div>
        <label
          className="block text-sm font-medium mb-2"
          style={{ color: "rgba(200, 240, 200, 0.7)" }}
        >
          Review (Optional)
        </label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={4}
          maxLength={1000}
          placeholder="Share your thoughts about this game..."
          className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 focus:outline-none focus:ring-2 focus:ring-white/40 transition-all backdrop-blur-sm resize-none"
          style={{ color: "rgba(200, 240, 200, 0.85)" }}
        />
        <p
          className="text-xs mt-1 text-right"
          style={{ color: "rgba(200, 240, 200, 0.5)" }}
        >
          {comment.length} / 1000
        </p>
      </div>

      {error && (
        <p
          className="text-sm font-semibold"
          style={{ color: "rgba(250, 100, 100, 0.9)" }}
        >
          {error}
        </p>
      )}

      <motion.button
        type="submit"
        disabled={isSubmitting || stars === 0}
        className="w-full px-6 py-3 rounded-lg font-semibold uppercase tracking-wider transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        style={{
          background: "linear-gradient(135deg, rgba(100, 200, 100, 0.35) 0%, rgba(80, 180, 80, 0.2) 100%)",
          border: "1px solid rgba(200, 240, 200, 0.3)",
          color: "rgba(200, 240, 200, 0.95)",
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.3)",
        }}
        whileHover={!isSubmitting && stars > 0 ? { scale: 1.02 } : {}}
        whileTap={!isSubmitting && stars > 0 ? { scale: 0.98 } : {}}
      >
        {isSubmitting ? 'Submitting...' : userRating ? 'Update Rating' : 'Submit Rating'}
      </motion.button>
    </form>
  );
}



