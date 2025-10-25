"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import { GameCard, GameCardContent } from "@/components/game/GameCard";
import { GameIcon } from "@/components/game/GameIcon";
import { BuildTools, GameController } from "@/components/icons";
import Particles from "@/components/fx/Particles";
import { PasswordStrength } from "@/components/auth/PasswordStrength";
import { useAudio } from "@/components/audio/AudioProvider";

export default function SignupPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { play } = useAudio();
  
  // Get role from URL params (e.g., /signup?role=developer)
  const defaultRole = (searchParams.get("role") as "developer" | "gamer") || "developer";
  
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState<"developer" | "gamer">(defaultRole);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const validateFields = () => {
    const newErrors: Record<string, string> = {};
    
    if (!name.trim()) {
      newErrors.name = "Your name helps us know you better";
    } else if (name.trim().length < 2) {
      newErrors.name = "Name should be at least 2 characters";
    }
    
    if (!email.trim()) {
      newErrors.email = "Your email is needed to create an account";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Please enter a valid email address";
    }
    
    if (!password) {
      newErrors.password = "A password is required to secure your account";
    } else if (password.length < 8) {
      newErrors.password = "Password should be at least 8 characters long";
    }
    
    if (!confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = "Passwords don't match - please try again";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    
    // Validate fields first
    if (!validateFields()) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, confirmPassword, role }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Handle validation errors
        if (data.details) {
          const fieldErrors: Record<string, string> = {};
          if (data.details.fieldErrors) {
            Object.entries(data.details.fieldErrors).forEach(([field, messages]) => {
              if (Array.isArray(messages) && messages.length > 0) {
                fieldErrors[field] = messages[0];
              }
            });
          }
          setErrors(fieldErrors);
        } else {
          setErrors({ general: data.error || "Registration failed" });
        }
        setIsLoading(false);
        return;
      }

      // Success! Play sound and redirect
      play("door");
      
      // Redirect based on role
      setTimeout(() => {
        if (role === "developer") {
          router.push("/register/developer");
        } else {
          router.push("/register/gamer");
        }
      }, 300);

    } catch (err) {
      console.error("Registration error:", err);
      setErrors({ general: "An unexpected error occurred" });
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-dvh relative overflow-hidden">
      <Particles />
      
      <motion.main 
        className="relative z-10 flex min-h-dvh flex-col items-center justify-center p-6 py-12"
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
            <GameIcon size={72} glow rounded={false} aria-hidden>
              {role === "developer" ? (
                <BuildTools className="w-2/3 h-2/3 icon-ink" title="Developer" />
              ) : (
                <GameController className="w-3/4 h-3/4 icon-ink" title="Gamer" />
              )}
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
              Create Account
            </h1>
            <p
              className="text-sm font-semibold tracking-wide uppercase pixelized"
              style={{
                textShadow: '1px 1px 0px rgba(0, 0, 0, 0.8)',
                color: 'rgba(200, 240, 200, 0.8)',
              }}
            >
              Join as {role === "developer" ? "a developer" : "a gamer"}
            </p>
          </motion.div>

          {/* Signup Form Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <GameCard>
              <GameCardContent className="p-8">
                <form onSubmit={handleSubmit} noValidate className="space-y-5">
                  {/* Name Field */}
                  <div className="space-y-2">
                    <label 
                      htmlFor="name" 
                      className="block text-sm font-medium"
                      style={{ color: 'rgba(200, 240, 200, 0.9)' }}
                    >
                      Name
                    </label>
                    <input
                      id="name"
                      type="text"
                      value={name}
                      onChange={(e) => {
                        setName(e.target.value);
                        if (errors.name) setErrors(prev => ({ ...prev, name: undefined }));
                      }}
                      className={`w-full px-4 py-3 rounded-lg bg-white/10 border placeholder-white/40 focus:outline-none focus:ring-2 focus:border-transparent transition-all backdrop-blur-sm ${
                        errors.name ? 'border-red-500/50 focus:ring-red-500/40' : 'border-white/20 focus:ring-white/40'
                      }`}
                      style={{ color: 'rgba(200, 240, 200, 0.8)' }}
                      placeholder="Your name"
                      disabled={isLoading}
                    />
                    {errors.name && (
                      <motion.p 
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-xs mt-1.5 px-1"
                        style={{ 
                          color: 'rgba(255, 180, 180, 0.9)',
                          textShadow: '0 1px 2px rgba(0, 0, 0, 0.6)'
                        }}
                      >
                        {errors.name}
                      </motion.p>
                    )}
                  </div>

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
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (errors.email) setErrors(prev => ({ ...prev, email: undefined }));
                      }}
                      className={`w-full px-4 py-3 rounded-lg bg-white/10 border placeholder-white/40 focus:outline-none focus:ring-2 focus:border-transparent transition-all backdrop-blur-sm ${
                        errors.email ? 'border-red-500/50 focus:ring-red-500/40' : 'border-white/20 focus:ring-white/40'
                      }`}
                      style={{ color: 'rgba(200, 240, 200, 0.8)' }}
                      placeholder="your@email.com"
                      disabled={isLoading}
                    />
                    {errors.email && (
                      <motion.p 
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-xs mt-1.5 px-1"
                        style={{ 
                          color: 'rgba(255, 180, 180, 0.9)',
                          textShadow: '0 1px 2px rgba(0, 0, 0, 0.6)'
                        }}
                      >
                        {errors.email}
                      </motion.p>
                    )}
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
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        if (errors.password) setErrors(prev => ({ ...prev, password: undefined }));
                      }}
                      className={`w-full px-4 py-3 rounded-lg bg-white/10 border placeholder-white/40 focus:outline-none focus:ring-2 focus:border-transparent transition-all backdrop-blur-sm ${
                        errors.password ? 'border-red-500/50 focus:ring-red-500/40' : 'border-white/20 focus:ring-white/40'
                      }`}
                      style={{ color: 'rgba(200, 240, 200, 0.8)' }}
                      placeholder="••••••••"
                      disabled={isLoading}
                    />
                    {errors.password && (
                      <motion.p 
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-xs mt-1.5 px-1"
                        style={{ 
                          color: 'rgba(255, 180, 180, 0.9)',
                          textShadow: '0 1px 2px rgba(0, 0, 0, 0.6)'
                        }}
                      >
                        {errors.password}
                      </motion.p>
                    )}
                    
                    {/* Password Strength Indicator */}
                    <PasswordStrength password={password} className="mt-2" />
                  </div>

                  {/* Confirm Password Field */}
                  <div className="space-y-2">
                    <label 
                      htmlFor="confirmPassword" 
                      className="block text-sm font-medium"
                      style={{ color: 'rgba(200, 240, 200, 0.9)' }}
                    >
                      Confirm Password
                    </label>
                    <input
                      id="confirmPassword"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => {
                        setConfirmPassword(e.target.value);
                        if (errors.confirmPassword) setErrors(prev => ({ ...prev, confirmPassword: undefined }));
                      }}
                      className={`w-full px-4 py-3 rounded-lg bg-white/10 border placeholder-white/40 focus:outline-none focus:ring-2 focus:border-transparent transition-all backdrop-blur-sm ${
                        errors.confirmPassword ? 'border-red-500/50 focus:ring-red-500/40' : 'border-white/20 focus:ring-white/40'
                      }`}
                      style={{ color: 'rgba(200, 240, 200, 0.8)' }}
                      placeholder="••••••••"
                      disabled={isLoading}
                    />
                    {errors.confirmPassword && (
                      <motion.p 
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-xs mt-1.5 px-1"
                        style={{ 
                          color: 'rgba(255, 180, 180, 0.9)',
                          textShadow: '0 1px 2px rgba(0, 0, 0, 0.6)'
                        }}
                      >
                        {errors.confirmPassword}
                      </motion.p>
                    )}
                  </div>

                  {/* Role Selector */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium" style={{ color: 'rgba(200, 240, 200, 0.9)' }}>
                      I am a
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setRole("developer")}
                        disabled={isLoading}
                        className={`px-4 py-2.5 rounded-lg font-medium text-sm transition-all ${
                          role === "developer"
                            ? 'bg-white/20 border-2 border-white/40 text-white'
                            : 'bg-white/5 border border-white/20 text-white/60 hover:bg-white/10'
                        }`}
                      >
                        Developer
                      </button>
                      <button
                        type="button"
                        onClick={() => setRole("gamer")}
                        disabled={isLoading}
                        className={`px-4 py-2.5 rounded-lg font-medium text-sm transition-all ${
                          role === "gamer"
                            ? 'bg-white/20 border-2 border-white/40 text-white'
                            : 'bg-white/5 border border-white/20 text-white/60 hover:bg-white/10'
                        }`}
                      >
                        Gamer
                      </button>
                    </div>
                  </div>

                  {/* General Error Message */}
                  {errors.general && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-3 rounded-lg text-sm text-center"
                      style={{
                        background: 'rgba(180, 60, 60, 0.15)',
                        border: '1px solid rgba(255, 120, 120, 0.3)',
                        color: 'rgba(255, 180, 180, 0.95)',
                        textShadow: '0 1px 2px rgba(0, 0, 0, 0.6)',
                      }}
                    >
                      {errors.general}
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
                    {isLoading ? 'Creating Account...' : 'Create Account'}
                  </motion.button>
                </form>
              </GameCardContent>
            </GameCard>
          </motion.div>

          {/* Sign In Link */}
          <motion.div
            className="text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <p className="text-sm" style={{ color: 'rgba(200, 240, 200, 0.7)' }}>
              Already have an account?{' '}
              <Link 
                href="/login" 
                className="font-semibold hover:underline transition-all"
                style={{ color: 'rgba(200, 240, 200, 0.95)' }}
              >
                Sign in
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

