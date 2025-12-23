"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Mail, ArrowLeft, CheckCircle, AlertTriangle } from "lucide-react";
import { GameCard, GameCardContent } from "@/components/game/GameCard";
import { GameIcon } from "@/components/game/GameIcon";
import { GameHouse } from "@/components/icons";
import Particles from "@/components/fx/Particles";

export default function ResetPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState("");

  const validateEmail = () => {
    if (!email.trim()) {
      setError("Your email is required to reset your password");
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email address");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    // Validate email
    if (!validateEmail()) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/auth/reset-password/request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: email.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Handle rate limiting
        if (response.status === 429) {
          throw new Error(data.error || 'Too many requests. Please try again later.');
        }
        throw new Error(data.error || 'Failed to send reset email');
      }

      setIsSubmitted(true);
    } catch (err: any) {
      console.error('Password reset request error:', err);
      setError(err.message || 'An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
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
                    <div className="flex justify-center mb-4">
                      <div 
                        className="w-16 h-16 rounded-full flex items-center justify-center"
                        style={{
                          background: 'rgba(100, 200, 100, 0.2)',
                          border: '2px solid rgba(150, 240, 150, 0.4)',
                        }}
                      >
                        <CheckCircle 
                          size={32} 
                          style={{ color: 'rgba(150, 250, 150, 0.9)' }} 
                        />
                      </div>
                    </div>
                    <p style={{ color: 'rgba(200, 240, 200, 0.9)' }}>
                      If an account exists for <strong>{email}</strong>, you&apos;ll receive a password reset link shortly.
                    </p>
                    <p className="text-sm" style={{ color: 'rgba(200, 240, 200, 0.7)' }}>
                      Check your inbox and spam folder. The link will expire in 1 hour.
                    </p>
                    
                    <div 
                      className="mt-4 p-3 rounded-lg text-sm"
                      style={{
                        background: 'rgba(100, 200, 100, 0.1)',
                        border: '1px solid rgba(150, 240, 150, 0.2)',
                        color: 'rgba(200, 240, 200, 0.8)',
                      }}
                    >
                      <div className="flex items-center gap-2 justify-center">
                        <Mail size={16} />
                        <span>Didn&apos;t receive the email?</span>
                      </div>
                      <button
                        onClick={() => {
                          setIsSubmitted(false);
                          setError('');
                        }}
                        className="mt-2 text-sm font-semibold hover:underline"
                        style={{ color: 'rgba(150, 250, 150, 0.9)' }}
                      >
                        Try again with a different email
                      </button>
                    </div>

                    <Link 
                      href="/login"
                      className="inline-flex items-center gap-2 mt-4 px-6 py-2 rounded-lg font-semibold uppercase tracking-wider transition-all"
                      style={{
                        background: 'linear-gradient(135deg, rgba(100, 200, 100, 0.3) 0%, rgba(80, 180, 80, 0.2) 100%)',
                        border: '1px solid rgba(200, 240, 200, 0.3)',
                        color: 'rgba(200, 240, 200, 0.95)',
                      }}
                    >
                      <ArrowLeft size={16} />
                      Back to Login
                    </Link>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} noValidate className="space-y-6">
                    {/* Email Field */}
                    <div className="space-y-2">
                      <label 
                        htmlFor="email" 
                        className="block text-sm font-medium"
                        style={{ color: 'rgba(200, 240, 200, 0.9)' }}
                      >
                        Email
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Mail size={18} style={{ color: 'rgba(200, 240, 200, 0.5)' }} />
                        </div>
                        <input
                          id="email"
                          type="email"
                          value={email}
                          onChange={(e) => {
                            setEmail(e.target.value);
                            if (error) setError("");
                          }}
                          className={`w-full pl-10 pr-4 py-3 rounded-lg bg-white/10 border placeholder-white/40 focus:outline-none focus:ring-2 focus:border-transparent transition-all backdrop-blur-sm ${
                            error 
                              ? 'border-red-500/50 focus:ring-red-500/40' 
                              : 'border-white/20 focus:ring-white/40'
                          }`}
                          style={{ color: 'rgba(200, 240, 200, 0.8)' }}
                          placeholder="your@email.com"
                          disabled={isLoading}
                          autoComplete="email"
                        />
                      </div>
                      {error && (
                        <motion.div 
                          initial={{ opacity: 0, y: -4 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="flex items-center gap-2 text-xs mt-1.5 px-1"
                          style={{ 
                            color: 'rgba(255, 180, 180, 0.9)',
                            textShadow: '0 1px 2px rgba(0, 0, 0, 0.6)'
                          }}
                        >
                          <AlertTriangle size={14} />
                          {error}
                        </motion.div>
                      )}
                    </div>

                    {/* Security Notice */}
                    <div 
                      className="p-3 rounded-lg text-xs"
                      style={{
                        background: 'rgba(100, 200, 100, 0.08)',
                        border: '1px solid rgba(150, 240, 150, 0.15)',
                        color: 'rgba(200, 240, 200, 0.7)',
                      }}
                    >
                      For security, we&apos;ll send a password reset link to your email. The link expires in 1 hour.
                    </div>

                    {/* Submit Button */}
                    <motion.button
                      type="submit"
                      disabled={isLoading}
                      className="w-full py-3 rounded-lg font-semibold uppercase tracking-wider transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      style={{
                        background: 'linear-gradient(135deg, rgba(100, 200, 100, 0.3) 0%, rgba(80, 180, 80, 0.2) 100%)',
                        border: '1px solid rgba(200, 240, 200, 0.3)',
                        color: 'rgba(200, 240, 200, 0.95)',
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
                      }}
                      whileHover={!isLoading ? { scale: 1.02 } : {}}
                      whileTap={!isLoading ? { scale: 0.98 } : {}}
                    >
                      {isLoading ? (
                        <>
                          <span className="animate-spin">⟳</span>
                          Sending...
                        </>
                      ) : (
                        <>
                          <Mail size={18} />
                          Send Reset Link
                        </>
                      )}
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
                className="inline-flex items-center gap-2 text-sm hover:underline transition-all"
                style={{ color: 'rgba(200, 240, 200, 0.7)' }}
              >
                <ArrowLeft size={14} />
                Back to login
              </Link>
            </motion.div>
          )}
        </div>
      </motion.main>
    </div>
  );
}
