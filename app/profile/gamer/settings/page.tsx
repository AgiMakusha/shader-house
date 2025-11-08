"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

import Particles from "@/components/fx/Particles";
import { GameCard, GameCardContent } from "@/components/game/GameCard";

export default function GamerSettingsPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSavingAccount, setIsSavingAccount] = useState(false);
  const [isSavingSecurity, setIsSavingSecurity] = useState(false);
  const [isSavingPreferences, setIsSavingPreferences] = useState(false);
  const [wantsNewsletter, setWantsNewsletter] = useState(true);
  const [showOnlineStatus, setShowOnlineStatus] = useState(true);
  const [wantsDigestNewsletter, setWantsDigestNewsletter] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch("/api/auth/me");
        if (!response.ok) {
          router.push("/login");
          return;
        }
        const data = await response.json();
        setUser(data.user);
      } catch (error) {
        console.error("Error fetching user:", error);
        router.push("/login");
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
  }, [router]);

  const membershipDetails = {
    plan: "Basic Membership",
    price: "5€ / month",
    status: "Active",
    renews: "Renews monthly",
    startedAt: "Member since",
  };

  const simulateSave = (setter: (value: boolean) => void) => {
    setter(true);
    setTimeout(() => setter(false), 900);
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
        className="relative z-10 flex min-h-dvh flex-col items-center justify-start p-6 pt-12"
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div
          className="w-full max-w-4xl mb-8 flex items-center justify-between gap-4"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div>
            <p className="text-xs uppercase tracking-[0.3em] pixelized" style={{ color: "rgba(200, 240, 200, 0.6)" }}>
              Settings
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
              Gamer Settings
            </h1>
            <p
              className="mt-2 text-sm pixelized"
              style={{ color: "rgba(200, 240, 200, 0.65)", textShadow: "1px 1px 0px rgba(0, 0, 0, 0.8)" }}
            >
              Tune your profile, security, and play preferences here.
            </p>
          </div>

          <Link
            href="/profile/gamer"
            className="text-xs font-semibold uppercase tracking-[0.2em] hover:underline transition-all"
            style={{ color: "rgba(200, 240, 200, 0.75)" }}
          >
            ← Back to Profile
          </Link>
        </motion.div>

        <motion.div
          className="w-full max-w-4xl mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.25 }}
        >
          <GameCard>
            <GameCardContent className="p-8 space-y-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                <div className="space-y-2">
                  <p className="text-xs uppercase tracking-[0.3em] pixelized" style={{ color: "rgba(200, 240, 200, 0.6)" }}>
                    Membership
                  </p>
                  <h2
                    className="text-2xl font-bold pixelized"
                    style={{ textShadow: "0 0 8px rgba(120, 200, 120, 0.6), 1px 1px 0px rgba(0, 0, 0, 0.8)", color: "rgba(180, 220, 180, 0.95)" }}
                  >
                    {membershipDetails.plan}
                  </h2>
                  <p className="text-lg font-semibold pixelized" style={{ color: "rgba(150, 250, 150, 0.9)" }}>
                    {membershipDetails.price}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-1">
                  <div>
                    <p className="text-sm font-medium mb-1" style={{ color: "rgba(200, 240, 200, 0.6)" }}>
                      Status
                    </p>
                    <p className="text-base font-semibold" style={{ color: "rgba(150, 250, 150, 0.95)" }}>
                      ✓ {membershipDetails.status}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium mb-1" style={{ color: "rgba(200, 240, 200, 0.6)" }}>
                      Billing
                    </p>
                    <p className="text-base font-semibold" style={{ color: "rgba(200, 240, 200, 0.9)" }}>
                      {membershipDetails.renews}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium mb-1" style={{ color: "rgba(200, 240, 200, 0.6)" }}>
                      {membershipDetails.startedAt}
                    </p>
                    <p className="text-base font-semibold" style={{ color: "rgba(200, 240, 200, 0.9)" }}>
                      {new Date().toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium mb-1" style={{ color: "rgba(200, 240, 200, 0.6)" }}>
                      Manage Plan
                    </p>
                    <Link
                      href="/membership"
                      className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-wide"
                      style={{ color: "rgba(150, 250, 150, 0.9)" }}
                    >
                      Update membership →
                    </Link>
                  </div>
                </div>
              </div>
            </GameCardContent>
          </GameCard>
        </motion.div>

        <motion.div
          className="w-full max-w-4xl mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.27 }}
        >
          <GameCard>
            <GameCardContent className="p-8 space-y-6">
              <h2
                className="text-2xl font-bold mb-4 pixelized"
                style={{ textShadow: "0 0 8px rgba(120, 200, 120, 0.6), 1px 1px 0px rgba(0, 0, 0, 0.8)", color: "rgba(180, 220, 180, 0.95)" }}
              >
                Profile Overview
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium mb-1" style={{ color: "rgba(200, 240, 200, 0.6)" }}>
                    Email
                  </p>
                  <p className="text-base font-semibold" style={{ color: "rgba(200, 240, 200, 0.9)" }}>
                    {user?.email}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium mb-1" style={{ color: "rgba(200, 240, 200, 0.6)" }}>
                    Role
                  </p>
                  <p className="text-base font-semibold" style={{ color: "rgba(200, 240, 200, 0.9)" }}>
                    {user?.role}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium mb-1" style={{ color: "rgba(200, 240, 200, 0.6)" }}>
                    Member Since
                  </p>
                  <p className="text-base font-semibold" style={{ color: "rgba(200, 240, 200, 0.9)" }}>
                    {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium mb-1" style={{ color: "rgba(200, 240, 200, 0.6)" }}>
                    Account Status
                  </p>
                  <p className="text-base font-semibold" style={{ color: "rgba(150, 250, 150, 0.95)" }}>
                    ✓ Active
                  </p>
                </div>
              </div>
            </GameCardContent>
          </GameCard>
        </motion.div>

        <motion.div
          className="w-full max-w-4xl mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <GameCard>
            <GameCardContent className="p-8 space-y-6">
              <h2
                className="text-2xl font-bold pixelized"
                style={{ textShadow: "0 0 8px rgba(120, 200, 120, 0.6), 1px 1px 0px rgba(0, 0, 0, 0.8)", color: "rgba(180, 220, 180, 0.95)" }}
              >
                Account Information
              </h2>

              <form onSubmit={(event) => { event.preventDefault(); simulateSave(setIsSavingAccount); }} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <label className="space-y-2">
                    <span className="text-sm font-medium" style={{ color: "rgba(200, 240, 200, 0.7)" }}>
                      Display Name
                    </span>
                    <input
                      type="text"
                      placeholder="ShaderGamer"
                      className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 focus:outline-none focus:ring-2 focus:ring-white/40 transition-all backdrop-blur-sm"
                      style={{ color: "rgba(200, 240, 200, 0.85)" }}
                    />
                  </label>

                  <label className="space-y-2">
                    <span className="text-sm font-medium" style={{ color: "rgba(200, 240, 200, 0.7)" }}>
                      Contact Email
                    </span>
                    <input
                      type="email"
                      placeholder="you@example.com"
                      className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 focus:outline-none focus:ring-2 focus:ring-white/40 transition-all backdrop-blur-sm"
                      style={{ color: "rgba(200, 240, 200, 0.85)" }}
                    />
                  </label>
                </div>

                <label className="space-y-2">
                  <span className="text-sm font-medium" style={{ color: "rgba(200, 240, 200, 0.7)" }}>
                    Bio
                  </span>
                  <textarea
                    rows={4}
                    placeholder="Share your favourite playstyle, current goals, or anything else other gamers should know."
                    className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 focus:outline-none focus:ring-2 focus:ring-white/40 transition-all backdrop-blur-sm resize-none"
                    style={{ color: "rgba(200, 240, 200, 0.85)" }}
                  />
                </label>

                <motion.button
                  type="submit"
                  disabled={isSavingAccount}
                  className="px-6 py-3 rounded-lg font-semibold uppercase tracking-wider transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{
                    background: "linear-gradient(135deg, rgba(100, 200, 100, 0.35) 0%, rgba(80, 180, 80, 0.2) 100%)",
                    border: "1px solid rgba(200, 240, 200, 0.3)",
                    color: "rgba(200, 240, 200, 0.95)",
                    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.3)",
                  }}
                  whileHover={!isSavingAccount ? { scale: 1.02 } : {}}
                  whileTap={!isSavingAccount ? { scale: 0.98 } : {}}
                >
                  {isSavingAccount ? "Saving..." : "Save Account"}
                </motion.button>
              </form>
            </GameCardContent>
          </GameCard>
        </motion.div>


        <motion.div
          className="w-full max-w-4xl mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <GameCard>
            <GameCardContent className="p-8 space-y-6">
              <h2
                className="text-2xl font-bold pixelized"
                style={{ textShadow: "0 0 8px rgba(120, 200, 120, 0.6), 1px 1px 0px rgba(0, 0, 0, 0.8)", color: "rgba(180, 220, 180, 0.95)" }}
              >
                Security
              </h2>

              <form onSubmit={(event) => { event.preventDefault(); simulateSave(setIsSavingSecurity); }} className="space-y-6">
                <label className="space-y-2">
                  <span className="text-sm font-medium" style={{ color: "rgba(200, 240, 200, 0.7)" }}>
                    Current Password
                  </span>
                  <input
                    type="password"
                    placeholder="••••••••"
                    className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 focus:outline-none focus:ring-2 focus:ring-white/40 transition-all backdrop-blur-sm"
                    style={{ color: "rgba(200, 240, 200, 0.85)" }}
                  />
                </label>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <label className="space-y-2">
                    <span className="text-sm font-medium" style={{ color: "rgba(200, 240, 200, 0.7)" }}>
                      New Password
                    </span>
                    <input
                      type="password"
                      placeholder="Choose something strong"
                      className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 focus:outline-none focus:ring-2 focus:ring-white/40 transition-all backdrop-blur-sm"
                      style={{ color: "rgba(200, 240, 200, 0.85)" }}
                    />
                  </label>

                  <label className="space-y-2">
                    <span className="text-sm font-medium" style={{ color: "rgba(200, 240, 200, 0.7)" }}>
                      Confirm Password
                    </span>
                    <input
                      type="password"
                      placeholder="Retype new password"
                      className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 focus:outline-none focus:ring-2 focus:ring-white/40 transition-all backdrop-blur-sm"
                      style={{ color: "rgba(200, 240, 200, 0.85)" }}
                    />
                  </label>
                </div>

                <motion.button
                  type="submit"
                  disabled={isSavingSecurity}
                  className="px-6 py-3 rounded-lg font-semibold uppercase tracking-wider transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{
                    background: "linear-gradient(135deg, rgba(100, 200, 100, 0.35) 0%, rgba(80, 180, 80, 0.2) 100%)",
                    border: "1px solid rgba(200, 240, 200, 0.3)",
                    color: "rgba(200, 240, 200, 0.95)",
                    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.3)",
                  }}
                  whileHover={!isSavingSecurity ? { scale: 1.02 } : {}}
                  whileTap={!isSavingSecurity ? { scale: 0.98 } : {}}
                >
                  {isSavingSecurity ? "Updating..." : "Update Password"}
                </motion.button>
              </form>
            </GameCardContent>
          </GameCard>
        </motion.div>

        <motion.div
          className="w-full max-w-4xl mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <GameCard>
            <GameCardContent className="p-8 space-y-6">
              <h2
                className="text-2xl font-bold pixelized"
                style={{ textShadow: "0 0 8px rgba(120, 200, 120, 0.6), 1px 1px 0px rgba(0, 0, 0, 0.8)", color: "rgba(180, 220, 180, 0.95)" }}
              >
                Preferences
              </h2>

              <form onSubmit={(event) => { event.preventDefault(); simulateSave(setIsSavingPreferences); }} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <div className="relative flex items-center justify-center">
                      <input
                        type="checkbox"
                        checked={wantsNewsletter}
                        onChange={(event) => setWantsNewsletter(event.target.checked)}
                        className="peer w-[18px] h-[18px] rounded-md cursor-pointer appearance-none transition-all"
                        style={{
                          border: "2px solid rgba(180, 220, 180, 0.45)",
                          backgroundColor: wantsNewsletter ? "rgba(120, 200, 120, 0.75)" : "rgba(100, 180, 100, 0.18)",
                          boxShadow: wantsNewsletter
                            ? "0 0 12px rgba(120, 200, 120, 0.4), inset 0 1px 2px rgba(0, 0, 0, 0.2)"
                            : "0 2px 4px rgba(0, 0, 0, 0.15), inset 0 1px 2px rgba(255, 255, 255, 0.08)",
                        }}
                      />
                      {wantsNewsletter && (
                        <svg
                          className="absolute w-3.5 h-3.5 pointer-events-none"
                          style={{ color: "rgba(240, 255, 240, 0.98)", filter: "drop-shadow(0 1px 1px rgba(0,0,0,0.3))" }}
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
                      className="text-sm leading-relaxed select-none"
                      style={{ color: "rgba(200, 240, 200, 0.75)", textShadow: "0 1px 2px rgba(0, 0, 0, 0.4)" }}
                    >
                      Email me when new membership rewards are available
                    </span>
                  </label>

                  <label className="flex items-start gap-3 cursor-pointer">
                    <div className="relative flex items-center justify-center">
                      <input
                        type="checkbox"
                        checked={showOnlineStatus}
                        onChange={(event) => setShowOnlineStatus(event.target.checked)}
                        className="peer w-[18px] h-[18px] rounded-md cursor-pointer appearance-none transition-all"
                        style={{
                          border: "2px solid rgba(180, 220, 180, 0.45)",
                          backgroundColor: showOnlineStatus ? "rgba(120, 200, 120, 0.75)" : "rgba(100, 180, 100, 0.18)",
                          boxShadow: showOnlineStatus
                            ? "0 0 12px rgba(120, 200, 120, 0.4), inset 0 1px 2px rgba(0, 0, 0, 0.2)"
                            : "0 2px 4px rgba(0, 0, 0, 0.15), inset 0 1px 2px rgba(255, 255, 255, 0.08)",
                        }}
                      />
                      {showOnlineStatus && (
                        <svg
                          className="absolute w-3.5 h-3.5 pointer-events-none"
                          style={{ color: "rgba(240, 255, 240, 0.98)", filter: "drop-shadow(0 1px 1px rgba(0,0,0,0.3))" }}
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
                      className="text-sm leading-relaxed select-none"
                      style={{ color: "rgba(200, 240, 200, 0.75)", textShadow: "0 1px 2px rgba(0, 0, 0, 0.4)" }}
                    >
                      Allow friends to see when I am online
                    </span>
                  </label>

                  <label className="flex items-start gap-3 cursor-pointer">
                    <div className="relative flex items-center justify-center">
                      <input
                        type="checkbox"
                        checked={wantsDigestNewsletter}
                        onChange={(event) => setWantsDigestNewsletter(event.target.checked)}
                        className="peer w-[18px] h-[18px] rounded-md cursor-pointer appearance-none transition-all"
                        style={{
                          border: "2px solid rgba(180, 220, 180, 0.45)",
                          backgroundColor: wantsDigestNewsletter ? "rgba(120, 200, 120, 0.75)" : "rgba(100, 180, 100, 0.18)",
                          boxShadow: wantsDigestNewsletter
                            ? "0 0 12px rgba(120, 200, 120, 0.4), inset 0 1px 2px rgba(0, 0, 0, 0.2)"
                            : "0 2px 4px rgba(0, 0, 0, 0.15), inset 0 1px 2px rgba(255, 255, 255, 0.08)",
                        }}
                      />
                      {wantsDigestNewsletter && (
                        <svg
                          className="absolute w-3.5 h-3.5 pointer-events-none"
                          style={{ color: "rgba(240, 255, 240, 0.98)", filter: "drop-shadow(0 1px 1px rgba(0,0,0,0.3))" }}
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
                      className="text-sm leading-relaxed select-none"
                      style={{ color: "rgba(200, 240, 200, 0.75)", textShadow: "0 1px 2px rgba(0, 0, 0, 0.4)" }}
                    >
                      Sign me up for the bi-monthly Shader House digest newsletter
                    </span>
                  </label>
                </div>

                <label className="space-y-2">
                  <span className="text-sm font-medium" style={{ color: "rgba(200, 240, 200, 0.7)" }}>
                    Status Message
                  </span>
                  <input
                    type="text"
                    placeholder="Exploring the forest tonight..."
                    className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 focus:outline-none focus:ring-2 focus:ring-white/40 transition-all backdrop-blur-sm"
                    style={{ color: "rgba(200, 240, 200, 0.85)" }}
                  />
                </label>

                <motion.button
                  type="submit"
                  disabled={isSavingPreferences}
                  className="px-6 py-3 rounded-lg font-semibold uppercase tracking-wider transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{
                    background: "linear-gradient(135deg, rgba(100, 200, 100, 0.35) 0%, rgba(80, 180, 80, 0.2) 100%)",
                    border: "1px solid rgba(200, 240, 200, 0.3)",
                    color: "rgba(200, 240, 200, 0.95)",
                    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.3)",
                  }}
                  whileHover={!isSavingPreferences ? { scale: 1.02 } : {}}
                  whileTap={!isSavingPreferences ? { scale: 0.98 } : {}}
                >
                  {isSavingPreferences ? "Saving..." : "Save Preferences"}
                </motion.button>
              </form>
            </GameCardContent>
          </GameCard>
        </motion.div>
      </motion.main>
    </div>
  );
}
