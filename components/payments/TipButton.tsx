'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Loader2, Check, X, DollarSign } from 'lucide-react';

interface TipButtonProps {
  developerId: string;
  developerName: string;
  variant?: 'default' | 'small' | 'large';
}

const TIP_PRESETS = [5, 10, 20, 50];

export function TipButton({
  developerId,
  developerName,
  variant = 'default',
}: TipButtonProps) {
  const [showModal, setShowModal] = useState(false);
  const [amount, setAmount] = useState<number>(10);
  const [customAmount, setCustomAmount] = useState('');
  const [message, setMessage] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState('');

  const effectiveAmount = customAmount ? parseFloat(customAmount) : amount;
  const isValidAmount = effectiveAmount >= 1 && effectiveAmount <= 1000;

  const handleTip = async () => {
    if (!isValidAmount) {
      setError('Amount must be between $1 and $1,000');
      return;
    }

    setIsProcessing(true);
    setError('');

    try {
      const res = await fetch('/api/payments/tip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          developerId,
          amount: effectiveAmount,
          message: message || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to process tip');
        setIsProcessing(false);
        return;
      }

      // Demo mode - show success
      if (data.demo) {
        setShowModal(false);
        setShowSuccess(true);
        setTimeout(() => {
          setShowSuccess(false);
          setAmount(10);
          setCustomAmount('');
          setMessage('');
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

  const buttonStyles = {
    default: {
      padding: 'py-2 px-4',
      fontSize: 'text-sm',
      iconSize: 16,
    },
    small: {
      padding: 'py-1.5 px-3',
      fontSize: 'text-xs',
      iconSize: 14,
    },
    large: {
      padding: 'py-3 px-6',
      fontSize: 'text-base',
      iconSize: 20,
    },
  };

  const style = buttonStyles[variant];

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className={`rounded-lg font-semibold ${style.padding} ${style.fontSize} flex items-center gap-2 transition-all hover:scale-[1.02]`}
        style={{
          background: 'linear-gradient(135deg, rgba(220, 100, 150, 0.3) 0%, rgba(200, 80, 130, 0.2) 100%)',
          border: '1px solid rgba(255, 150, 180, 0.4)',
          color: 'rgba(255, 200, 220, 0.95)',
        }}
      >
        <Heart size={style.iconSize} />
        Tip
      </button>

      {/* Tip Modal */}
      <AnimatePresence>
        {showModal && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(0, 0, 0, 0.85)' }}
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="rounded-xl p-6 max-w-md w-full"
              style={{
                background: 'linear-gradient(145deg, rgba(60, 40, 50, 0.98) 0%, rgba(50, 30, 40, 0.98) 100%)',
                border: '1px solid rgba(220, 100, 150, 0.3)',
                boxShadow: '0 8px 32px rgba(150, 50, 100, 0.3)',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 
                  className="text-xl font-bold pixelized flex items-center gap-2"
                  style={{ color: 'rgba(255, 180, 200, 0.95)' }}
                >
                  <Heart size={20} className="text-pink-400" />
                  Tip {developerName}
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-1 rounded hover:bg-white/10 transition-all"
                >
                  <X size={20} style={{ color: 'rgba(200, 200, 200, 0.7)' }} />
                </button>
              </div>

              {/* Preset Amounts */}
              <div className="grid grid-cols-4 gap-2 mb-4">
                {TIP_PRESETS.map((preset) => (
                  <button
                    key={preset}
                    onClick={() => {
                      setAmount(preset);
                      setCustomAmount('');
                    }}
                    className={`py-2 px-3 rounded-lg font-semibold text-sm transition-all ${
                      amount === preset && !customAmount ? 'scale-[1.05]' : ''
                    }`}
                    style={{
                      background: amount === preset && !customAmount
                        ? 'rgba(220, 100, 150, 0.4)'
                        : 'rgba(100, 80, 90, 0.3)',
                      border: amount === preset && !customAmount
                        ? '1px solid rgba(255, 150, 180, 0.6)'
                        : '1px solid rgba(150, 130, 140, 0.3)',
                      color: amount === preset && !customAmount
                        ? 'rgba(255, 200, 220, 0.95)'
                        : 'rgba(200, 180, 190, 0.8)',
                    }}
                  >
                    ${preset}
                  </button>
                ))}
              </div>

              {/* Custom Amount */}
              <div className="mb-4">
                <label 
                  className="block text-xs mb-1"
                  style={{ color: 'rgba(230, 180, 200, 0.6)' }}
                >
                  Or enter custom amount
                </label>
                <div className="relative">
                  <DollarSign 
                    size={16} 
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-pink-400/50" 
                  />
                  <input
                    type="number"
                    min="1"
                    max="1000"
                    step="0.01"
                    value={customAmount}
                    onChange={(e) => setCustomAmount(e.target.value)}
                    placeholder="Custom amount"
                    className="w-full py-2 pl-8 pr-4 rounded-lg text-sm"
                    style={{
                      background: 'rgba(100, 80, 90, 0.3)',
                      border: '1px solid rgba(150, 130, 140, 0.3)',
                      color: 'rgba(255, 200, 220, 0.95)',
                    }}
                  />
                </div>
              </div>

              {/* Message */}
              <div className="mb-4">
                <label 
                  className="block text-xs mb-1"
                  style={{ color: 'rgba(230, 180, 200, 0.6)' }}
                >
                  Add a message (optional)
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Thanks for the amazing game!"
                  maxLength={200}
                  rows={2}
                  className="w-full py-2 px-3 rounded-lg text-sm resize-none"
                  style={{
                    background: 'rgba(100, 80, 90, 0.3)',
                    border: '1px solid rgba(150, 130, 140, 0.3)',
                    color: 'rgba(255, 200, 220, 0.95)',
                  }}
                />
              </div>

              {error && (
                <p className="text-sm text-red-400 mb-3">{error}</p>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => setShowModal(false)}
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
                  onClick={handleTip}
                  disabled={isProcessing || !isValidAmount}
                  className="flex-1 py-2 px-4 rounded-lg font-semibold text-sm flex items-center justify-center gap-2 transition-all hover:scale-[1.02] disabled:opacity-50"
                  style={{
                    background: 'linear-gradient(135deg, rgba(220, 100, 150, 0.4) 0%, rgba(200, 80, 130, 0.3) 100%)',
                    border: '1px solid rgba(255, 150, 180, 0.5)',
                    color: 'rgba(255, 200, 220, 0.95)',
                  }}
                >
                  {isProcessing ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Heart size={16} />
                  )}
                  Send ${effectiveAmount.toFixed(2)}
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
                background: 'linear-gradient(145deg, rgba(60, 40, 50, 0.98) 0%, rgba(50, 30, 40, 0.98) 100%)',
                border: '1px solid rgba(220, 100, 150, 0.3)',
                boxShadow: '0 8px 32px rgba(150, 50, 100, 0.3)',
              }}
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center"
                style={{ background: 'rgba(220, 100, 150, 0.3)' }}
              >
                <Heart size={32} className="text-pink-400" />
              </motion.div>
              
              <h3 
                className="text-2xl font-bold mb-2 pixelized"
                style={{ color: 'rgba(255, 180, 200, 0.95)' }}
              >
                Tip Sent!
              </h3>
              <p 
                className="text-sm"
                style={{ color: 'rgba(230, 180, 200, 0.85)' }}
              >
                Thank you for supporting {developerName}
              </p>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}

