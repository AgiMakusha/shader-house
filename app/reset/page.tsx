"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { GameCard, GameCardContent } from "@/components/game/GameCard";
import { GameIcon } from "@/components/game/GameIcon";
import { GameHouse } from "@/components/icons";
import Particles from "@/components/fx/Particles";

export default function ResetPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // TODO: Add actual password reset logic here
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setIsLoading(false);
    setIsSubmitted(true);
  };

  return (
    <div className="min-h-dvh relative overflow-hidden">
      <Particles />
      
      <motion.main 
        className="relative z-10 flex min-h-dvh flex-col items-center justify-center p-6"
        initial={{ opacity: 0, y: 6 }}
        animate={{ 
          opacity: 1, 
          y: 0, 
          transition: { 
            duration: 0.6, 
            ease: [0.22, 1, 0.36, 1] 
          } 
        }}
      >
        <div className="w-full max-w-md space-y-6">
          {/* Logo/Icon */}
          <motion.div
            className="flex justify-center"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            <GameIcon size={80} glow rounded={false} aria-hidden>
              <GameHouse className="w-2/3 h-2/3 icon-ink" title="Shader House" />
            </GameIcon>
          </motion.div>

          {/* Title */}
          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <h1 
              className="text-3xl font-bold tracking-wider uppercase pixelized mb-2"
              style={{
                textShadow: `
                  0 0 10px rgba(100, 200, 100, 0.6),
                  0 0 20px rgba(80, 160, 80, 0.4),
                  2px 2px 0px rgba(0, 0, 0, 0.8)
                `,
                color: 'rgba(150, 250, 150, 0.95)',
              }}
            >
              Reset Password
            </h1>
            <p
              className="text-sm font-semibold tracking-wide uppercase pixelized"
              style={{
                textShadow: '1px 1px 0px rgba(0, 0, 0, 0.8)',
                color: 'rgba(200, 240, 200, 0.8)',
              }}
            >
              {isSubmitted ? 'Check your email' : 'Enter your email address'}
            </p>
          </motion.div>

          {/* Reset Form Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <GameCard>
              <GameCardContent className="p-8">
                {isSubmitted ? (
                  <div className="text-center space-y-4">
                    <p style={{ color: 'rgba(200, 240, 200, 0.9)' }}>
                      We've sent a password reset link to <strong>{email}</strong>
                    </p>
                    <p className="text-sm" style={{ color: 'rgba(200, 240, 200, 0.7)' }}>
                      Check your inbox and follow the instructions to reset your password.
                    </p>
                    <Link 
                      href="/login"
                      className="inline-block mt-4 px-6 py-2 rounded-lg font-semibold uppercase tracking-wider transition-all"
                      style={{
                        background: 'linear-gradient(135deg, rgba(100, 200, 100, 0.3) 0%, rgba(80, 180, 80, 0.2) 100%)',
                        border: '1px solid rgba(200, 240, 200, 0.3)',
                        color: 'rgba(200, 240, 200, 0.95)',
                      }}
                    >
                      Back to Login
                    </Link>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Email Field */}
                    <div className="space-y-2">
                      <label 
                        htmlFor="email" 
                        className="block text-sm font-medium"
                        style={{ color: 'rgba(200, 240, 200, 0.9)' }}
                      >
                        Email
                      </label>
                      <input
                        id="email"
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/40 focus:border-transparent transition-all backdrop-blur-sm"
                        placeholder="your@email.com"
                        disabled={isLoading}
                      />
                    </div>

                    {/* Submit Button */}
                    <motion.button
                      type="submit"
                      disabled={isLoading}
                      className="w-full py-3 rounded-lg font-semibold uppercase tracking-wider transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      style={{
                        background: 'linear-gradient(135deg, rgba(100, 200, 100, 0.3) 0%, rgba(80, 180, 80, 0.2) 100%)',
                        border: '1px solid rgba(200, 240, 200, 0.3)',
                        color: 'rgba(200, 240, 200, 0.95)',
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
                      }}
                      whileHover={!isLoading ? { scale: 1.02 } : {}}
                      whileTap={!isLoading ? { scale: 0.98 } : {}}
                    >
                      {isLoading ? 'Sending...' : 'Send Reset Link'}
                    </motion.button>
                  </form>
                )}
              </GameCardContent>
            </GameCard>
          </motion.div>

          {/* Back to Login */}
          {!isSubmitted && (
            <motion.div
              className="text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              <Link 
                href="/login" 
                className="text-sm hover:underline transition-all"
                style={{ color: 'rgba(200, 240, 200, 0.7)' }}
              >
                ← Back to login
              </Link>
            </motion.div>
          )}
        </div>
      </motion.main>
    </div>
  );
}
