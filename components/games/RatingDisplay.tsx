"use client";

interface RatingDisplayProps {
  avgRating: number;
  totalRatings: number;
  distribution: Array<{
    stars: number;
    count: number;
  }>;
}

export function RatingDisplay({ avgRating, totalRatings, distribution }: RatingDisplayProps) {
  if (totalRatings === 0) {
    return (
      <div className="text-center py-8">
        <p
          className="text-lg font-semibold"
          style={{ color: "rgba(200, 240, 200, 0.7)" }}
        >
          No ratings yet
        </p>
        <p
          className="text-sm mt-2"
          style={{ color: "rgba(200, 240, 200, 0.5)" }}
        >
          Be the first to rate this game!
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Average Rating */}
      <div className="text-center">
        <p
          className="text-5xl font-bold pixelized mb-2"
          style={{
            textShadow: "0 0 12px rgba(250, 200, 100, 0.6), 2px 2px 0px rgba(0, 0, 0, 0.9)",
            color: "rgba(250, 200, 100, 0.95)",
          }}
        >
          {avgRating.toFixed(1)}
        </p>
        <div className="flex items-center justify-center mb-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <svg
              key={star}
              className="w-6 h-6"
              fill={star <= Math.round(avgRating) ? "currentColor" : "none"}
              stroke="currentColor"
              viewBox="0 0 24 24"
              style={{
                color: star <= Math.round(avgRating)
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
        <p
          className="text-sm"
          style={{ color: "rgba(200, 240, 200, 0.7)" }}
        >
          {totalRatings} {totalRatings === 1 ? 'rating' : 'ratings'}
        </p>
      </div>

      {/* Rating Distribution */}
      <div className="space-y-2">
        {[5, 4, 3, 2, 1].map((stars) => {
          const item = distribution.find((d) => d.stars === stars);
          const count = item?.count || 0;
          const percentage = totalRatings > 0 ? (count / totalRatings) * 100 : 0;

          return (
            <div key={stars} className="flex items-center gap-3">
              <span
                className="text-sm font-semibold w-8"
                style={{ color: "rgba(200, 240, 200, 0.8)" }}
              >
                {stars}★
              </span>
              <div
                className="flex-1 h-2 rounded-full overflow-hidden"
                style={{ background: "rgba(100, 200, 100, 0.1)" }}
              >
                <div
                  className="h-full rounded-full transition-all duration-300"
                  style={{
                    width: `${percentage}%`,
                    background: "linear-gradient(90deg, rgba(250, 200, 100, 0.8) 0%, rgba(250, 200, 100, 0.6) 100%)",
                  }}
                />
              </div>
              <span
                className="text-sm font-semibold w-12 text-right"
                style={{ color: "rgba(200, 240, 200, 0.6)" }}
              >
                {count}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}



