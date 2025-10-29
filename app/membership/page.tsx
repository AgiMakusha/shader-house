"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { GameCard, GameCardContent } from "@/components/game/GameCard";
import { GameIcon } from "@/components/game/GameIcon";
import { GameController, TrophyCup } from "@/components/icons";
import Particles from "@/components/fx/Particles";
import { useAudio } from "@/components/audio/AudioProvider";

export default function MembershipPage() {
  const router = useRouter();
  const { play } = useAudio();
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    // Check authentication and role
    const checkAuth = async () => {
      try {
        const response = await fetch("/api/auth/me");
        if (!response.ok) {
          router.push("/login");
          return;
        }
        const data = await response.json();
        if (data.user.role !== "GAMER") {
          router.push("/profile/developer");
          return;
        }
        setUser(data.user);
      } catch (error) {
        console.error("Error fetching profile:", error);
        router.push("/login");
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  const handleSelectMembership = async () => {
    setIsProcessing(true);
    play("success");
    
    // TODO: Integrate payment processing (Stripe, etc.)
    // For now, just simulate success and redirect
    setTimeout(() => {
      router.push("/profile/gamer");
    }, 1000);
  };

  if (isLoading) {
    return (
      <div className="min-h-dvh relative overflow-hidden flex items-center justify-center">
        <Particles />
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <div className="text-xl font-semibold pixelized" style={{ color: 'rgba(200, 240, 200, 0.9)' }}>
            Loading...
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-dvh relative overflow-hidden">
      <Particles />
      
      <motion.main 
        className="relative z-10 flex min-h-dvh flex-col items-center justify-center p-6"
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div
          className="w-full max-w-2xl"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {/* Header */}
          <motion.div
            className="text-center mb-8"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <h1 
              className="text-4xl font-bold tracking-wider uppercase pixelized mb-3"
              style={{
                textShadow: `
                  0 0 12px rgba(120, 200, 120, 0.8),
                  0 0 24px rgba(100, 180, 100, 0.6),
                  2px 2px 0px rgba(0, 0, 0, 0.9)
                `,
                color: 'rgba(180, 220, 180, 0.95)',
              }}
            >
              Choose Your Membership
            </h1>
            <p 
              className="text-base font-semibold tracking-wide pixelized"
              style={{
                textShadow: '1px 1px 0px rgba(0, 0, 0, 0.8)',
                color: 'rgba(200, 240, 200, 0.7)',
              }}
            >
              Welcome, {user?.name}! Select a plan to continue
            </p>
          </motion.div>

          {/* Membership Card */}
          <GameCard>
            <GameCardContent className="p-8">
              {/* Basic Membership */}
              <div className="space-y-6">
                <div className="flex items-start gap-4 mb-6">
                  <div className="flex-shrink-0">
                    <GameIcon size="lg">
                      <TrophyCup className="w-full h-full" />
                    </GameIcon>
                  </div>
                  <div className="flex-1">
                    <h2 
                      className="text-2xl font-bold mb-2 pixelized"
                      style={{
                        textShadow: '0 0 8px rgba(120, 200, 120, 0.6), 1px 1px 0px rgba(0, 0, 0, 0.8)',
                        color: 'rgba(180, 220, 180, 0.95)',
                      }}
                    >
                      Basic Membership
                    </h2>
                    <div className="flex items-baseline gap-2 mb-4">
                      <span 
                        className="text-4xl font-bold pixelized"
                        style={{
                          textShadow: '0 0 8px rgba(150, 250, 150, 0.5), 1px 1px 0px rgba(0, 0, 0, 0.8)',
                          color: 'rgba(150, 250, 150, 0.95)',
                        }}
                      >
                        5€
                      </span>
                      <span 
                        className="text-base font-medium"
                        style={{ color: 'rgba(200, 240, 200, 0.6)' }}
                      >
                        per month
                      </span>
                    </div>
                  </div>
                </div>

                {/* Features */}
                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-2 h-2 rounded-full"
                      style={{ 
                        backgroundColor: 'rgba(100, 200, 100, 0.8)',
                        boxShadow: '0 0 6px rgba(100, 200, 100, 0.6)'
                      }}
                    />
                    <span style={{ color: 'rgba(200, 240, 200, 0.9)' }}>
                      Full access to game library
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-2 h-2 rounded-full"
                      style={{ 
                        backgroundColor: 'rgba(100, 200, 100, 0.8)',
                        boxShadow: '0 0 6px rgba(100, 200, 100, 0.6)'
                      }}
                    />
                    <span style={{ color: 'rgba(200, 240, 200, 0.9)' }}>
                      Community features
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-2 h-2 rounded-full"
                      style={{ 
                        backgroundColor: 'rgba(100, 200, 100, 0.8)',
                        boxShadow: '0 0 6px rgba(100, 200, 100, 0.6)'
                      }}
                    />
                    <span style={{ color: 'rgba(200, 240, 200, 0.9)' }}>
                      Achievement tracking
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-2 h-2 rounded-full"
                      style={{ 
                        backgroundColor: 'rgba(100, 200, 100, 0.8)',
                        boxShadow: '0 0 6px rgba(100, 200, 100, 0.6)'
                      }}
                    />
                    <span style={{ color: 'rgba(200, 240, 200, 0.9)' }}>
                      Priority support
                    </span>
                  </div>
                </div>

                {/* Terms Link */}
                <div className="mb-6 pb-6 border-b" style={{ borderColor: 'rgba(200, 240, 200, 0.2)' }}>
                  <Link
                    href="/terms"
                    className="text-sm font-medium hover:underline transition-all inline-flex items-center gap-1"
                    style={{ color: 'rgba(150, 250, 150, 0.9)' }}
                  >
                    See our Terms of Use for more details about membership
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </Link>
                </div>

                {/* Payment Section */}
                <div className="space-y-4">
                  <h3 
                    className="text-lg font-bold pixelized mb-4"
                    style={{
                      textShadow: '0 0 6px rgba(120, 200, 120, 0.5), 1px 1px 0px rgba(0, 0, 0, 0.8)',
                      color: 'rgba(180, 220, 180, 0.95)',
                    }}
                  >
                    Payment Method
                  </h3>
                  
                  <div className="bg-white/5 rounded-lg p-4 border" style={{ borderColor: 'rgba(200, 240, 200, 0.2)' }}>
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-8 h-8 rounded flex items-center justify-center"
                        style={{ 
                          backgroundColor: 'rgba(100, 200, 100, 0.2)',
                          border: '1px solid rgba(200, 240, 200, 0.3)'
                        }}
                      >
                        <svg
                          className="w-5 h-5"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                          style={{ color: 'rgba(150, 250, 150, 0.9)' }}
                        >
                          <path d="M20 4H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z" />
                        </svg>
                      </div>
                      <div>
                        <p 
                          className="font-semibold"
                          style={{ color: 'rgba(200, 240, 200, 0.9)' }}
                        >
                          Credit or Debit Card
                        </p>
                        <p 
                          className="text-sm"
                          style={{ color: 'rgba(200, 240, 200, 0.6)' }}
                        >
                          Secure payment processing
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Payment Form Placeholder */}
                  <div className="space-y-4 pt-4">
                    <div>
                      <label 
                        className="block text-sm font-medium mb-2"
                        style={{ color: 'rgba(200, 240, 200, 0.7)' }}
                      >
                        Card Number
                      </label>
                      <input
                        type="text"
                        placeholder="1234 5678 9012 3456"
                        className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/20 focus:outline-none focus:ring-2 focus:ring-green-500/50 transition-all backdrop-blur-sm"
                        style={{ color: 'rgba(200, 240, 200, 0.8)' }}
                        disabled={isProcessing}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label 
                          className="block text-sm font-medium mb-2"
                          style={{ color: 'rgba(200, 240, 200, 0.7)' }}
                        >
                          Expiry Date
                        </label>
                        <input
                          type="text"
                          placeholder="MM/YY"
                          className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/20 focus:outline-none focus:ring-2 focus:ring-green-500/50 transition-all backdrop-blur-sm"
                          style={{ color: 'rgba(200, 240, 200, 0.8)' }}
                          disabled={isProcessing}
                        />
                      </div>
                      <div>
                        <label 
                          className="block text-sm font-medium mb-2"
                          style={{ color: 'rgba(200, 240, 200, 0.7)' }}
                        >
                          CVV
                        </label>
                        <input
                          type="text"
                          placeholder="123"
                          className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/20 focus:outline-none focus:ring-2 focus:ring-green-500/50 transition-all backdrop-blur-sm"
                          style={{ color: 'rgba(200, 240, 200, 0.8)' }}
                          disabled={isProcessing}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Subscribe Button */}
                  <motion.button
                    onClick={handleSelectMembership}
                    disabled={isProcessing}
                    className="w-full py-4 rounded-lg font-semibold text-lg uppercase tracking-wider transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-6"
                    style={{
                      background: 'linear-gradient(135deg, rgba(100, 200, 100, 0.3) 0%, rgba(80, 180, 80, 0.2) 100%)',
                      border: '1px solid rgba(200, 240, 200, 0.3)',
                      color: 'rgba(200, 240, 200, 0.95)',
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
                    }}
                    whileHover={!isProcessing ? { scale: 1.02 } : {}}
                    whileTap={!isProcessing ? { scale: 0.98 } : {}}
                  >
                    {isProcessing ? 'Processing...' : 'Subscribe for 5€/month'}
                  </motion.button>
                </div>
              </div>
            </GameCardContent>
          </GameCard>

          {/* Footer Note */}
          <motion.p
            className="text-center mt-6 text-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            style={{ color: 'rgba(200, 240, 200, 0.5)' }}
          >
            Cancel anytime. No hidden fees.
          </motion.p>
        </motion.div>
      </motion.main>
    </div>
  );
}

