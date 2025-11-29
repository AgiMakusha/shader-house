'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter, useSearchParams } from 'next/navigation';
import Particles from '@/components/fx/Particles';
import { CheckCircle, Loader2, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function MembershipSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isProcessing, setIsProcessing] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Simulate processing for demo
    // In production, this would verify the Stripe session_id
    const sessionId = searchParams.get('session_id');
    const isDemo = searchParams.get('demo');
    
    const processSubscription = async () => {
      try {
        if (isDemo) {
          // Demo mode - just wait briefly and mark as complete
          await new Promise(resolve => setTimeout(resolve, 1500));
          setIsProcessing(false);
          
          // Reload the entire app to refresh the session
          setTimeout(() => {
            window.location.href = '/profile/gamer';
          }, 2000);
        } else {
          // Production mode - verify with Stripe
          await new Promise(resolve => setTimeout(resolve, 2000));
          
          // TODO: In production, verify the Stripe session
          // const response = await fetch(`/api/subscriptions/verify?session_id=${sessionId}`);
          // if (!response.ok) throw new Error('Verification failed');
          
          setIsProcessing(false);
        }
      } catch (err) {
        console.error('Error processing subscription:', err);
        setError('Failed to process subscription. Please contact support.');
        setIsProcessing(false);
      }
    };

    processSubscription();
  }, [searchParams]);

  if (error) {
    return (
      <div className="min-h-dvh relative overflow-hidden flex items-center justify-center">
        <Particles />
        <motion.div
          className="relative z-10 max-w-2xl mx-auto text-center px-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div
            className="rounded-lg p-12 border"
            style={{
              background: "linear-gradient(145deg, rgba(50, 30, 30, 0.5) 0%, rgba(40, 20, 20, 0.6) 100%)",
              borderColor: "rgba(240, 150, 150, 0.35)",
              boxShadow: "0 8px 32px rgba(150, 50, 50, 0.4), inset 0 1px 2px rgba(255, 255, 255, 0.05)",
            }}
          >
            <div
              className="inline-flex items-center justify-center w-20 h-20 rounded-full mb-6"
              style={{ background: "rgba(200, 100, 100, 0.25)" }}
            >
              <span className="text-4xl">❌</span>
            </div>
            <h1
              className="text-4xl font-bold tracking-wider uppercase pixelized mb-4"
              style={{
                textShadow: "0 0 8px rgba(240, 120, 120, 0.6), 1px 1px 0px rgba(0, 0, 0, 0.8)",
                color: "rgba(255, 180, 180, 0.95)",
              }}
            >
              Something went wrong
            </h1>
            <p
              className="text-lg pixelized mb-8"
              style={{ color: "rgba(240, 200, 200, 0.75)" }}
            >
              {error}
            </p>
            <Link
              href="/membership"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-bold uppercase tracking-wider pixelized text-sm transition-all hover:scale-[1.02]"
              style={{
                background: "linear-gradient(135deg, rgba(120, 200, 120, 0.35) 0%, rgba(100, 180, 100, 0.25) 100%)",
                border: "1px solid rgba(140, 220, 140, 0.4)",
                color: "rgba(200, 255, 200, 0.95)",
                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.3)",
              }}
            >
              Try Again
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  if (isProcessing) {
    return (
      <div className="min-h-dvh relative overflow-hidden flex items-center justify-center">
        <Particles />
        <motion.div
          className="relative z-10 text-center px-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <Loader2
            className="w-16 h-16 animate-spin mx-auto mb-6"
            style={{ color: "rgba(180, 140, 220, 0.85)" }}
          />
          <h2
            className="text-2xl font-bold tracking-wider uppercase pixelized mb-2"
            style={{
              textShadow: "0 0 8px rgba(180, 140, 220, 0.6), 1px 1px 0px rgba(0, 0, 0, 0.8)",
              color: "rgba(200, 180, 240, 0.95)",
            }}
          >
            Processing your subscription...
          </h2>
          <p className="pixelized text-sm" style={{ color: "rgba(200, 240, 200, 0.65)" }}>
            Please wait while we confirm your payment
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-dvh relative overflow-hidden flex items-center justify-center">
      <Particles />
      
      <motion.div
        className="relative z-10 max-w-2xl mx-auto text-center px-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div
          className="rounded-lg p-12 border"
          style={{
            background: "linear-gradient(145deg, rgba(30, 50, 40, 0.5) 0%, rgba(20, 40, 30, 0.6) 100%)",
            borderColor: "rgba(120, 200, 120, 0.35)",
            boxShadow: "0 8px 32px rgba(50, 150, 50, 0.4), inset 0 1px 2px rgba(255, 255, 255, 0.05)",
          }}
        >
          {/* Success Icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="inline-flex items-center justify-center w-24 h-24 rounded-full mb-8"
            style={{ background: "rgba(100, 200, 100, 0.25)" }}
          >
            <CheckCircle
              className="w-16 h-16"
              style={{ color: "rgba(140, 240, 140, 0.95)" }}
            />
          </motion.div>

          {/* Success Message */}
          <motion.h1
            className="text-5xl font-bold tracking-wider uppercase pixelized mb-4"
            style={{
              textShadow: "0 0 12px rgba(120, 200, 120, 0.8), 2px 2px 0px rgba(0, 0, 0, 0.9)",
              color: "rgba(180, 240, 180, 0.95)",
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            Welcome Aboard! 🎉
          </motion.h1>

          <motion.p
            className="text-lg pixelized mb-8"
            style={{ color: "rgba(200, 240, 200, 0.85)" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            Your subscription has been activated successfully!
          </motion.p>

          {/* Benefits */}
          <motion.div
            className="rounded-lg p-6 mb-8 text-left"
            style={{
              background: "rgba(40, 60, 50, 0.3)",
              border: "1px solid rgba(120, 200, 120, 0.2)",
            }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <h3
              className="text-lg font-bold tracking-wider uppercase pixelized mb-4"
              style={{
                color: "rgba(180, 220, 180, 0.95)",
                textShadow: "1px 1px 0px rgba(0, 0, 0, 0.8)",
              }}
            >
              What's Next?
            </h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <span className="mt-1" style={{ color: "rgba(140, 240, 140, 0.85)" }}>✓</span>
                <span className="pixelized text-sm" style={{ color: "rgba(200, 240, 200, 0.75)" }}>
                  Explore the Pro Library and discover amazing indie games
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1" style={{ color: "rgba(140, 240, 140, 0.85)" }}>✓</span>
                <span className="pixelized text-sm" style={{ color: "rgba(200, 240, 200, 0.75)" }}>
                  Support your favorite developers and get beta access
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1" style={{ color: "rgba(140, 240, 140, 0.85)" }}>✓</span>
                <span className="pixelized text-sm" style={{ color: "rgba(200, 240, 200, 0.75)" }}>
                  Claim your monthly free games
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1" style={{ color: "rgba(140, 240, 140, 0.85)" }}>✓</span>
                <span className="pixelized text-sm" style={{ color: "rgba(200, 240, 200, 0.75)" }}>
                  Join exclusive developer communities
                </span>
              </li>
            </ul>
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <Link
              href="/games/pro-library"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-lg font-bold uppercase tracking-wider pixelized text-sm transition-all hover:scale-[1.02]"
              style={{
                background: "linear-gradient(135deg, rgba(150, 100, 200, 0.4) 0%, rgba(120, 80, 180, 0.3) 100%)",
                border: "1px solid rgba(200, 150, 255, 0.5)",
                color: "rgba(240, 220, 255, 0.95)",
                boxShadow: "0 4px 12px rgba(100, 50, 150, 0.4)",
              }}
            >
              Browse Pro Library
              <ArrowRight size={20} />
            </Link>
            <Link
              href="/profile/gamer"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-lg font-bold uppercase tracking-wider pixelized text-sm transition-all hover:scale-[1.02]"
              style={{
                background: "linear-gradient(135deg, rgba(120, 200, 120, 0.35) 0%, rgba(100, 180, 100, 0.25) 100%)",
                border: "1px solid rgba(140, 220, 140, 0.4)",
                color: "rgba(200, 255, 200, 0.95)",
                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.3)",
              }}
            >
              Go to Profile
            </Link>
          </motion.div>

          {/* Footer Note */}
          <motion.p
            className="mt-8 text-xs pixelized"
            style={{ color: "rgba(200, 240, 200, 0.5)" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
          >
            A confirmation email has been sent to your inbox
          </motion.p>
        </div>
      </motion.div>
    </div>
  );
}

