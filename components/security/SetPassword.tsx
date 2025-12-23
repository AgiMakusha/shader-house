"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { KeyRound, Info } from "lucide-react";
import { GameCard, GameCardContent } from "@/components/game/GameCard";
import { PasswordStrength } from "@/components/auth/PasswordStrength";

interface SetPasswordProps {
  onPasswordSet: () => void;
}

export function SetPassword({ onPasswordSet }: SetPasswordProps) {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    // Validation
    if (!newPassword || !confirmPassword) {
      setError('Both password fields are required');
      setIsLoading(false);
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }

    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters long');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/set-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          newPassword,
          confirmPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to set password');
      }

      setSuccess('Password set successfully! You can now unlink OAuth accounts if needed.');
      setNewPassword('');
      setConfirmPassword('');
      
      // Notify parent component to refresh user data
      onPasswordSet();
      
      // Clear success message after 5 seconds
      setTimeout(() => setSuccess(''), 5000);
    } catch (error: any) {
      console.error('Error setting password:', error);
      setError(error.message || 'Failed to set password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <GameCard>
      <GameCardContent className="p-8 space-y-6">
        <div className="flex items-center gap-3">
          <KeyRound size={24} style={{ color: "rgba(180, 220, 180, 0.9)" }} />
          <h2
            className="text-2xl font-bold pixelized"
            style={{
              textShadow: "0 0 8px rgba(120, 200, 120, 0.6), 1px 1px 0px rgba(0, 0, 0, 0.8)",
              color: "rgba(180, 220, 180, 0.95)",
            }}
          >
            Set Account Password
          </h2>
        </div>

        <div
          className="p-4 rounded-lg flex items-start gap-3"
          style={{
            background: "rgba(100, 180, 240, 0.15)",
            border: "1px solid rgba(100, 180, 240, 0.3)",
          }}
        >
          <Info size={18} style={{ color: "rgba(150, 200, 250, 0.9)", flexShrink: 0, marginTop: 2 }} />
          <div>
            <p className="text-sm font-medium" style={{ color: "rgba(180, 220, 250, 0.95)" }}>
              Add a backup sign-in method
            </p>
            <p className="text-xs mt-1" style={{ color: "rgba(180, 220, 250, 0.7)" }}>
              You signed up with an OAuth provider. Setting a password gives you an additional way to sign in and allows you to unlink OAuth accounts if needed.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <label className="space-y-2">
              <span className="text-sm font-medium" style={{ color: "rgba(200, 240, 200, 0.7)" }}>
                New Password
              </span>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Choose something strong"
                required
                minLength={8}
                className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 focus:outline-none focus:ring-2 focus:ring-white/40 transition-all backdrop-blur-sm"
                style={{ color: "rgba(200, 240, 200, 0.85)" }}
              />
              <PasswordStrength password={newPassword} />
            </label>

            <label className="space-y-2">
              <span className="text-sm font-medium" style={{ color: "rgba(200, 240, 200, 0.7)" }}>
                Confirm Password
              </span>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Retype your password"
                required
                minLength={8}
                className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 focus:outline-none focus:ring-2 focus:ring-white/40 transition-all backdrop-blur-sm"
                style={{ color: "rgba(200, 240, 200, 0.85)" }}
              />
            </label>
          </div>

          {error && (
            <div
              className="p-3 rounded-lg"
              style={{
                background: "rgba(180, 60, 60, 0.15)",
                border: "1px solid rgba(255, 120, 120, 0.3)",
                color: "rgba(255, 180, 180, 0.95)",
                textShadow: "0 1px 2px rgba(0, 0, 0, 0.6)",
                fontSize: "12px",
                fontFamily: '"Press Start 2P", monospace',
              }}
            >
              {error}
            </div>
          )}

          {success && (
            <div
              className="p-3 rounded-lg"
              style={{
                background: "rgba(100, 200, 100, 0.15)",
                border: "1px solid rgba(150, 240, 150, 0.3)",
                color: "rgba(180, 240, 180, 0.95)",
                textShadow: "0 1px 2px rgba(0, 0, 0, 0.6)",
                fontSize: "12px",
                fontFamily: '"Press Start 2P", monospace',
              }}
            >
              ✓ {success}
            </div>
          )}

          <motion.button
            type="submit"
            disabled={isLoading}
            className="px-6 py-3 rounded-lg font-semibold uppercase tracking-wider transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              background: "linear-gradient(135deg, rgba(100, 200, 100, 0.35) 0%, rgba(80, 180, 80, 0.2) 100%)",
              border: "1px solid rgba(200, 240, 200, 0.3)",
              color: "rgba(200, 240, 200, 0.95)",
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.3)",
            }}
            whileHover={!isLoading ? { scale: 1.02 } : {}}
            whileTap={!isLoading ? { scale: 0.98 } : {}}
          >
            {isLoading ? "Setting Password..." : "Set Password"}
          </motion.button>
        </form>
      </GameCardContent>
    </GameCard>
  );
}

