"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { AlertTriangle, Trash2, X, Download, ShieldAlert, Eye, EyeOff } from "lucide-react";
import { GameCard, GameCardContent } from "@/components/game/GameCard";

interface AccountDeletionProps {
  userRole?: string;
}

export function AccountDeletion({ userRole }: AccountDeletionProps) {
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);
  const [step, setStep] = useState<'warning' | 'confirm'>('warning');
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [confirmation, setConfirmation] = useState("");
  const [reason, setReason] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState("");

  const handleExportData = async () => {
    setIsExporting(true);
    setError("");

    try {
      const response = await fetch('/api/auth/delete-account', {
        method: 'GET',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to export data');
      }

      // Create a downloadable JSON file
      const blob = new Blob([JSON.stringify(data.data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `shader-house-data-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err: any) {
      console.error('Export error:', err);
      setError(err.message || 'Failed to export data. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (confirmation !== "DELETE MY ACCOUNT") {
      setError('Please type "DELETE MY ACCOUNT" exactly to confirm');
      return;
    }

    if (!password) {
      setError('Password is required to confirm deletion');
      return;
    }

    setIsDeleting(true);
    setError("");

    try {
      const response = await fetch('/api/auth/delete-account', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          password,
          confirmation,
          reason: reason.trim() || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 429) {
          throw new Error(data.error || 'Too many attempts. Please try again later.');
        }
        throw new Error(data.error || 'Failed to delete account');
      }

      // Redirect to home page after successful deletion
      router.push('/?deleted=true');
    } catch (err: any) {
      console.error('Deletion error:', err);
      setError(err.message || 'Failed to delete account. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setStep('warning');
    setPassword("");
    setConfirmation("");
    setReason("");
    setError("");
  };

  return (
    <>
      <GameCard>
        <GameCardContent className="p-8 space-y-6">
          <div className="flex items-center gap-3">
            <ShieldAlert size={24} style={{ color: 'rgba(255, 150, 150, 0.9)' }} />
            <h2
              className="text-2xl font-bold pixelized"
              style={{ 
                textShadow: "0 0 8px rgba(200, 100, 100, 0.6), 1px 1px 0px rgba(0, 0, 0, 0.8)", 
                color: "rgba(255, 180, 180, 0.95)" 
              }}
            >
              Danger Zone
            </h2>
          </div>

          <div 
            className="p-4 rounded-lg"
            style={{
              background: 'rgba(180, 60, 60, 0.1)',
              border: '1px solid rgba(255, 120, 120, 0.2)',
            }}
          >
            <div className="flex items-start gap-4">
              <AlertTriangle size={20} className="flex-shrink-0 mt-1" style={{ color: 'rgba(255, 180, 180, 0.9)' }} />
              <div className="space-y-2">
                <p className="font-semibold" style={{ color: 'rgba(255, 180, 180, 0.95)' }}>
                  Delete Account Permanently
                </p>
                <p className="text-sm" style={{ color: 'rgba(200, 200, 200, 0.75)' }}>
                  Once you delete your account, there is no going back. This will permanently remove:
                </p>
                <ul className="text-sm list-disc list-inside space-y-1" style={{ color: 'rgba(200, 200, 200, 0.65)' }}>
                  <li>Your profile and personal information</li>
                  {userRole === 'DEVELOPER' && <li>All your games and game files</li>}
                  <li>Your reviews, ratings, and favorites</li>
                  <li>Your community posts and discussions</li>
                  <li>Your subscription and payment history</li>
                  <li>All achievements, badges, XP, and points</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-4">
            <motion.button
              onClick={handleExportData}
              disabled={isExporting}
              className="flex items-center gap-2 px-5 py-3 rounded-lg font-semibold uppercase tracking-wider transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                background: "linear-gradient(135deg, rgba(100, 150, 200, 0.25) 0%, rgba(80, 130, 180, 0.15) 100%)",
                border: "1px solid rgba(150, 200, 240, 0.3)",
                color: "rgba(180, 220, 255, 0.95)",
              }}
              whileHover={!isExporting ? { scale: 1.02 } : {}}
              whileTap={!isExporting ? { scale: 0.98 } : {}}
            >
              <Download size={18} />
              {isExporting ? "Exporting..." : "Export My Data"}
            </motion.button>

            <motion.button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 px-5 py-3 rounded-lg font-semibold uppercase tracking-wider transition-all"
              style={{
                background: "linear-gradient(135deg, rgba(180, 60, 60, 0.25) 0%, rgba(150, 40, 40, 0.15) 100%)",
                border: "1px solid rgba(255, 120, 120, 0.3)",
                color: "rgba(255, 180, 180, 0.95)",
              }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Trash2 size={18} />
              Delete My Account
            </motion.button>
          </div>

          <p className="text-xs" style={{ color: 'rgba(200, 200, 200, 0.5)' }}>
            Under GDPR and similar data protection laws, you have the right to request deletion of your personal data. 
            We recommend exporting your data before deletion.
          </p>
        </GameCardContent>
      </GameCard>

      {/* Deletion Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ backgroundColor: 'rgba(0, 0, 0, 0.8)' }}
            onClick={closeModal}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-lg rounded-xl overflow-hidden"
              style={{
                background: 'linear-gradient(135deg, rgba(40, 50, 40, 0.95) 0%, rgba(30, 40, 35, 0.98) 100%)',
                border: '2px solid rgba(255, 120, 120, 0.3)',
                boxShadow: '0 0 40px rgba(200, 60, 60, 0.2), 0 20px 40px rgba(0, 0, 0, 0.4)',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div 
                className="flex items-center justify-between p-6"
                style={{ borderBottom: '1px solid rgba(255, 120, 120, 0.2)' }}
              >
                <div className="flex items-center gap-3">
                  <AlertTriangle size={24} style={{ color: 'rgba(255, 150, 150, 0.9)' }} />
                  <h3 
                    className="text-xl font-bold pixelized"
                    style={{ color: 'rgba(255, 180, 180, 0.95)' }}
                  >
                    {step === 'warning' ? 'Warning' : 'Confirm Deletion'}
                  </h3>
                </div>
                <button
                  onClick={closeModal}
                  className="p-2 rounded-lg transition-colors hover:bg-white/10"
                  style={{ color: 'rgba(200, 200, 200, 0.7)' }}
                >
                  <X size={20} />
                </button>
              </div>

              {/* Content */}
              <div className="p-6 space-y-6">
                {step === 'warning' ? (
                  <>
                    <p style={{ color: 'rgba(200, 200, 200, 0.85)' }}>
                      You are about to permanently delete your Shader House account. This action cannot be undone.
                    </p>
                    
                    <div 
                      className="p-4 rounded-lg"
                      style={{
                        background: 'rgba(255, 200, 100, 0.1)',
                        border: '1px solid rgba(255, 200, 100, 0.3)',
                      }}
                    >
                      <p className="text-sm font-semibold mb-2" style={{ color: 'rgba(255, 220, 150, 0.95)' }}>
                        Before you proceed:
                      </p>
                      <ul className="text-sm space-y-1" style={{ color: 'rgba(255, 220, 150, 0.8)' }}>
                        <li>• Export your data using the button above</li>
                        <li>• Cancel any active subscriptions</li>
                        <li>• Download any game files you want to keep</li>
                      </ul>
                    </div>

                    <div className="flex justify-end gap-3">
                      <motion.button
                        onClick={closeModal}
                        className="px-5 py-2.5 rounded-lg font-semibold uppercase tracking-wider"
                        style={{
                          background: 'rgba(100, 100, 100, 0.2)',
                          border: '1px solid rgba(200, 200, 200, 0.2)',
                          color: 'rgba(200, 200, 200, 0.8)',
                        }}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        Cancel
                      </motion.button>
                      <motion.button
                        onClick={() => setStep('confirm')}
                        className="px-5 py-2.5 rounded-lg font-semibold uppercase tracking-wider"
                        style={{
                          background: 'linear-gradient(135deg, rgba(180, 60, 60, 0.4) 0%, rgba(150, 40, 40, 0.3) 100%)',
                          border: '1px solid rgba(255, 120, 120, 0.4)',
                          color: 'rgba(255, 180, 180, 0.95)',
                        }}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        I Understand, Continue
                      </motion.button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium" style={{ color: 'rgba(200, 200, 200, 0.8)' }}>
                          Enter your password to confirm
                        </label>
                        <div className="relative">
                          <input
                            type={showPassword ? "text" : "password"}
                            value={password}
                            onChange={(e) => {
                              setPassword(e.target.value);
                              setError("");
                            }}
                            placeholder="Your current password"
                            className="w-full px-4 py-3 pr-12 rounded-lg bg-white/10 border border-white/20 focus:outline-none focus:ring-2 focus:ring-red-500/40 transition-all"
                            style={{ color: 'rgba(200, 200, 200, 0.9)' }}
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute inset-y-0 right-0 pr-3 flex items-center"
                            style={{ color: 'rgba(200, 200, 200, 0.5)' }}
                          >
                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                          </button>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium" style={{ color: 'rgba(200, 200, 200, 0.8)' }}>
                          Type <span style={{ color: 'rgba(255, 150, 150, 0.95)', fontFamily: 'monospace' }}>DELETE MY ACCOUNT</span> to confirm
                        </label>
                        <input
                          type="text"
                          value={confirmation}
                          onChange={(e) => {
                            setConfirmation(e.target.value);
                            setError("");
                          }}
                          placeholder="DELETE MY ACCOUNT"
                          className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 focus:outline-none focus:ring-2 focus:ring-red-500/40 transition-all font-mono"
                          style={{ color: 'rgba(255, 150, 150, 0.9)' }}
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium" style={{ color: 'rgba(200, 200, 200, 0.8)' }}>
                          Reason for leaving (optional)
                        </label>
                        <textarea
                          value={reason}
                          onChange={(e) => setReason(e.target.value)}
                          placeholder="Help us improve by sharing your feedback..."
                          rows={2}
                          maxLength={500}
                          className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 focus:outline-none focus:ring-2 focus:ring-white/40 transition-all resize-none"
                          style={{ color: 'rgba(200, 200, 200, 0.9)' }}
                        />
                      </div>
                    </div>

                    {error && (
                      <motion.div
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-3 rounded-lg flex items-center gap-2"
                        style={{
                          background: 'rgba(180, 60, 60, 0.2)',
                          border: '1px solid rgba(255, 120, 120, 0.3)',
                          color: 'rgba(255, 180, 180, 0.95)',
                        }}
                      >
                        <AlertTriangle size={16} />
                        <span className="text-sm">{error}</span>
                      </motion.div>
                    )}

                    <div className="flex justify-end gap-3">
                      <motion.button
                        onClick={() => setStep('warning')}
                        className="px-5 py-2.5 rounded-lg font-semibold uppercase tracking-wider"
                        style={{
                          background: 'rgba(100, 100, 100, 0.2)',
                          border: '1px solid rgba(200, 200, 200, 0.2)',
                          color: 'rgba(200, 200, 200, 0.8)',
                        }}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        Go Back
                      </motion.button>
                      <motion.button
                        onClick={handleDeleteAccount}
                        disabled={isDeleting || confirmation !== "DELETE MY ACCOUNT" || !password}
                        className="px-5 py-2.5 rounded-lg font-semibold uppercase tracking-wider disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        style={{
                          background: 'linear-gradient(135deg, rgba(180, 40, 40, 0.6) 0%, rgba(150, 30, 30, 0.5) 100%)',
                          border: '1px solid rgba(255, 100, 100, 0.5)',
                          color: 'rgba(255, 200, 200, 0.95)',
                        }}
                        whileHover={!isDeleting ? { scale: 1.02 } : {}}
                        whileTap={!isDeleting ? { scale: 0.98 } : {}}
                      >
                        {isDeleting ? (
                          <>
                            <span className="animate-spin">⟳</span>
                            Deleting...
                          </>
                        ) : (
                          <>
                            <Trash2 size={16} />
                            Delete Forever
                          </>
                        )}
                      </motion.button>
                    </div>
                  </>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}



