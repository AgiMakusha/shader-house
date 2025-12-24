'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, Loader2, Check, X, CreditCard } from 'lucide-react';

interface GamePurchaseButtonProps {
  gameId: string;
  gameTitle: string;
  priceCents: number;
  isOwned?: boolean;
  onPurchaseComplete?: () => void;
}

export function GamePurchaseButton({
  gameId,
  gameTitle,
  priceCents,
  isOwned = false,
  onPurchaseComplete,
}: GamePurchaseButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState('');
  const [breakdown, setBreakdown] = useState<any>(null);

  const isFree = priceCents === 0;
  const priceDisplay = isFree ? 'Free' : `$${(priceCents / 100).toFixed(2)}`;

  const handlePurchase = async () => {
    setShowConfirm(false);
    setIsLoading(true);
    setError('');

    try {
      const res = await fetch(`/api/games/${gameId}/checkout`, {
        method: 'POST',
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Purchase failed');
        setIsLoading(false);
        return;
      }

      // Free game or demo mode - show success
      if (data.free || data.demo) {
        setBreakdown(data.breakdown);
        setShowSuccess(true);
        onPurchaseComplete?.();
        setTimeout(() => {
          setShowSuccess(false);
          window.location.reload();
        }, 2000);
      } else if (data.checkoutUrl) {
        // Production mode - redirect to Stripe
        window.location.href = data.checkoutUrl;
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isOwned) {
    return (
      <button
        disabled
        className="w-full py-3 px-6 rounded-lg font-bold uppercase tracking-wider pixelized text-sm flex items-center justify-center gap-2"
        style={{
          background: 'rgba(100, 200, 100, 0.2)',
          border: '1px solid rgba(140, 220, 140, 0.4)',
          color: 'rgba(200, 255, 200, 0.95)',
        }}
      >
        <Check size={18} />
        In Your Library
      </button>
    );
  }

  return (
    <>
      <button
        onClick={() => isFree ? handlePurchase() : setShowConfirm(true)}
        disabled={isLoading}
        className="w-full py-3 px-6 rounded-lg font-bold uppercase tracking-wider pixelized text-sm flex items-center justify-center gap-2 transition-all hover:scale-[1.02] disabled:opacity-50"
        style={{
          background: isFree 
            ? 'linear-gradient(135deg, rgba(100, 200, 100, 0.35) 0%, rgba(80, 180, 80, 0.25) 100%)'
            : 'linear-gradient(135deg, rgba(100, 150, 200, 0.35) 0%, rgba(80, 130, 180, 0.25) 100%)',
          border: isFree 
            ? '1px solid rgba(140, 220, 140, 0.4)'
            : '1px solid rgba(140, 180, 240, 0.4)',
          color: isFree 
            ? 'rgba(200, 255, 200, 0.95)'
            : 'rgba(200, 220, 255, 0.95)',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
        }}
      >
        {isLoading ? (
          <Loader2 size={18} className="animate-spin" />
        ) : (
          <ShoppingCart size={18} />
        )}
        {isFree ? 'Add to Library' : `Buy ${priceDisplay}`}
      </button>

      {error && (
        <p className="text-sm text-red-400 mt-2 text-center">{error}</p>
      )}

      {/* Confirmation Modal */}
      <AnimatePresence>
        {showConfirm && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(0, 0, 0, 0.85)' }}
            onClick={() => setShowConfirm(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="rounded-xl p-6 max-w-md w-full"
              style={{
                background: 'linear-gradient(145deg, rgba(40, 50, 60, 0.98) 0%, rgba(30, 40, 50, 0.98) 100%)',
                border: '1px solid rgba(100, 150, 200, 0.3)',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 
                  className="text-xl font-bold pixelized"
                  style={{ color: 'rgba(180, 210, 255, 0.95)' }}
                >
                  Confirm Purchase
                </h3>
                <button
                  onClick={() => setShowConfirm(false)}
                  className="p-1 rounded hover:bg-white/10 transition-all"
                >
                  <X size={20} style={{ color: 'rgba(200, 200, 200, 0.7)' }} />
                </button>
              </div>

              <p 
                className="text-sm mb-4"
                style={{ color: 'rgba(180, 200, 230, 0.85)' }}
              >
                You're about to purchase <strong>{gameTitle}</strong>
              </p>

              <div 
                className="rounded-lg p-4 mb-4"
                style={{
                  background: 'rgba(100, 150, 200, 0.1)',
                  border: '1px solid rgba(100, 150, 200, 0.2)',
                }}
              >
                <div className="flex items-center justify-between">
                  <span style={{ color: 'rgba(180, 200, 230, 0.7)' }}>Total</span>
                  <span 
                    className="text-2xl font-bold pixelized"
                    style={{ color: 'rgba(180, 210, 255, 0.95)' }}
                  >
                    {priceDisplay}
                  </span>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowConfirm(false)}
                  className="flex-1 py-2 px-4 rounded-lg font-semibold text-sm transition-all hover:bg-white/10"
                  style={{
                    background: 'rgba(100, 100, 100, 0.2)',
                    border: '1px solid rgba(150, 150, 150, 0.3)',
                    color: 'rgba(200, 200, 200, 0.9)',
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handlePurchase}
                  disabled={isLoading}
                  className="flex-1 py-2 px-4 rounded-lg font-semibold text-sm flex items-center justify-center gap-2 transition-all hover:scale-[1.02] disabled:opacity-50"
                  style={{
                    background: 'linear-gradient(135deg, rgba(100, 150, 200, 0.4) 0%, rgba(80, 130, 180, 0.3) 100%)',
                    border: '1px solid rgba(140, 180, 240, 0.5)',
                    color: 'rgba(200, 220, 255, 0.95)',
                  }}
                >
                  {isLoading ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <CreditCard size={16} />
                  )}
                  Pay Now
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Success Modal */}
      <AnimatePresence>
        {showSuccess && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(0, 0, 0, 0.85)' }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="rounded-xl p-8 max-w-md w-full text-center"
              style={{
                background: 'linear-gradient(145deg, rgba(40, 80, 60, 0.98) 0%, rgba(30, 60, 45, 0.98) 100%)',
                border: '1px solid rgba(100, 200, 100, 0.3)',
                boxShadow: '0 8px 32px rgba(50, 150, 50, 0.3)',
              }}
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center"
                style={{ background: 'rgba(100, 200, 100, 0.3)' }}
              >
                <Check size={32} className="text-green-400" />
              </motion.div>
              
              <h3 
                className="text-2xl font-bold mb-2 pixelized"
                style={{ color: 'rgba(150, 255, 150, 0.95)' }}
              >
                Purchase Complete!
              </h3>
              <p 
                className="text-sm"
                style={{ color: 'rgba(200, 240, 200, 0.85)' }}
              >
                {gameTitle} has been added to your library
              </p>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}



