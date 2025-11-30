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
        <div className="flex items-center justify-center gap-1 mb-2">
          {[1, 2, 3, 4, 5].map((star) => {
            const fillPercentage = Math.min(Math.max(avgRating - (star - 1), 0), 1) * 100;
            const isActive = fillPercentage > 0;
            return (
              <div 
                key={star} 
                className="relative w-6 h-6"
                style={{
                  filter: isActive 
                    ? "drop-shadow(0 0 6px rgba(250, 220, 100, 0.6)) drop-shadow(0 0 3px rgba(250, 220, 100, 0.4))"
                    : "none"
                }}
              >
                {/* Empty star (transparent) */}
                <svg
                  className="absolute inset-0 w-6 h-6"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="rgba(200, 240, 200, 0.3)"
                  strokeWidth="1.5"
                >
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
                {/* Filled star (gradient based on rating) */}
                <svg
                  className="absolute inset-0 w-6 h-6"
                  viewBox="0 0 24 24"
                  style={{
                    clipPath: `inset(0 ${100 - fillPercentage}% 0 0)`,
                  }}
                >
                  <path
                    d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
                    fill="rgba(250, 220, 100, 0.95)"
                    stroke="rgba(250, 220, 100, 0.95)"
                    strokeWidth="1.5"
                  />
                </svg>
              </div>
            );
          })}
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



