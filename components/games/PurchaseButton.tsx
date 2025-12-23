"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useAudio } from "@/components/audio/AudioProvider";
import { SubscriptionTier, FeatureFlag, hasFeatureAccess } from "@/lib/subscriptions/types";
import { Crown } from "lucide-react";

interface PurchaseButtonProps {
  gameId: string;
  priceCents: number;
  gameFileUrl?: string | null;
  externalUrl?: string | null;
  isPurchased: boolean;
  userTier?: SubscriptionTier | null;
}

export function PurchaseButton({ gameId, priceCents, gameFileUrl, externalUrl, isPurchased, userTier }: PurchaseButtonProps) {
  const router = useRouter();
  const { play } = useAudio();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');

  const price = priceCents === 0 ? 'Free' : `$${(priceCents / 100).toFixed(2)}`;
  const isFree = priceCents === 0;
  const hasUnlimitedAccess = hasFeatureAccess(userTier, FeatureFlag.UNLIMITED_LIBRARY);
  const canPlayFree = hasUnlimitedAccess && !isFree; // Premium users can play paid games for free
  const hasGameAccess = gameFileUrl || externalUrl; // Game is available if either file or link exists

  const trackGameAccess = async () => {
    // Track game access for achievements
    try {
      await fetch(`/api/games/${gameId}/access`, {
        method: 'POST',
      });
    } catch (error) {
      console.error('Failed to track game access:', error);
      // Don't block the user if tracking fails
    }
  };

  const handlePurchase = async () => {
    if (isProcessing) return;

    setIsProcessing(true);
    setError('');
    play("activate");

    try {
      // Use the new checkout API that supports Stripe
      const response = await fetch(`/api/games/${gameId}/checkout`, {
        method: 'POST',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Purchase failed');
      }

      // If Stripe returns a checkout URL, redirect to it
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
        return;
      }

      // Demo mode or free game - purchase completed immediately
      play("success");
      
      // Track game access for achievements
      await trackGameAccess();
      
      router.refresh();
      
      // If there's a game file, download it; otherwise open external URL
      if (gameFileUrl) {
        window.location.href = gameFileUrl;
      } else if (externalUrl) {
        window.open(externalUrl, '_blank');
      }
    } catch (error: any) {
      console.error('Purchase error:', error);
      setError(error.message || 'Failed to complete purchase');
      play("error");
    } finally {
      setIsProcessing(false);
    }
  };

  // If user has unlimited access via Creator Support Pass
  if (canPlayFree && hasGameAccess) {
    const handleProAccess = async (e: React.MouseEvent<HTMLAnchorElement>) => {
      e.preventDefault(); // Prevent immediate navigation
      play("activate");
      await trackGameAccess(); // Track for achievements first
      
      // Then navigate/download after tracking completes
      if (gameFileUrl) {
        window.location.href = gameFileUrl; // Trigger download
      } else if (externalUrl) {
        window.open(externalUrl, '_blank'); // Open in new tab
      }
    };

    return (
      <div className="flex flex-col gap-3">
        <div
          className="w-full px-5 py-3 rounded-lg text-center font-semibold uppercase tracking-wider text-sm flex items-center justify-center gap-2"
          style={{
            background: "linear-gradient(145deg, rgba(60, 50, 30, 0.25) 0%, rgba(50, 40, 20, 0.35) 100%)",
            border: "1px solid rgba(240, 220, 140, 0.35)",
            color: "rgba(240, 220, 140, 0.95)",
          }}
        >
          <Crown size={14} />
          Included with Pass
        </div>
        {gameFileUrl ? (
          <a
            href={gameFileUrl}
            download
            onClick={handleProAccess}
            className="block w-full px-5 py-3 rounded-lg text-center font-semibold uppercase tracking-wider text-sm transition-all hover:scale-[1.02] active:scale-[0.98]"
            style={{
              background: "linear-gradient(135deg, rgba(240, 220, 140, 0.25) 0%, rgba(220, 180, 100, 0.35) 100%)",
              border: "1px solid rgba(240, 220, 140, 0.45)",
              color: "rgba(240, 220, 140, 0.95)",
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.25)",
            }}
          >
            Download Free →
          </a>
        ) : (
          <a
            href={externalUrl!}
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleProAccess}
            className="block w-full px-5 py-3 rounded-lg text-center font-semibold uppercase tracking-wider text-sm transition-all hover:scale-[1.02] active:scale-[0.98]"
            style={{
              background: "linear-gradient(135deg, rgba(240, 220, 140, 0.25) 0%, rgba(220, 180, 100, 0.35) 100%)",
              border: "1px solid rgba(240, 220, 140, 0.45)",
              color: "rgba(240, 220, 140, 0.95)",
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.25)",
            }}
          >
            Play Free →
          </a>
        )}
        <p
          className="text-xs text-center"
          style={{ 
            color: "rgba(230, 210, 150, 0.6)",
          }}
        >
          Full access with your Creator Support Pass
        </p>
      </div>
    );
  }

  if (isPurchased) {
    const handlePlayAccess = async (e: React.MouseEvent<HTMLAnchorElement>) => {
      e.preventDefault(); // Prevent immediate navigation
      play("activate");
      await trackGameAccess(); // Track for achievements first
      
      // Then navigate/download after tracking completes
      if (gameFileUrl) {
        window.location.href = gameFileUrl; // Trigger download
      } else if (externalUrl) {
        window.open(externalUrl, '_blank'); // Open in new tab
      }
    };

    return (
      <div className="flex flex-col gap-3">
        <div
          className="w-full px-5 py-3 rounded-lg text-center font-semibold uppercase tracking-wider text-sm flex items-center justify-center gap-2"
          style={{
            background: "rgba(100, 200, 100, 0.15)",
            border: "1px solid rgba(200, 240, 200, 0.35)",
            color: "rgba(150, 250, 150, 0.95)",
          }}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
          </svg>
          In Your Library
        </div>
        {gameFileUrl && (
          <a
            href={gameFileUrl}
            download
            onClick={handlePlayAccess}
            className="block w-full px-5 py-3 rounded-lg text-center font-semibold uppercase tracking-wider text-sm transition-all hover:scale-[1.02] active:scale-[0.98]"
            style={{
              background: "linear-gradient(135deg, rgba(100, 200, 100, 0.35) 0%, rgba(80, 180, 80, 0.25) 100%)",
              border: "1px solid rgba(200, 240, 200, 0.4)",
              color: "rgba(200, 240, 200, 0.95)",
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.25)",
            }}
          >
            Download Now →
          </a>
        )}
        {!gameFileUrl && externalUrl && (
          <a
            href={externalUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={handlePlayAccess}
            className="block w-full px-5 py-3 rounded-lg text-center font-semibold uppercase tracking-wider text-sm transition-all hover:scale-[1.02] active:scale-[0.98]"
            style={{
              background: "linear-gradient(135deg, rgba(100, 200, 100, 0.35) 0%, rgba(80, 180, 80, 0.25) 100%)",
              border: "1px solid rgba(200, 240, 200, 0.4)",
              color: "rgba(200, 240, 200, 0.95)",
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.25)",
            }}
          >
            Play Now →
          </a>
        )}
      </div>
    );
  }

  if (!hasGameAccess) {
    return (
      <button
        disabled
        className="w-full px-5 py-3 rounded-lg font-semibold uppercase tracking-wider text-sm transition-all opacity-60 cursor-not-allowed text-center"
        style={{
          background: "linear-gradient(135deg, rgba(100, 200, 100, 0.15) 0%, rgba(80, 180, 80, 0.1) 100%)",
          border: "1px solid rgba(200, 240, 200, 0.2)",
          color: "rgba(200, 240, 200, 0.6)",
        }}
      >
        Coming Soon
      </button>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <motion.button
        onClick={handlePurchase}
        disabled={isProcessing}
        className="w-full px-5 py-3 rounded-lg font-semibold uppercase tracking-wider text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed text-center"
        style={{
          background: "linear-gradient(135deg, rgba(100, 200, 100, 0.35) 0%, rgba(80, 180, 80, 0.25) 100%)",
          border: "1px solid rgba(200, 240, 200, 0.4)",
          color: "rgba(200, 240, 200, 0.95)",
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.25)",
        }}
        whileHover={!isProcessing ? { scale: 1.02 } : {}}
        whileTap={!isProcessing ? { scale: 0.98 } : {}}
      >
        {isProcessing 
          ? 'Processing...' 
          : isFree 
            ? 'Add to Library' 
            : `Purchase for ${price}`
        }
      </motion.button>

      {error && (
        <p
          className="text-xs font-semibold text-center"
          style={{ color: "rgba(250, 100, 100, 0.9)" }}
        >
          {error}
        </p>
      )}

      {!isFree && (
        <p
          className="text-xs text-center"
          style={{ 
            color: "rgba(200, 240, 200, 0.45)",
          }}
        >
          Developer receives 85% of sale
        </p>
      )}
    </div>
  );
}



