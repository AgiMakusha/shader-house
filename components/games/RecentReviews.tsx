'use client';

import { useState } from 'react';
import Image from 'next/image';
import { UserProfileModal } from '@/components/profile/UserProfileModal';

interface Review {
  id: string;
  stars: number;
  comment: string | null;
  createdAt: Date;
  user: {
    id: string;
    name: string;
    displayName?: string | null;
    image?: string | null;
  };
}

interface RecentReviewsProps {
  reviews: Review[];
}

export function RecentReviews({ reviews }: RecentReviewsProps) {
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  if (reviews.length === 0) {
    return null;
  }

  return (
    <>
      <div className="space-y-4 pt-6 border-t" style={{ borderColor: "rgba(200, 240, 200, 0.2)" }}>
        <h3
          className="text-lg font-bold pixelized"
          style={{ color: "rgba(180, 220, 180, 0.9)" }}
        >
          Recent Reviews
        </h3>
        {reviews.map((rating) => (
          <div
            key={rating.id}
            className="p-4 rounded-lg"
            style={{
              background: "rgba(100, 200, 100, 0.05)",
              border: "1px solid rgba(200, 240, 200, 0.15)",
            }}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                {rating.user.image && (
                  <Image
                    src={rating.user.image}
                    alt={rating.user.displayName || rating.user.name || 'User'}
                    width={32}
                    height={32}
                    className="rounded-full"
                  />
                )}
                <button
                  onClick={() => setSelectedUserId(rating.user.id)}
                  className="font-semibold hover:underline cursor-pointer"
                  style={{ color: "rgba(200, 240, 200, 0.9)" }}
                >
                  {rating.user.displayName || rating.user.name}
                </button>
              </div>
              <div className="flex items-center">
                {[1, 2, 3, 4, 5].map((star) => (
                  <svg
                    key={star}
                    className="w-4 h-4"
                    fill={star <= rating.stars ? "currentColor" : "none"}
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    style={{
                      color: star <= rating.stars
                        ? "rgba(250, 200, 100, 0.9)"
                        : "rgba(200, 240, 200, 0.3)",
                    }}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                    />
                  </svg>
                ))}
              </div>
            </div>
            {rating.comment && (
              <p
                className="text-sm"
                style={{ color: "rgba(200, 240, 200, 0.75)" }}
              >
                {rating.comment}
              </p>
            )}
            <p
              className="text-xs mt-2"
              style={{ color: "rgba(200, 240, 200, 0.5)" }}
            >
              {new Date(rating.createdAt).toLocaleDateString()}
            </p>
          </div>
        ))}
      </div>

      <UserProfileModal
        userId={selectedUserId}
        onClose={() => setSelectedUserId(null)}
      />
    </>
  );
}

