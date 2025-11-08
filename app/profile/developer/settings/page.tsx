"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

import Particles from "@/components/fx/Particles";
import { GameCard, GameCardContent } from "@/components/game/GameCard";

export default function DeveloperSettingsPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSavingAccount, setIsSavingAccount] = useState(false);
  const [isSavingStudio, setIsSavingStudio] = useState(false);
  const [isSavingSecurity, setIsSavingSecurity] = useState(false);
  const [isSavingCommunication, setIsSavingCommunication] = useState(false);
  const [acceptCollabRequests, setAcceptCollabRequests] = useState(true);
  const [receiveLaunchUpdates, setReceiveLaunchUpdates] = useState(true);

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
              Developer Settings
            </h1>
            <p
              className="mt-2 text-sm pixelized"
              style={{ color: "rgba(200, 240, 200, 0.65)", textShadow: "1px 1px 0px rgba(0, 0, 0, 0.8)" }}
            >
              Keep your studio information, security, and communication preferences up to date.
            </p>
          </div>

          <Link
            href="/profile/developer"
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
                {user?.developerProfile?.developerType && (
                  <div>
                    <p className="text-sm font-medium mb-1" style={{ color: "rgba(200, 240, 200, 0.6)" }}>
                      Developer Type
                    </p>
                    <p className="text-base font-semibold" style={{ color: "rgba(200, 240, 200, 0.9)" }}>
                      {user.developerProfile.developerType}
                    </p>
                  </div>
                )}
              </div>
            </GameCardContent>
          </GameCard>
        </motion.div>

        {user?.developerProfile && (
          <motion.div
            className="w-full max-w-4xl mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.27 }}
          >
            <GameCard>
              <GameCardContent className="p-8 space-y-6">
                <h2
                  className="text-2xl font-bold pixelized"
                  style={{ textShadow: "0 0 8px rgba(120, 200, 120, 0.6), 1px 1px 0px rgba(0, 0, 0, 0.8)", color: "rgba(180, 220, 180, 0.95)" }}
                >
                  Developer Details
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {user.developerProfile.teamSize !== null && (
                    <div>
                      <p className="text-sm font-medium mb-1" style={{ color: "rgba(200, 240, 200, 0.6)" }}>
                        Team Size
                      </p>
                      <p className="text-base font-semibold" style={{ color: "rgba(200, 240, 200, 0.9)" }}>
                        {user.developerProfile.teamSize}{" "}
                        {user.developerProfile.teamSize === 1 ? "person" : "people"}
                      </p>
                    </div>
                  )}

                  {user.developerProfile.hasPublisher !== null && (
                    <div>
                      <p className="text-sm font-medium mb-1" style={{ color: "rgba(200, 240, 200, 0.6)" }}>
                        Publisher
                      </p>
                      <p className="text-base font-semibold" style={{ color: "rgba(200, 240, 200, 0.9)" }}>
                        {user.developerProfile.hasPublisher ? "Yes" : "No"}
                      </p>
                    </div>
                  )}

                  {user.developerProfile.ownsIP !== null && (
                    <div>
                      <p className="text-sm font-medium mb-1" style={{ color: "rgba(200, 240, 200, 0.6)" }}>
                        Owns IP
                      </p>
                      <p className="text-base font-semibold" style={{ color: "rgba(200, 240, 200, 0.9)" }}>
                        {user.developerProfile.ownsIP ? "Yes" : "No"}
                      </p>
                    </div>
                  )}

                  {user.developerProfile.companyType && (
                    <div>
                      <p className="text-sm font-medium mb-1" style={{ color: "rgba(200, 240, 200, 0.6)" }}>
                        Company Type
                      </p>
                      <p className="text-base font-semibold" style={{ color: "rgba(200, 240, 200, 0.9)" }}>
                        {user.developerProfile.companyType.replace(/_/g, " ")}
                      </p>
                    </div>
                  )}

                  {user.developerProfile.isIndieEligible !== null && (
                    <div>
                      <p className="text-sm font-medium mb-1" style={{ color: "rgba(200, 240, 200, 0.6)" }}>
                        Indie Status
                      </p>
                      <p
                        className="text-base font-semibold"
                        style={{ color: user.developerProfile.isIndieEligible ? "rgba(150, 250, 150, 0.95)" : "rgba(250, 200, 150, 0.95)" }}
                      >
                        {user.developerProfile.isIndieEligible ? "✓ Indie Verified" : "⚠ Under Review"}
                      </p>
                    </div>
                  )}
                </div>
              </GameCardContent>
            </GameCard>
          </motion.div>
        )}

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
                      placeholder="Shader Dev"
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
                      placeholder="studio@example.com"
                      className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 focus:outline-none focus:ring-2 focus:ring-white/40 transition-all backdrop-blur-sm"
                      style={{ color: "rgba(200, 240, 200, 0.85)" }}
                    />
                  </label>
                </div>

                <label className="space-y-2">
                  <span className="text-sm font-medium" style={{ color: "rgba(200, 240, 200, 0.7)" }}>
                    Public Bio
                  </span>
                  <textarea
                    rows={4}
                    placeholder="Introduce your studio, favourite tools, or what you're building next."
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
          transition={{ duration: 0.6, delay: 0.35 }}
        >
          <GameCard>
            <GameCardContent className="p-8 space-y-6">
              <h2
                className="text-2xl font-bold pixelized"
                style={{ textShadow: "0 0 8px rgba(120, 200, 120, 0.6), 1px 1px 0px rgba(0, 0, 0, 0.8)", color: "rgba(180, 220, 180, 0.95)" }}
              >
                Studio Profile
              </h2>

              <form onSubmit={(event) => { event.preventDefault(); simulateSave(setIsSavingStudio); }} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <label className="space-y-2">
                    <span className="text-sm font-medium" style={{ color: "rgba(200, 240, 200, 0.7)" }}>
                      Studio Name
                    </span>
                    <input
                      type="text"
                      placeholder="Shader House Games"
                      className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 focus:outline-none focus:ring-2 focus:ring-white/40 transition-all backdrop-blur-sm"
                      style={{ color: "rgba(200, 240, 200, 0.85)" }}
                    />
                  </label>

                  <label className="space-y-2">
                    <span className="text-sm font-medium" style={{ color: "rgba(200, 240, 200, 0.7)" }}>
                      Team Size
                    </span>
                    <input
                      type="number"
                      min={0}
                      max={500}
                      placeholder="4"
                      className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 focus:outline-none focus:ring-2 focus:ring-white/40 transition-all backdrop-blur-sm"
                      style={{ color: "rgba(200, 240, 200, 0.85)" }}
                    />
                  </label>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <label className="space-y-2">
                    <span className="text-sm font-medium" style={{ color: "rgba(200, 240, 200, 0.7)" }}>
                      Primary Engine / Tools
                    </span>
                    <input
                      type="text"
                      placeholder="Unreal Engine, Blender, custom C++"
                      className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 focus:outline-none focus:ring-2 focus:ring-white/40 transition-all backdrop-blur-sm"
                      style={{ color: "rgba(200, 240, 200, 0.85)" }}
                    />
                  </label>

                  <label className="space-y-2">
                    <span className="text-sm font-medium" style={{ color: "rgba(200, 240, 200, 0.7)" }}>
                      Portfolio URL
                    </span>
                    <input
                      type="url"
                      placeholder="https://shaderhouse.com"
                      className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 focus:outline-none focus:ring-2 focus:ring-white/40 transition-all backdrop-blur-sm"
                      style={{ color: "rgba(200, 240, 200, 0.85)" }}
                    />
                  </label>
                </div>

                <label className="space-y-2">
                  <span className="text-sm font-medium" style={{ color: "rgba(200, 240, 200, 0.7)" }}>
                    Elevator Pitch
                  </span>
                  <textarea
                    rows={3}
                    placeholder="Summarise your studio, current focus, or what you're seeking from the Shader House community."
                    className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 focus:outline-none focus:ring-2 focus:ring-white/40 transition-all backdrop-blur-sm resize-none"
                    style={{ color: "rgba(200, 240, 200, 0.85)" }}
                  />
                </label>

                <motion.button
                  type="submit"
                  disabled={isSavingStudio}
                  className="px-6 py-3 rounded-lg font-semibold uppercase tracking-wider transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{
                    background: "linear-gradient(135deg, rgba(100, 200, 100, 0.35) 0%, rgba(80, 180, 80, 0.2) 100%)",
                    border: "1px solid rgba(200, 240, 200, 0.3)",
                    color: "rgba(200, 240, 200, 0.95)",
                    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.3)",
                  }}
                  whileHover={!isSavingStudio ? { scale: 1.02 } : {}}
                  whileTap={!isSavingStudio ? { scale: 0.98 } : {}}
                >
                  {isSavingStudio ? "Saving..." : "Save Studio Profile"}
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
          transition={{ duration: 0.6, delay: 0.45 }}
        >
          <GameCard>
            <GameCardContent className="p-8 space-y-6">
              <h2
                className="text-2xl font-bold pixelized"
                style={{ textShadow: "0 0 8px rgba(120, 200, 120, 0.6), 1px 1px 0px rgba(0, 0, 0, 0.8)", color: "rgba(180, 220, 180, 0.95)" }}
              >
                Communication Preferences
              </h2>

              <form onSubmit={(event) => { event.preventDefault(); simulateSave(setIsSavingCommunication); }} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <div className="relative flex items-center justify-center">
                      <input
                        type="checkbox"
                        checked={acceptCollabRequests}
                        onChange={(event) => setAcceptCollabRequests(event.target.checked)}
                        className="peer w-[18px] h-[18px] rounded-md cursor-pointer appearance-none transition-all"
                        style={{
                          border: "2px solid rgba(180, 220, 180, 0.45)",
                          backgroundColor: acceptCollabRequests ? "rgba(120, 200, 120, 0.75)" : "rgba(100, 180, 100, 0.18)",
                          boxShadow: acceptCollabRequests
                            ? "0 0 12px rgba(120, 200, 120, 0.4), inset 0 1px 2px rgba(0, 0, 0, 0.2)"
                            : "0 2px 4px rgba(0, 0, 0, 0.15), inset 0 1px 2px rgba(255, 255, 255, 0.08)",
                        }}
                      />
                      {acceptCollabRequests && (
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
                      Allow other studios to request collaboration introductions
                    </span>
                  </label>

                  <label className="flex items-start gap-3 cursor-pointer">
                    <div className="relative flex items-center justify-center">
                      <input
                        type="checkbox"
                        checked={receiveLaunchUpdates}
                        onChange={(event) => setReceiveLaunchUpdates(event.target.checked)}
                        className="peer w-[18px] h-[18px] rounded-md cursor-pointer appearance-none transition-all"
                        style={{
                          border: "2px solid rgba(180, 220, 180, 0.45)",
                          backgroundColor: receiveLaunchUpdates ? "rgba(120, 200, 120, 0.75)" : "rgba(100, 180, 100, 0.18)",
                          boxShadow: receiveLaunchUpdates
                            ? "0 0 12px rgba(120, 200, 120, 0.4), inset 0 1px 2px rgba(0, 0, 0, 0.2)"
                            : "0 2px 4px rgba(0, 0, 0, 0.15), inset 0 1px 2px rgba(255, 255, 255, 0.08)",
                        }}
                      />
                      {receiveLaunchUpdates && (
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
                      Receive shader house product updates and launch announcements
                    </span>
                  </label>
                </div>

                <label className="space-y-2">
                  <span className="text-sm font-medium" style={{ color: "rgba(200, 240, 200, 0.7)" }}>
                    Preferred Contact Notes
                  </span>
                  <textarea
                    rows={3}
                    placeholder="Let other studios know how to reach you, or any constraints around collaboration."
                    className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 focus:outline-none focus:ring-2 focus:ring-white/40 transition-all backdrop-blur-sm resize-none"
                    style={{ color: "rgba(200, 240, 200, 0.85)" }}
                  />
                </label>

                <motion.button
                  type="submit"
                  disabled={isSavingCommunication}
                  className="px-6 py-3 rounded-lg font-semibold uppercase tracking-wider transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{
                    background: "linear-gradient(135deg, rgba(100, 200, 100, 0.35) 0%, rgba(80, 180, 80, 0.2) 100%)",
                    border: "1px solid rgba(200, 240, 200, 0.3)",
                    color: "rgba(200, 240, 200, 0.95)",
                    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.3)",
                  }}
                  whileHover={!isSavingCommunication ? { scale: 1.02 } : {}}
                  whileTap={!isSavingCommunication ? { scale: 0.98 } : {}}
                >
                  {isSavingCommunication ? "Saving..." : "Save Communication Preferences"}
                </motion.button>
              </form>
            </GameCardContent>
          </GameCard>
        </motion.div>
      </motion.main>
    </div>
  );
}
