'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Particles from '@/components/fx/Particles';
import { SubscriptionBadge } from '@/components/subscriptions/SubscriptionBadge';
import { Crown, Calendar, CreditCard, AlertCircle, CheckCircle, TrendingUp, Coins } from 'lucide-react';
import Link from 'next/link';

export default function SubscriptionManagementPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [isCanceling, setIsCanceling] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const userRes = await fetch('/api/auth/me');
      if (userRes.ok) {
        const userData = await userRes.json();
        setUser(userData.user);
      } else {
        router.push('/login');
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelSubscription = async () => {
    if (!confirm('Are you sure you want to cancel your subscription? You will lose access to premium features immediately.')) {
      return;
    }

    setIsCanceling(true);
    try {
      const res = await fetch('/api/subscriptions/cancel', {
        method: 'POST',
      });

      if (res.ok) {
        alert('Subscription canceled successfully. Redirecting to profile...');
        // Reload the page to refresh user data
        window.location.href = '/profile/gamer';
      } else {
        const error = await res.json();
        alert(error.error || 'Failed to cancel subscription');
        setIsCanceling(false);
      }
    } catch (error) {
      console.error('Error canceling subscription:', error);
      alert('An error occurred');
      setIsCanceling(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen relative overflow-hidden flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <Particles />
        <div className="text-xl font-semibold text-white">Loading...</div>
      </div>
    );
  }

  const isActive = user?.subscriptionStatus === 'ACTIVE';
  const isFree = user?.subscriptionTier === 'FREE';

  return (
    <div className="min-h-dvh relative overflow-hidden">
      <Particles />

      <motion.main
        className="relative z-10 flex min-h-dvh flex-col items-center justify-start p-6 pt-12"
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header */}
        <motion.div
          className="w-full max-w-5xl mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] pixelized mb-2" style={{ color: "rgba(200, 240, 200, 0.6)" }}>
                Manage Plan
              </p>
              <h1
                className="text-4xl font-bold tracking-wider uppercase pixelized"
                style={{
                  textShadow: `
                    0 0 12px rgba(120, 200, 120, 0.8),
                    0 0 24px rgba(100, 180, 100, 0.6),
                    2px 2px 0px rgba(0, 0, 0, 0.9)
                  `,
                  color: "rgba(180, 220, 180, 0.95)",
                }}
              >
                Subscription
              </h1>
            </div>
            <div className="flex flex-col items-end gap-3">
              {/* Level & Points */}
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <TrendingUp size={14} style={{ color: "rgba(180, 240, 180, 0.7)" }} />
                  <span
                    className="text-sm font-bold pixelized"
                    style={{ color: "rgba(180, 240, 180, 0.9)" }}
                  >
                    Lv. {user?.level || 1}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Coins size={14} style={{ color: "rgba(240, 220, 140, 0.7)" }} />
                  <span
                    className="text-sm font-bold pixelized"
                    style={{ color: "rgba(240, 220, 140, 0.9)" }}
                  >
                    {user?.points || 0}
                  </span>
                </div>
              </div>
              <Link
                href="/profile/gamer"
                className="text-xs font-semibold uppercase tracking-[0.2em] hover:underline transition-all pixelized"
                style={{ color: "rgba(200, 240, 200, 0.75)" }}
              >
                ← Back to Gamer Hub
              </Link>
            </div>
          </div>
          <p
            className="text-sm pixelized"
            style={{ color: "rgba(200, 240, 200, 0.65)", textShadow: "1px 1px 0px rgba(0, 0, 0, 0.8)" }}
          >
            Manage your subscription and billing
          </p>
        </motion.div>

        <div className="w-full max-w-5xl space-y-6">
          {/* Current Plan Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-lg p-8 border"
            style={{
              background: isFree
                ? "linear-gradient(145deg, rgba(30, 50, 40, 0.45) 0%, rgba(25, 45, 35, 0.55) 100%)"
                : "linear-gradient(145deg, rgba(60, 50, 30, 0.4) 0%, rgba(50, 40, 20, 0.5) 100%)",
              borderColor: isFree ? "rgba(140, 220, 140, 0.35)" : "rgba(220, 200, 120, 0.35)",
              boxShadow: isFree
                ? "0 8px 32px rgba(50, 150, 50, 0.25), inset 0 1px 2px rgba(255, 255, 255, 0.05)"
                : "0 8px 32px rgba(150, 120, 50, 0.25), inset 0 1px 2px rgba(255, 255, 255, 0.05)",
            }}
          >
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2
                  className="text-2xl font-bold tracking-wider uppercase pixelized mb-3"
                  style={{
                    textShadow: isFree
                      ? "0 0 8px rgba(140, 240, 140, 0.6), 1px 1px 0px rgba(0, 0, 0, 0.8)"
                      : "0 0 8px rgba(220, 180, 80, 0.6), 1px 1px 0px rgba(0, 0, 0, 0.8)",
                    color: isFree ? "rgba(180, 240, 180, 0.95)" : "rgba(240, 220, 140, 0.95)",
                  }}
                >
                  Current Plan
                </h2>
                <SubscriptionBadge tier={user?.subscriptionTier || 'FREE'} size="lg" />
              </div>
              {isActive && (
                <div
                  className="flex items-center gap-2 px-4 py-2 rounded border"
                  style={{
                    background: "rgba(100, 200, 100, 0.15)",
                    borderColor: "rgba(120, 200, 120, 0.35)",
                  }}
                >
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <span
                    className="font-bold uppercase tracking-wider pixelized text-xs"
                    style={{ color: "rgba(140, 240, 140, 0.95)" }}
                  >
                    Active
                  </span>
                </div>
              )}
            </div>

            {!isFree && user?.subscriptionStart && (
              <div className="space-y-4 mb-6">
                <div className="flex items-center gap-3" style={{ color: "rgba(230, 210, 150, 0.85)" }}>
                  <Calendar className="w-5 h-5" />
                  <span className="pixelized text-sm">Started: {new Date(user.subscriptionStart).toLocaleDateString()}</span>
                </div>
                {user?.subscriptionEnd && (
                  <div className="flex items-center gap-3" style={{ color: "rgba(230, 210, 150, 0.85)" }}>
                    <Calendar className="w-5 h-5" />
                    <span className="pixelized text-sm">Ends: {new Date(user.subscriptionEnd).toLocaleDateString()}</span>
                  </div>
                )}
              </div>
            )}

            {isFree ? (
              <div
                className="border rounded-lg p-6"
                style={{
                  background: "linear-gradient(145deg, rgba(30, 50, 40, 0.3) 0%, rgba(20, 40, 30, 0.4) 100%)",
                  borderColor: "rgba(140, 220, 140, 0.4)",
                  boxShadow: "0 4px 16px rgba(50, 150, 50, 0.25), inset 0 1px 2px rgba(255, 255, 255, 0.05)",
                }}
              >
                <h3
                  className="text-lg font-bold tracking-wider uppercase pixelized mb-2"
                  style={{
                    color: "rgba(180, 240, 180, 0.95)",
                    textShadow: "0 0 8px rgba(140, 220, 140, 0.6), 1px 1px 0px rgba(0, 0, 0, 0.8)",
                  }}
                >
                  You're All Set!
                </h3>
                <p
                  className="pixelized text-sm mb-4"
                  style={{ color: "rgba(200, 240, 200, 0.85)" }}
                >
                  You have full access to all platform features including beta testing, achievements, community access, and more!
                </p>
              </div>
            ) : (
              /* COMMENTED OUT - Creator Support Pass upgrade hidden */
              <div className="flex flex-wrap gap-4">
                <Link
                  href="/membership"
                  className="px-6 py-3 rounded-lg font-bold uppercase tracking-wider pixelized text-sm transition-all hover:scale-[1.02]"
                  style={{
                    background: "linear-gradient(135deg, rgba(200, 170, 80, 0.4) 0%, rgba(180, 150, 60, 0.3) 100%)",
                    border: "1px solid rgba(240, 220, 140, 0.5)",
                    color: "rgba(255, 245, 200, 0.95)",
                    boxShadow: "0 4px 12px rgba(150, 120, 50, 0.4)",
                  }}
                >
                  Change Plan
                </Link>
                {isActive && (
                  <button
                    onClick={handleCancelSubscription}
                    disabled={isCanceling}
                    className="px-6 py-3 rounded-lg font-bold uppercase tracking-wider pixelized text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02]"
                    style={{
                      background: "rgba(200, 100, 100, 0.2)",
                      border: "1px solid rgba(240, 150, 150, 0.35)",
                      color: "rgba(255, 180, 180, 0.95)",
                      boxShadow: "0 4px 12px rgba(0, 0, 0, 0.3)",
                    }}
                  >
                    {isCanceling ? 'Canceling...' : 'Cancel Subscription'}
                  </button>
                )}
              </div>
            )}
          </motion.div>

          {/* Features Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="rounded-lg p-8 border"
            style={{
              background: isFree
                ? "linear-gradient(145deg, rgba(30, 50, 40, 0.45) 0%, rgba(25, 45, 35, 0.55) 100%)"
                : "linear-gradient(145deg, rgba(60, 50, 30, 0.4) 0%, rgba(50, 40, 20, 0.5) 100%)",
              borderColor: isFree ? "rgba(140, 220, 140, 0.35)" : "rgba(220, 200, 120, 0.35)",
              boxShadow: isFree
                ? "0 8px 32px rgba(50, 150, 50, 0.25), inset 0 1px 2px rgba(255, 255, 255, 0.05)"
                : "0 8px 32px rgba(150, 120, 50, 0.25), inset 0 1px 2px rgba(255, 255, 255, 0.05)",
            }}
          >
            <h2
              className="text-2xl font-bold tracking-wider uppercase pixelized mb-6"
              style={{
                textShadow: isFree 
                  ? "0 0 8px rgba(140, 240, 140, 0.6), 1px 1px 0px rgba(0, 0, 0, 0.8)"
                  : "0 0 8px rgba(220, 180, 80, 0.6), 1px 1px 0px rgba(0, 0, 0, 0.8)",
                color: isFree ? "rgba(180, 240, 180, 0.95)" : "rgba(240, 220, 140, 0.95)",
              }}
            >
              Your Benefits
            </h2>
            
            {isFree ? (
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <span className="mt-1" style={{ color: "rgba(160, 240, 160, 0.75)" }}>✓</span>
                  <span className="pixelized text-sm" style={{ color: "rgba(200, 255, 200, 0.85)" }}>Buy games individually</span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="mt-1" style={{ color: "rgba(160, 240, 160, 0.75)" }}>✓</span>
                  <span className="pixelized text-sm" style={{ color: "rgba(200, 255, 200, 0.85)" }}>Access to community & reviews</span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="mt-1" style={{ color: "rgba(160, 240, 160, 0.75)" }}>✓</span>
                  <span className="pixelized text-sm" style={{ color: "rgba(200, 255, 200, 0.85)" }}>Free demos & limited F2P games</span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="mt-1" style={{ color: "rgba(160, 240, 160, 0.75)" }}>✓</span>
                  <span className="pixelized text-sm" style={{ color: "rgba(200, 255, 200, 0.85)" }}>Cloud saves for purchased games</span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="mt-1" style={{ color: "rgba(160, 240, 160, 0.75)" }}>✓</span>
                  <span className="pixelized text-sm" style={{ color: "rgba(200, 255, 200, 0.85)" }}>User profiles & wishlists</span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="mt-1" style={{ color: "rgba(160, 240, 160, 0.75)" }}>✓</span>
                  <span className="pixelized text-sm" style={{ color: "rgba(200, 255, 200, 0.85)" }}>Shader House digest newsletter</span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="mt-1" style={{ color: "rgba(160, 240, 160, 0.75)" }}>✓</span>
                  <span className="pixelized text-sm" style={{ color: "rgba(200, 255, 200, 0.85)" }}>Access to all beta builds</span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="mt-1" style={{ color: "rgba(160, 240, 160, 0.75)" }}>✓</span>
                  <span className="pixelized text-sm" style={{ color: "rgba(200, 255, 200, 0.85)" }}>Game test access</span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="mt-1" style={{ color: "rgba(160, 240, 160, 0.75)" }}>✓</span>
                  <span className="pixelized text-sm" style={{ color: "rgba(200, 255, 200, 0.85)" }}>Support developers directly</span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="mt-1" style={{ color: "rgba(160, 240, 160, 0.75)" }}>✓</span>
                  <span className="pixelized text-sm" style={{ color: "rgba(200, 255, 200, 0.85)" }}>Exclusive in-game cosmetics</span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="mt-1" style={{ color: "rgba(160, 240, 160, 0.75)" }}>✓</span>
                  <span className="pixelized text-sm" style={{ color: "rgba(200, 255, 200, 0.85)" }}>Voting power on updates & features</span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="mt-1" style={{ color: "rgba(160, 240, 160, 0.75)" }}>✓</span>
                  <span className="pixelized text-sm" style={{ color: "rgba(200, 255, 200, 0.85)" }}>Direct dev community access</span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="mt-1" style={{ color: "rgba(160, 240, 160, 0.75)" }}>✓</span>
                  <span className="pixelized text-sm" style={{ color: "rgba(200, 255, 200, 0.85)" }}>Achievements & badges</span>
                </div>
              </div>
            ) : (
              /* LEGACY: Creator Support Pass features (now in FREE) */
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <span className="mt-1" style={{ color: "rgba(240, 210, 120, 0.85)" }}>✓</span>
                  <span className="pixelized text-sm" style={{ color: "rgba(230, 210, 150, 0.9)" }}>Unlimited access to entire game library</span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="mt-1" style={{ color: "rgba(240, 210, 120, 0.85)" }}>✓</span>
                  <span className="pixelized text-sm" style={{ color: "rgba(230, 210, 150, 0.9)" }}>Support developers directly</span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="mt-1" style={{ color: "rgba(240, 210, 120, 0.85)" }}>✓</span>
                  <span className="pixelized text-sm" style={{ color: "rgba(230, 210, 150, 0.9)" }}>Access to all beta builds</span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="mt-1" style={{ color: "rgba(240, 210, 120, 0.85)" }}>✓</span>
                  <span className="pixelized text-sm" style={{ color: "rgba(230, 210, 150, 0.9)" }}>Exclusive in-game cosmetics</span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="mt-1" style={{ color: "rgba(240, 210, 120, 0.85)" }}>✓</span>
                  <span className="pixelized text-sm" style={{ color: "rgba(230, 210, 150, 0.9)" }}>Game test access</span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="mt-1" style={{ color: "rgba(240, 210, 120, 0.85)" }}>✓</span>
                  <span className="pixelized text-sm" style={{ color: "rgba(230, 210, 150, 0.9)" }}>Voting power on updates & features</span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="mt-1" style={{ color: "rgba(240, 210, 120, 0.85)" }}>✓</span>
                  <span className="pixelized text-sm" style={{ color: "rgba(230, 210, 150, 0.9)" }}>Direct dev community access</span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="mt-1" style={{ color: "rgba(240, 210, 120, 0.85)" }}>✓</span>
                  <span className="pixelized text-sm" style={{ color: "rgba(230, 210, 150, 0.9)" }}>Achievements & badges</span>
                </div>
              </div>
            )}
          </motion.div>

          {/* Billing Info (Demo Note) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-blue-500/10 backdrop-blur-sm rounded-2xl p-6 border border-blue-500/30"
          >
            <div className="flex items-start gap-3">
              <AlertCircle className="w-6 h-6 text-blue-400 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-lg font-bold text-white mb-2">Demo Mode</h3>
                <p className="text-white/70">
                  This is currently running in demo mode. In production, billing will be handled securely through Stripe with automatic renewals and payment method management.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.main>
    </div>
  );
}

