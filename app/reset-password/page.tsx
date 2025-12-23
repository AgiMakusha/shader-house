"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect, Suspense } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { Lock, Eye, EyeOff, CheckCircle, AlertTriangle, ArrowLeft, ShieldCheck } from "lucide-react";
import { GameCard, GameCardContent } from "@/components/game/GameCard";
import { GameIcon } from "@/components/game/GameIcon";
import { GameHouse } from "@/components/icons";
import Particles from "@/components/fx/Particles";
import { PasswordStrength } from "@/components/auth/PasswordStrength";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(true);
  const [isTokenValid, setIsTokenValid] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState("");

  // Verify token on mount
  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        setIsVerifying(false);
        setError("No reset token provided. Please request a new password reset link.");
        return;
      }

      try {
        const response = await fetch(`/api/auth/reset-password/verify?token=${encodeURIComponent(token)}`);
        const data = await response.json();

        if (data.valid) {
          setIsTokenValid(true);
          setUserEmail(data.email || '');
        } else {
          setError(data.error || "Invalid or expired reset link. Please request a new one.");
        }
      } catch (err) {
        console.error("Token verification error:", err);
        setError("Failed to verify reset link. Please try again.");
      } finally {
        setIsVerifying(false);
      }
    };

    verifyToken();
  }, [token]);

  const validateForm = () => {
    if (!password) {
      setError("Please enter a new password");
      return false;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters long");
      return false;
    }
    if (!confirmPassword) {
      setError("Please confirm your new password");
      return false;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/reset-password/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          password,
          confirmPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 429) {
          throw new Error(data.error || 'Too many attempts. Please try again later.');
        }
        throw new Error(data.error || 'Failed to reset password');
      }

      setIsSuccess(true);
      
      // Redirect to login after 3 seconds
      setTimeout(() => {
        router.push('/login');
      }, 3000);
    } catch (err: any) {
      console.error('Password reset error:', err);
      setError(err.message || 'An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Loading state while verifying token
  if (isVerifying) {
    return (
      <div className="min-h-dvh relative overflow-hidden flex items-center justify-center">
        <Particles />
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <div className="flex flex-col items-center gap-4">
            <div 
              className="w-16 h-16 rounded-full flex items-center justify-center animate-pulse"
              style={{
                background: 'rgba(100, 200, 100, 0.2)',
                border: '2px solid rgba(150, 240, 150, 0.4)',
              }}
            >
              <ShieldCheck size={32} style={{ color: 'rgba(150, 250, 150, 0.9)' }} />
            </div>
            <p className="text-lg font-semibold pixelized" style={{ color: 'rgba(200, 240, 200, 0.9)' }}>
              Verifying reset link...
            </p>
          </div>
        </motion.div>
      </div>
    );
  }

  // Invalid token state
  if (!isTokenValid && !isVerifying) {
    return (
      <div className="min-h-dvh relative overflow-hidden">
        <Particles />
        <motion.main 
          className="relative z-10 flex min-h-dvh flex-col items-center justify-center p-6"
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="w-full max-w-md space-y-6">
            <motion.div className="flex justify-center">
              <GameIcon size={80} glow rounded={false} aria-hidden>
                <GameHouse className="w-2/3 h-2/3 icon-ink" title="Shader House" />
              </GameIcon>
            </motion.div>

            <GameCard>
              <GameCardContent className="p-8 text-center space-y-4">
                <div 
                  className="w-16 h-16 rounded-full flex items-center justify-center mx-auto"
                  style={{
                    background: 'rgba(200, 100, 100, 0.2)',
                    border: '2px solid rgba(255, 150, 150, 0.4)',
                  }}
                >
                  <AlertTriangle size={32} style={{ color: 'rgba(255, 180, 180, 0.9)' }} />
                </div>
                <h1 
                  className="text-2xl font-bold pixelized"
                  style={{ color: 'rgba(255, 180, 180, 0.95)' }}
                >
                  Invalid Reset Link
                </h1>
                <p style={{ color: 'rgba(200, 240, 200, 0.7)' }}>
                  {error || "This password reset link is invalid or has expired."}
                </p>
                <Link 
                  href="/reset"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-semibold uppercase tracking-wider transition-all"
                  style={{
                    background: 'linear-gradient(135deg, rgba(100, 200, 100, 0.3) 0%, rgba(80, 180, 80, 0.2) 100%)',
                    border: '1px solid rgba(200, 240, 200, 0.3)',
                    color: 'rgba(200, 240, 200, 0.95)',
                  }}
                >
                  Request New Link
                </Link>
              </GameCardContent>
            </GameCard>
          </div>
        </motion.main>
      </div>
    );
  }

  // Success state
  if (isSuccess) {
    return (
      <div className="min-h-dvh relative overflow-hidden">
        <Particles />
        <motion.main 
          className="relative z-10 flex min-h-dvh flex-col items-center justify-center p-6"
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="w-full max-w-md space-y-6">
            <motion.div className="flex justify-center">
              <GameIcon size={80} glow rounded={false} aria-hidden>
                <GameHouse className="w-2/3 h-2/3 icon-ink" title="Shader House" />
              </GameIcon>
            </motion.div>

            <GameCard>
              <GameCardContent className="p-8 text-center space-y-4">
                <motion.div 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200, damping: 10 }}
                  className="w-16 h-16 rounded-full flex items-center justify-center mx-auto"
                  style={{
                    background: 'rgba(100, 200, 100, 0.2)',
                    border: '2px solid rgba(150, 240, 150, 0.4)',
                  }}
                >
                  <CheckCircle size={32} style={{ color: 'rgba(150, 250, 150, 0.9)' }} />
                </motion.div>
                <h1 
                  className="text-2xl font-bold pixelized"
                  style={{ 
                    color: 'rgba(150, 250, 150, 0.95)',
                    textShadow: '0 0 10px rgba(100, 200, 100, 0.6)'
                  }}
                >
                  Password Reset!
                </h1>
                <p style={{ color: 'rgba(200, 240, 200, 0.9)' }}>
                  Your password has been successfully reset.
                </p>
                <p className="text-sm" style={{ color: 'rgba(200, 240, 200, 0.7)' }}>
                  Redirecting you to login in a moment...
                </p>
                <Link 
                  href="/login"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-semibold uppercase tracking-wider transition-all"
                  style={{
                    background: 'linear-gradient(135deg, rgba(100, 200, 100, 0.3) 0%, rgba(80, 180, 80, 0.2) 100%)',
                    border: '1px solid rgba(200, 240, 200, 0.3)',
                    color: 'rgba(200, 240, 200, 0.95)',
                  }}
                >
                  Go to Login Now
                </Link>
              </GameCardContent>
            </GameCard>
          </div>
        </motion.main>
      </div>
    );
  }

  // Main form
  return (
    <div className="min-h-dvh relative overflow-hidden">
      <Particles />
      
      <motion.main 
        className="relative z-10 flex min-h-dvh flex-col items-center justify-center p-6"
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
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
              New Password
            </h1>
            {userEmail && (
              <p
                className="text-sm font-semibold tracking-wide pixelized"
                style={{
                  textShadow: '1px 1px 0px rgba(0, 0, 0, 0.8)',
                  color: 'rgba(200, 240, 200, 0.7)',
                }}
              >
                for {userEmail}
              </p>
            )}
          </motion.div>

          {/* Reset Form Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <GameCard>
              <GameCardContent className="p-8">
                <form onSubmit={handleSubmit} noValidate className="space-y-6">
                  {/* New Password Field */}
                  <div className="space-y-2">
                    <label 
                      htmlFor="password" 
                      className="block text-sm font-medium"
                      style={{ color: 'rgba(200, 240, 200, 0.9)' }}
                    >
                      New Password
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Lock size={18} style={{ color: 'rgba(200, 240, 200, 0.5)' }} />
                      </div>
                      <input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => {
                          setPassword(e.target.value);
                          if (error) setError("");
                        }}
                        className="w-full pl-10 pr-12 py-3 rounded-lg bg-white/10 border border-white/20 placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/40 focus:border-transparent transition-all backdrop-blur-sm"
                        style={{ color: 'rgba(200, 240, 200, 0.8)' }}
                        placeholder="Enter new password"
                        disabled={isLoading}
                        autoComplete="new-password"
                        minLength={8}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        style={{ color: 'rgba(200, 240, 200, 0.5)' }}
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                    <PasswordStrength password={password} />
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
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Lock size={18} style={{ color: 'rgba(200, 240, 200, 0.5)' }} />
                      </div>
                      <input
                        id="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => {
                          setConfirmPassword(e.target.value);
                          if (error) setError("");
                        }}
                        className={`w-full pl-10 pr-12 py-3 rounded-lg bg-white/10 border placeholder-white/40 focus:outline-none focus:ring-2 focus:border-transparent transition-all backdrop-blur-sm ${
                          confirmPassword && password !== confirmPassword
                            ? 'border-red-500/50 focus:ring-red-500/40' 
                            : 'border-white/20 focus:ring-white/40'
                        }`}
                        style={{ color: 'rgba(200, 240, 200, 0.8)' }}
                        placeholder="Confirm new password"
                        disabled={isLoading}
                        autoComplete="new-password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        style={{ color: 'rgba(200, 240, 200, 0.5)' }}
                      >
                        {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                    {confirmPassword && password !== confirmPassword && (
                      <p 
                        className="text-xs mt-1"
                        style={{ color: 'rgba(255, 180, 180, 0.9)' }}
                      >
                        Passwords do not match
                      </p>
                    )}
                  </div>

                  {/* Error Message */}
                  {error && (
                    <motion.div 
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center gap-2 p-3 rounded-lg"
                      style={{
                        background: 'rgba(180, 60, 60, 0.15)',
                        border: '1px solid rgba(255, 120, 120, 0.3)',
                        color: 'rgba(255, 180, 180, 0.95)',
                      }}
                    >
                      <AlertTriangle size={16} />
                      <span className="text-sm">{error}</span>
                    </motion.div>
                  )}

                  {/* Submit Button */}
                  <motion.button
                    type="submit"
                    disabled={isLoading || !password || !confirmPassword || password !== confirmPassword}
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
                        Resetting...
                      </>
                    ) : (
                      <>
                        <ShieldCheck size={18} />
                        Reset Password
                      </>
                    )}
                  </motion.button>
                </form>
              </GameCardContent>
            </GameCard>
          </motion.div>

          {/* Back to Login */}
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
        </div>
      </motion.main>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-dvh relative overflow-hidden flex items-center justify-center">
        <Particles />
        <div className="text-center">
          <p className="text-lg font-semibold pixelized" style={{ color: 'rgba(200, 240, 200, 0.9)' }}>
            Loading...
          </p>
        </div>
      </div>
    }>
      <ResetPasswordForm />
    </Suspense>
  );
}

