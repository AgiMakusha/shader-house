'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Rocket, Loader2, Check, X, CreditCard, AlertCircle } from 'lucide-react';

interface PublishingFeeButtonProps {
  gameId: string;
  gameTitle: string;
  onPublishComplete?: () => void;
}

export function PublishingFeeButton({
  gameId,
  gameTitle,
  onPublishComplete,
}: PublishingFeeButtonProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPaid, setIsPaid] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState('');
  const [feeAmount, setFeeAmount] = useState('$50.00');

  useEffect(() => {
    checkStatus();
  }, [gameId]);

  const checkStatus = async () => {
    try {
      const res = await fetch(`/api/payments/publishing-fee?gameId=${gameId}`);
      if (res.ok) {
        const data = await res.json();
        setIsPaid(data.hasPaid);
        setFeeAmount(data.amount);
      }
    } catch (err) {
      console.error('Error checking fee status:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePublish = async () => {
    setShowConfirm(false);
    setIsProcessing(true);
    setError('');

    try {
      const res = await fetch('/api/payments/publishing-fee', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gameId }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to process publishing fee');
        setIsProcessing(false);
        return;
      }

      // Demo mode - show success
      if (data.demo) {
        setShowSuccess(true);
        setIsPaid(true);
        onPublishComplete?.();
        setTimeout(() => {
          setShowSuccess(false);
        }, 2500);
      } else if (data.checkoutUrl) {
        // Production mode - redirect to Stripe
        window.location.href = data.checkoutUrl;
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <button
        disabled
        className="w-full py-3 px-6 rounded-lg font-bold uppercase tracking-wider pixelized text-sm flex items-center justify-center gap-2"
        style={{
          background: 'rgba(100, 100, 100, 0.2)',
          border: '1px solid rgba(150, 150, 150, 0.3)',
          color: 'rgba(200, 200, 200, 0.5)',
        }}
      >
        <Loader2 size={18} className="animate-spin" />
        Loading...
      </button>
    );
  }

  if (isPaid) {
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
        Published
      </button>
    );
  }

  return (
    <>
      <button
        onClick={() => setShowConfirm(true)}
        disabled={isProcessing}
        className="w-full py-3 px-6 rounded-lg font-bold uppercase tracking-wider pixelized text-sm flex items-center justify-center gap-2 transition-all hover:scale-[1.02] disabled:opacity-50"
        style={{
          background: 'linear-gradient(135deg, rgba(200, 150, 80, 0.35) 0%, rgba(180, 130, 60, 0.25) 100%)',
          border: '1px solid rgba(240, 200, 120, 0.4)',
          color: 'rgba(255, 240, 180, 0.95)',
          boxShadow: '0 4px 12px rgba(150, 100, 30, 0.3)',
        }}
      >
        {isProcessing ? (
          <Loader2 size={18} className="animate-spin" />
        ) : (
          <Rocket size={18} />
        )}
        Publish Game ({feeAmount})
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
                background: 'linear-gradient(145deg, rgba(60, 50, 30, 0.98) 0%, rgba(50, 40, 20, 0.98) 100%)',
                border: '1px solid rgba(220, 180, 80, 0.3)',
                boxShadow: '0 8px 32px rgba(150, 100, 30, 0.4)',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 
                  className="text-xl font-bold pixelized"
                  style={{ color: 'rgba(255, 230, 150, 0.95)' }}
                >
                  Publish Your Game
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
                style={{ color: 'rgba(230, 210, 150, 0.85)' }}
              >
                You're about to publish <strong>{gameTitle}</strong> on Shader House.
              </p>

              <div 
                className="rounded-lg p-4 mb-4"
                style={{
                  background: 'rgba(220, 180, 80, 0.1)',
                  border: '1px solid rgba(220, 180, 80, 0.2)',
                }}
              >
                <div className="flex items-center justify-between mb-2">
                  <span style={{ color: 'rgba(230, 210, 150, 0.7)' }}>Publishing Fee</span>
                  <span 
                    className="text-2xl font-bold pixelized"
                    style={{ color: 'rgba(255, 230, 150, 0.95)' }}
                  >
                    {feeAmount}
                  </span>
                </div>
                <p 
                  className="text-xs"
                  style={{ color: 'rgba(230, 210, 150, 0.6)' }}
                >
                  One-time fee • Includes listing, hosting & discovery
                </p>
              </div>

              <div 
                className="flex items-start gap-2 p-3 rounded-lg mb-4"
                style={{
                  background: 'rgba(100, 150, 200, 0.1)',
                  border: '1px solid rgba(100, 150, 200, 0.2)',
                }}
              >
                <AlertCircle size={16} className="text-blue-400 flex-shrink-0 mt-0.5" />
                <p 
                  className="text-xs"
                  style={{ color: 'rgba(180, 200, 230, 0.8)' }}
                >
                  After publishing, your game will be live on the marketplace. You'll earn <strong>85%</strong> from every sale.
                </p>
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
                  onClick={handlePublish}
                  disabled={isProcessing}
                  className="flex-1 py-2 px-4 rounded-lg font-semibold text-sm flex items-center justify-center gap-2 transition-all hover:scale-[1.02] disabled:opacity-50"
                  style={{
                    background: 'linear-gradient(135deg, rgba(200, 150, 80, 0.4) 0%, rgba(180, 130, 60, 0.3) 100%)',
                    border: '1px solid rgba(240, 200, 120, 0.5)',
                    color: 'rgba(255, 240, 180, 0.95)',
                  }}
                >
                  {isProcessing ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <CreditCard size={16} />
                  )}
                  Pay & Publish
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
                <Rocket size={32} className="text-green-400" />
              </motion.div>
              
              <h3 
                className="text-2xl font-bold mb-2 pixelized"
                style={{ color: 'rgba(150, 255, 150, 0.95)' }}
              >
                Game Published!
              </h3>
              <p 
                className="text-sm"
                style={{ color: 'rgba(200, 240, 200, 0.85)' }}
              >
                {gameTitle} is now live on Shader House
              </p>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}



