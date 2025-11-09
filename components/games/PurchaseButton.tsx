"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useAudio } from "@/components/audio/AudioProvider";

interface PurchaseButtonProps {
  gameId: string;
  priceCents: number;
  externalUrl?: string | null;
  isPurchased: boolean;
}

export function PurchaseButton({ gameId, priceCents, externalUrl, isPurchased }: PurchaseButtonProps) {
  const router = useRouter();
  const { play } = useAudio();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');

  const price = priceCents === 0 ? 'Free' : `€${(priceCents / 100).toFixed(2)}`;
  const isFree = priceCents === 0;

  const handlePurchase = async () => {
    if (isProcessing) return;

    setIsProcessing(true);
    setError('');
    play("activate");

    try {
      const response = await fetch(`/api/games/${gameId}/purchase`, {
        method: 'POST',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Purchase failed');
      }

      play("success");
      router.refresh();
      
      // If there's an external URL, open it
      if (externalUrl) {
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

  if (isPurchased) {
    return (
      <div className="space-y-3">
        <div
          className="w-full px-6 py-3 rounded-lg text-center font-bold uppercase tracking-wider"
          style={{
            background: "rgba(100, 200, 100, 0.2)",
            border: "1px solid rgba(200, 240, 200, 0.4)",
            color: "rgba(150, 250, 150, 0.9)",
          }}
        >
          ✓ In Your Library
        </div>
        {externalUrl && (
          <a
            href={externalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full px-6 py-3 rounded-lg text-center font-bold uppercase tracking-wider transition-all"
            style={{
              background: "linear-gradient(135deg, rgba(100, 200, 100, 0.4) 0%, rgba(80, 180, 80, 0.3) 100%)",
              border: "1px solid rgba(200, 240, 200, 0.4)",
              color: "rgba(200, 240, 200, 0.95)",
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.3)",
            }}
          >
            Play Now →
          </a>
        )}
      </div>
    );
  }

  if (!externalUrl) {
    return (
      <button
        disabled
        className="w-full px-6 py-3 rounded-lg font-bold uppercase tracking-wider transition-all opacity-50 cursor-not-allowed text-center"
        style={{
          background: "linear-gradient(135deg, rgba(100, 200, 100, 0.2) 0%, rgba(80, 180, 80, 0.1) 100%)",
          border: "1px solid rgba(200, 240, 200, 0.2)",
          color: "rgba(200, 240, 200, 0.6)",
        }}
      >
        Coming Soon
      </button>
    );
  }

  return (
    <div className="space-y-3">
      <motion.button
        onClick={handlePurchase}
        disabled={isProcessing}
        className="w-full px-6 py-3 rounded-lg font-bold uppercase tracking-wider transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        style={{
          background: "linear-gradient(135deg, rgba(100, 200, 100, 0.4) 0%, rgba(80, 180, 80, 0.3) 100%)",
          border: "1px solid rgba(200, 240, 200, 0.4)",
          color: "rgba(200, 240, 200, 0.95)",
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.3)",
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
          className="text-sm font-semibold text-center"
          style={{ color: "rgba(250, 100, 100, 0.9)" }}
        >
          {error}
        </p>
      )}

      {!isFree && (
        <p
          className="text-xs text-center"
          style={{ color: "rgba(200, 240, 200, 0.6)" }}
        >
          Demo mode: Purchase will be simulated
        </p>
      )}
    </div>
  );
}

