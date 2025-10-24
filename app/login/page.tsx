"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import { GameCard, GameCardContent } from "@/components/game/GameCard";
import { GameIcon } from "@/components/game/GameIcon";
import { GameHouse } from "@/components/icons";
import Particles from "@/components/fx/Particles";
import { useAudio } from "@/components/audio/AudioProvider";

export default function LoginPage() {
  const router = useRouter();
  const { play } = useAudio();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, rememberMe }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Login failed");
        setIsLoading(false);
        return;
      }

      // Success! Play sound and redirect
      play("door");
      
      // Redirect based on user role
      setTimeout(() => {
        if (data.user.role === "developer") {
          router.push("/register/developer");
        } else {
          router.push("/register/gamer");
        }
      }, 300);

    } catch (err) {
      console.error("Login error:", err);
      setError("An unexpected error occurred");
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
              Welcome Back
            </h1>
            <p
              className="text-sm font-semibold tracking-wide uppercase pixelized"
              style={{
                textShadow: '1px 1px 0px rgba(0, 0, 0, 0.8)',
                color: 'rgba(200, 240, 200, 0.8)',
              }}
            >
              Sign in to continue
            </p>
          </motion.div>

          {/* Login Form Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <GameCard>
              <GameCardContent className="p-8">
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
                      className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/40 focus:border-transparent transition-all backdrop-blur-sm"
                      style={{ color: 'rgba(200, 240, 200, 0.8)' }}
                      placeholder="your@email.com"
                      disabled={isLoading}
                    />
                  </div>

                  {/* Password Field */}
                  <div className="space-y-2">
                    <label 
                      htmlFor="password" 
                      className="block text-sm font-medium"
                      style={{ color: 'rgba(200, 240, 200, 0.9)' }}
                    >
                      Password
                    </label>
                    <input
                      id="password"
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/40 focus:border-transparent transition-all backdrop-blur-sm"
                      style={{ color: 'rgba(200, 240, 200, 0.8)' }}
                      placeholder="••••••••"
                      disabled={isLoading}
                    />
                  </div>

                  {/* Remember Me & Forgot Password */}
                  <div className="flex items-center justify-between gap-4 -mt-1">
                    <label className="flex items-center gap-2.5 cursor-pointer group flex-1">
                      <div className="relative flex items-center justify-center">
                        <input
                          type="checkbox"
                          checked={rememberMe}
                          onChange={(e) => setRememberMe(e.target.checked)}
                          className="peer w-[18px] h-[18px] rounded-md cursor-pointer appearance-none transition-all hover:border-[rgba(150,220,150,0.7)]"
                          style={{
                            border: '2px solid rgba(180, 220, 180, 0.45)',
                            backgroundColor: rememberMe ? 'rgba(120, 200, 120, 0.75)' : 'rgba(100, 180, 100, 0.18)',
                            boxShadow: rememberMe 
                              ? '0 0 12px rgba(120, 200, 120, 0.4), inset 0 1px 2px rgba(0, 0, 0, 0.2)'
                              : '0 2px 4px rgba(0, 0, 0, 0.15), inset 0 1px 2px rgba(255, 255, 255, 0.08)',
                          }}
                          disabled={isLoading}
                        />
                        {rememberMe && (
                          <svg
                            className="absolute w-3.5 h-3.5 pointer-events-none"
                            style={{ color: 'rgba(240, 255, 240, 0.98)', filter: 'drop-shadow(0 1px 1px rgba(0,0,0,0.3))' }}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            strokeWidth="3.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        )}
                      </div>
                      <span 
                        className="text-sm select-none transition-all leading-tight"
                        style={{ 
                          color: rememberMe ? 'rgba(210, 245, 210, 0.85)' : 'rgba(190, 230, 190, 0.65)',
                          textShadow: '0 1px 2px rgba(0, 0, 0, 0.4)',
                        }}
                      >
                        Remember me
                      </span>
                    </label>

                    <Link 
                      href="/reset" 
                      className="text-sm hover:brightness-110 transition-all leading-tight whitespace-nowrap"
                      style={{ 
                        color: 'rgba(190, 230, 190, 0.65)',
                        textShadow: '0 1px 2px rgba(0, 0, 0, 0.4)',
                      }}
                    >
                      Forgot password?
                    </Link>
                  </div>

                  {/* Error Message */}
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm text-center"
                    >
                      {error}
                    </motion.div>
                  )}

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
                    {isLoading ? 'Signing in...' : 'Sign In'}
                  </motion.button>
                </form>
              </GameCardContent>
            </GameCard>
          </motion.div>

          {/* Sign Up Link */}
          <motion.div
            className="text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <p className="text-sm" style={{ color: 'rgba(200, 240, 200, 0.7)' }}>
              Don't have an account?{' '}
              <Link 
                href="/register" 
                className="font-semibold hover:underline transition-all"
                style={{ color: 'rgba(200, 240, 200, 0.95)' }}
              >
                Sign up
              </Link>
            </p>
          </motion.div>

          {/* Back to Home */}
          <motion.div
            className="text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.7 }}
          >
            <Link 
              href="/" 
              className="text-xs hover:underline transition-all"
              style={{ color: 'rgba(200, 240, 200, 0.5)' }}
            >
              ← Back to home
            </Link>
          </motion.div>
        </div>
      </motion.main>
    </div>
  );
}
