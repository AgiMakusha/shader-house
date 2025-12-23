"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, ShieldCheck, ShieldOff, Copy, Check, Key, AlertTriangle } from "lucide-react";
import { GameCard, GameCardContent } from "@/components/game/GameCard";

interface TwoFactorSetupProps {
  isEnabled: boolean;
  hasPassword: boolean;
  onStatusChange: () => void;
}

export function TwoFactorSetup({ isEnabled, hasPassword, onStatusChange }: TwoFactorSetupProps) {
  const [step, setStep] = useState<'idle' | 'setup' | 'verify' | 'backup' | 'disable'>('idle');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  
  // Setup state
  const [secret, setSecret] = useState("");
  const [otpAuthUrl, setOtpAuthUrl] = useState("");
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [verificationCode, setVerificationCode] = useState("");
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  
  // Disable state
  const [disablePassword, setDisablePassword] = useState("");

  const startSetup = async () => {
    setIsLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/2fa/setup", { method: "POST" });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to start 2FA setup");
      }
      const data = await res.json();
      setSecret(data.secret);
      setOtpAuthUrl(data.otpAuthUrl);
      setBackupCodes(data.backupCodes);
      setStep('setup');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const verifyAndEnable = async () => {
    if (verificationCode.length !== 6) {
      setError("Please enter a 6-digit code");
      return;
    }

    setIsLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/2fa/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: verificationCode }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Invalid verification code");
      }
      setStep('backup');
      setSuccess("2FA enabled successfully!");
      onStatusChange();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const disable2FA = async () => {
    if (!disablePassword) {
      setError("Password is required");
      return;
    }

    setIsLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/2fa/disable", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: disablePassword }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to disable 2FA");
      }
      setSuccess("2FA disabled successfully");
      setStep('idle');
      setDisablePassword("");
      onStatusChange();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedCode(text);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const finishSetup = () => {
    setStep('idle');
    setSecret("");
    setOtpAuthUrl("");
    setBackupCodes([]);
    setVerificationCode("");
    setTimeout(() => setSuccess(""), 3000);
  };

  return (
    <GameCard>
      <GameCardContent className="p-8 space-y-6">
        <div className="text-center">
          <div className="flex items-center justify-center gap-3 mb-2">
            {isEnabled ? (
              <ShieldCheck size={24} style={{ color: "rgba(150, 250, 150, 0.9)" }} />
            ) : (
              <Shield size={24} style={{ color: "rgba(180, 220, 180, 0.9)" }} />
            )}
            <h2
              className="text-2xl font-bold pixelized"
              style={{
                textShadow: "0 0 8px rgba(120, 200, 120, 0.6), 1px 1px 0px rgba(0, 0, 0, 0.8)",
                color: "rgba(180, 220, 180, 0.95)",
              }}
            >
              Two-Factor Authentication
            </h2>
            {isEnabled && (
              <span
                className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider"
                style={{
                  background: "rgba(100, 200, 100, 0.2)",
                  color: "rgba(150, 255, 150, 0.95)",
                  border: "1px solid rgba(100, 200, 100, 0.4)",
                }}
              >
                Enabled
              </span>
            )}
          </div>
          <p className="text-sm" style={{ color: "rgba(200, 240, 200, 0.65)" }}>
            {isEnabled ? "Your account is protected with 2FA" : "Add an extra layer of security"}
          </p>
        </div>

        <AnimatePresence mode="wait">
          {step === 'idle' && (
            <motion.div
              key="idle"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              {!hasPassword && !isEnabled && (
                <div
                  className="p-4 rounded-lg flex items-start gap-3"
                  style={{
                    background: "rgba(240, 180, 60, 0.15)",
                    border: "1px solid rgba(240, 180, 60, 0.3)",
                  }}
                >
                  <AlertTriangle size={20} style={{ color: "rgba(240, 200, 100, 0.95)", flexShrink: 0, marginTop: 2 }} />
                  <p className="text-sm" style={{ color: "rgba(240, 220, 150, 0.95)" }}>
                    You need to set a password before enabling 2FA. This ensures you can disable 2FA if you lose access to your authenticator.
                  </p>
                </div>
              )}

              {isEnabled ? (
                <motion.button
                  onClick={() => setStep('disable')}
                  className="w-full px-6 py-3 rounded-lg font-semibold uppercase tracking-wider transition-all flex items-center justify-center gap-2"
                  style={{
                    background: "rgba(200, 80, 80, 0.2)",
                    border: "1px solid rgba(200, 80, 80, 0.3)",
                    color: "rgba(255, 180, 180, 0.95)",
                  }}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                >
                  <ShieldOff size={18} />
                  Disable Two-Factor Authentication
                </motion.button>
              ) : (
                <motion.button
                  onClick={startSetup}
                  disabled={isLoading || !hasPassword}
                  className="w-full px-6 py-3 rounded-lg font-semibold uppercase tracking-wider transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  style={{
                    background: "linear-gradient(135deg, rgba(100, 200, 100, 0.35) 0%, rgba(80, 180, 80, 0.2) 100%)",
                    border: "1px solid rgba(200, 240, 200, 0.3)",
                    color: "rgba(200, 240, 200, 0.95)",
                  }}
                  whileHover={hasPassword ? { scale: 1.01 } : {}}
                  whileTap={hasPassword ? { scale: 0.99 } : {}}
                >
                  <ShieldCheck size={18} />
                  {isLoading ? "Setting up..." : "Enable Two-Factor Authentication"}
                </motion.button>
              )}
            </motion.div>
          )}

          {step === 'setup' && (
            <motion.div
              key="setup"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div className="text-center space-y-4">
                <p className="text-sm" style={{ color: "rgba(200, 240, 200, 0.8)" }}>
                  Scan this QR code with your authenticator app (Google Authenticator, Authy, etc.)
                </p>
                
                {/* QR Code placeholder - in production use a proper QR library */}
                <div
                  className="mx-auto p-4 rounded-lg inline-block"
                  style={{ background: "white" }}
                >
                  <div className="w-48 h-48 flex items-center justify-center text-black text-xs text-center p-4">
                    <div>
                      <p className="font-bold mb-2">QR Code</p>
                      <p className="text-xs opacity-70">Use your authenticator app to scan, or enter the secret manually</p>
                    </div>
                  </div>
                </div>

                <div className="text-center">
                  <p className="text-xs mb-2" style={{ color: "rgba(200, 240, 200, 0.6)" }}>
                    Or enter this secret manually:
                  </p>
                  <div className="flex items-center justify-center gap-2">
                    <code
                      className="px-4 py-2 rounded-lg font-mono text-sm"
                      style={{
                        background: "rgba(255, 255, 255, 0.1)",
                        color: "rgba(200, 240, 200, 0.95)",
                      }}
                    >
                      {secret}
                    </code>
                    <motion.button
                      onClick={() => copyToClipboard(secret)}
                      className="p-2 rounded-lg"
                      style={{
                        background: "rgba(255, 255, 255, 0.1)",
                        color: copiedCode === secret ? "rgba(150, 255, 150, 0.95)" : "rgba(200, 240, 200, 0.8)",
                      }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {copiedCode === secret ? <Check size={16} /> : <Copy size={16} />}
                    </motion.button>
                  </div>
                </div>
              </div>

              <motion.button
                onClick={() => setStep('verify')}
                className="w-full px-6 py-3 rounded-lg font-semibold uppercase tracking-wider"
                style={{
                  background: "linear-gradient(135deg, rgba(100, 200, 100, 0.35) 0%, rgba(80, 180, 80, 0.2) 100%)",
                  border: "1px solid rgba(200, 240, 200, 0.3)",
                  color: "rgba(200, 240, 200, 0.95)",
                }}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
              >
                I've scanned the code
              </motion.button>
            </motion.div>
          )}

          {step === 'verify' && (
            <motion.div
              key="verify"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div className="text-center space-y-4">
                <Key size={40} style={{ color: "rgba(180, 240, 180, 0.9)", margin: "0 auto" }} />
                <p className="text-sm" style={{ color: "rgba(200, 240, 200, 0.8)" }}>
                  Enter the 6-digit code from your authenticator app to verify setup
                </p>
                
                <input
                  type="text"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="000000"
                  maxLength={6}
                  className="w-48 mx-auto text-center text-2xl tracking-[0.5em] px-4 py-3 rounded-lg bg-white/10 border border-white/20 focus:outline-none focus:ring-2 focus:ring-white/40"
                  style={{ color: "rgba(200, 240, 200, 0.95)" }}
                />
              </div>

              <div className="flex gap-3">
                <motion.button
                  onClick={() => setStep('setup')}
                  className="flex-1 px-4 py-3 rounded-lg font-semibold uppercase tracking-wider"
                  style={{
                    background: "rgba(255, 255, 255, 0.05)",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                    color: "rgba(200, 240, 200, 0.8)",
                  }}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                >
                  Back
                </motion.button>
                <motion.button
                  onClick={verifyAndEnable}
                  disabled={isLoading || verificationCode.length !== 6}
                  className="flex-1 px-4 py-3 rounded-lg font-semibold uppercase tracking-wider disabled:opacity-50"
                  style={{
                    background: "linear-gradient(135deg, rgba(100, 200, 100, 0.35) 0%, rgba(80, 180, 80, 0.2) 100%)",
                    border: "1px solid rgba(200, 240, 200, 0.3)",
                    color: "rgba(200, 240, 200, 0.95)",
                  }}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                >
                  {isLoading ? "Verifying..." : "Verify & Enable"}
                </motion.button>
              </div>
            </motion.div>
          )}

          {step === 'backup' && (
            <motion.div
              key="backup"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div
                className="p-4 rounded-lg"
                style={{
                  background: "rgba(240, 180, 60, 0.15)",
                  border: "1px solid rgba(240, 180, 60, 0.3)",
                }}
              >
                <div className="flex items-start gap-3">
                  <AlertTriangle size={20} style={{ color: "rgba(240, 200, 100, 0.95)", flexShrink: 0, marginTop: 2 }} />
                  <div>
                    <p className="font-bold text-sm" style={{ color: "rgba(240, 220, 150, 0.95)" }}>
                      Save your backup codes
                    </p>
                    <p className="text-xs mt-1" style={{ color: "rgba(240, 220, 150, 0.8)" }}>
                      Store these codes somewhere safe. You can use them to access your account if you lose your authenticator.
                    </p>
                  </div>
                </div>
              </div>

              <div
                className="p-4 rounded-lg grid grid-cols-2 gap-2"
                style={{
                  background: "rgba(255, 255, 255, 0.05)",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                }}
              >
                {backupCodes.map((code, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between px-3 py-2 rounded font-mono text-sm"
                    style={{
                      background: "rgba(0, 0, 0, 0.2)",
                      color: "rgba(200, 240, 200, 0.95)",
                    }}
                  >
                    <span>{code}</span>
                    <motion.button
                      onClick={() => copyToClipboard(code)}
                      className="p-1 rounded"
                      style={{ color: copiedCode === code ? "rgba(150, 255, 150, 0.95)" : "rgba(200, 240, 200, 0.5)" }}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      {copiedCode === code ? <Check size={14} /> : <Copy size={14} />}
                    </motion.button>
                  </div>
                ))}
              </div>

              <motion.button
                onClick={() => copyToClipboard(backupCodes.join('\n'))}
                className="w-full px-4 py-2 rounded-lg font-medium flex items-center justify-center gap-2"
                style={{
                  background: "rgba(255, 255, 255, 0.05)",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  color: "rgba(200, 240, 200, 0.8)",
                }}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
              >
                <Copy size={16} />
                Copy all codes
              </motion.button>

              <motion.button
                onClick={finishSetup}
                className="w-full px-6 py-3 rounded-lg font-semibold uppercase tracking-wider"
                style={{
                  background: "linear-gradient(135deg, rgba(100, 200, 100, 0.35) 0%, rgba(80, 180, 80, 0.2) 100%)",
                  border: "1px solid rgba(200, 240, 200, 0.3)",
                  color: "rgba(200, 240, 200, 0.95)",
                }}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
              >
                I've saved my backup codes
              </motion.button>
            </motion.div>
          )}

          {step === 'disable' && (
            <motion.div
              key="disable"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div
                className="p-4 rounded-lg"
                style={{
                  background: "rgba(200, 80, 80, 0.15)",
                  border: "1px solid rgba(200, 80, 80, 0.3)",
                }}
              >
                <p className="text-sm" style={{ color: "rgba(255, 180, 180, 0.95)" }}>
                  Disabling 2FA will make your account less secure. Enter your password to confirm.
                </p>
              </div>

              <label className="block space-y-2">
                <span className="text-sm font-medium" style={{ color: "rgba(200, 240, 200, 0.7)" }}>
                  Current Password
                </span>
                <input
                  type="password"
                  value={disablePassword}
                  onChange={(e) => setDisablePassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 focus:outline-none focus:ring-2 focus:ring-white/40"
                  style={{ color: "rgba(200, 240, 200, 0.85)" }}
                />
              </label>

              <div className="flex gap-3">
                <motion.button
                  onClick={() => {
                    setStep('idle');
                    setDisablePassword("");
                    setError("");
                  }}
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
                  onClick={disable2FA}
                  disabled={isLoading || !disablePassword}
                  className="flex-1 px-4 py-3 rounded-lg font-semibold uppercase tracking-wider disabled:opacity-50"
                  style={{
                    background: "rgba(200, 80, 80, 0.3)",
                    border: "1px solid rgba(200, 80, 80, 0.4)",
                    color: "rgba(255, 180, 180, 0.95)",
                  }}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                >
                  {isLoading ? "Disabling..." : "Disable 2FA"}
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-3 rounded-lg"
            style={{
              background: "rgba(180, 60, 60, 0.15)",
              border: "1px solid rgba(255, 120, 120, 0.3)",
              color: "rgba(255, 180, 180, 0.95)",
              fontSize: "12px",
            }}
          >
            {error}
          </motion.div>
        )}

        {success && step === 'idle' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-3 rounded-lg"
            style={{
              background: "rgba(100, 200, 100, 0.15)",
              border: "1px solid rgba(150, 240, 150, 0.3)",
              color: "rgba(180, 240, 180, 0.95)",
              fontSize: "12px",
            }}
          >
            {success}
          </motion.div>
        )}
      </GameCardContent>
    </GameCard>
  );
}

