"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, AlertTriangle, Send, CheckCircle } from "lucide-react";
import { GameCard, GameCardContent } from "@/components/game/GameCard";

interface EmailChangeProps {
  currentEmail: string;
  hasPassword: boolean;
}

export function EmailChange({ currentEmail, hasPassword }: EmailChangeProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newEmail)) {
      setError("Please enter a valid email address");
      return;
    }

    if (newEmail.toLowerCase() === currentEmail.toLowerCase()) {
      setError("New email must be different from your current email");
      return;
    }

    if (!password) {
      setError("Password is required to change your email");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/email-change", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newEmail, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to initiate email change");
      }

      setSuccess("Verification email sent! Please check your new email inbox.");
      setNewEmail("");
      setPassword("");
      setIsEditing(false);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setNewEmail("");
    setPassword("");
    setError("");
  };

  return (
    <GameCard>
      <GameCardContent className="p-8 space-y-6">
        <div className="text-center">
          <div className="flex items-center justify-center gap-3 mb-2">
            <Mail size={24} style={{ color: "rgba(180, 220, 180, 0.9)" }} />
            <h2
              className="text-2xl font-bold pixelized"
              style={{
                textShadow: "0 0 8px rgba(120, 200, 120, 0.6), 1px 1px 0px rgba(0, 0, 0, 0.8)",
                color: "rgba(180, 220, 180, 0.95)",
              }}
            >
              Email Address
            </h2>
          </div>
          <p className="text-sm" style={{ color: "rgba(200, 240, 200, 0.65)" }}>
            Change your account email with verification
          </p>
        </div>

        {/* Current email display */}
        <div
          className="p-4 rounded-lg flex flex-col sm:flex-row items-center justify-center gap-4"
          style={{
            background: "rgba(255, 255, 255, 0.05)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
          }}
        >
          <div className="text-center sm:text-left">
            <p className="text-xs font-medium" style={{ color: "rgba(200, 240, 200, 0.6)" }}>
              Current Email
            </p>
            <p className="font-semibold" style={{ color: "rgba(200, 240, 200, 0.95)" }}>
              {currentEmail}
            </p>
          </div>
          
          {!isEditing && (
            <motion.button
              onClick={() => setIsEditing(true)}
              disabled={!hasPassword}
              className="px-4 py-2 rounded-lg text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
              style={{
                background: "rgba(100, 180, 100, 0.2)",
                border: "1px solid rgba(100, 180, 100, 0.3)",
                color: "rgba(180, 240, 180, 0.95)",
              }}
              whileHover={hasPassword ? { scale: 1.02 } : {}}
              whileTap={hasPassword ? { scale: 0.98 } : {}}
            >
              Change Email
            </motion.button>
          )}
        </div>

        {/* Warning if no password */}
        {!hasPassword && !isEditing && (
          <div
            className="p-4 rounded-lg flex items-start gap-3"
            style={{
              background: "rgba(240, 180, 60, 0.15)",
              border: "1px solid rgba(240, 180, 60, 0.3)",
            }}
          >
            <AlertTriangle size={20} style={{ color: "rgba(240, 200, 100, 0.95)", flexShrink: 0, marginTop: 2 }} />
            <p className="text-sm" style={{ color: "rgba(240, 220, 150, 0.95)" }}>
              You need to set a password before you can change your email address. 
              This is required for security verification.
            </p>
          </div>
        )}

        {/* Email change form */}
        {isEditing && (
          <motion.form
            onSubmit={handleSubmit}
            className="space-y-4"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <label className="block space-y-2">
              <span className="text-sm font-medium" style={{ color: "rgba(200, 240, 200, 0.7)" }}>
                New Email Address
              </span>
              <input
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="newemail@example.com"
                required
                className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 focus:outline-none focus:ring-2 focus:ring-white/40"
                style={{ color: "rgba(200, 240, 200, 0.85)" }}
              />
            </label>

            <label className="block space-y-2">
              <span className="text-sm font-medium" style={{ color: "rgba(200, 240, 200, 0.7)" }}>
                Current Password
              </span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password to confirm"
                required
                className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 focus:outline-none focus:ring-2 focus:ring-white/40"
                style={{ color: "rgba(200, 240, 200, 0.85)" }}
              />
            </label>

            <div
              className="p-3 rounded-lg flex items-start gap-3"
              style={{
                background: "rgba(100, 180, 240, 0.1)",
                border: "1px solid rgba(100, 180, 240, 0.2)",
              }}
            >
              <Send size={16} style={{ color: "rgba(140, 200, 255, 0.9)", flexShrink: 0, marginTop: 2 }} />
              <p className="text-xs" style={{ color: "rgba(180, 220, 255, 0.85)" }}>
                We'll send a verification link to your new email address. 
                Click it to confirm the change. Your current email will remain active until you verify the new one.
              </p>
            </div>

            <div className="flex gap-3">
              <motion.button
                type="button"
                onClick={handleCancel}
                className="flex-1 px-4 py-3 rounded-lg font-semibold uppercase tracking-wider"
                style={{
                  background: "rgba(255, 255, 255, 0.05)",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  color: "rgba(200, 240, 200, 0.8)",
                }}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
              >
                Cancel
              </motion.button>
              <motion.button
                type="submit"
                disabled={isLoading || !newEmail || !password}
                className="flex-1 px-4 py-3 rounded-lg font-semibold uppercase tracking-wider disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                style={{
                  background: "linear-gradient(135deg, rgba(100, 200, 100, 0.35) 0%, rgba(80, 180, 80, 0.2) 100%)",
                  border: "1px solid rgba(200, 240, 200, 0.3)",
                  color: "rgba(200, 240, 200, 0.95)",
                }}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
              >
                {isLoading ? "Sending..." : "Send Verification"}
              </motion.button>
            </div>
          </motion.form>
        )}

        {error && (
          <div
            className="p-3 rounded-lg"
            style={{
              background: "rgba(180, 60, 60, 0.15)",
              border: "1px solid rgba(255, 120, 120, 0.3)",
              color: "rgba(255, 180, 180, 0.95)",
              fontSize: "12px",
            }}
          >
            {error}
          </div>
        )}

        {success && (
          <div
            className="p-3 rounded-lg flex items-center gap-2"
            style={{
              background: "rgba(100, 200, 100, 0.15)",
              border: "1px solid rgba(150, 240, 150, 0.3)",
              color: "rgba(180, 240, 180, 0.95)",
              fontSize: "12px",
            }}
          >
            <CheckCircle size={16} />
            {success}
          </div>
        )}
      </GameCardContent>
    </GameCard>
  );
}

