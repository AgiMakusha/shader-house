"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Flag, X, AlertTriangle, Send, Loader2 } from "lucide-react";

interface ReportButtonProps {
  type: "GAME" | "USER" | "REVIEW" | "THREAD" | "POST";
  targetId: string;
  targetName?: string;
  variant?: "icon" | "text" | "full";
  className?: string;
}

const REPORT_REASONS = [
  { value: "SPAM", label: "Spam or misleading content" },
  { value: "INAPPROPRIATE", label: "Inappropriate or offensive content" },
  { value: "HARASSMENT", label: "Harassment or bullying" },
  { value: "MALICIOUS", label: "Malicious software or links" },
  { value: "COPYRIGHT", label: "Copyright or IP violation" },
  { value: "MISINFORMATION", label: "False or misleading information" },
  { value: "IMPERSONATION", label: "Impersonating someone else" },
  { value: "OTHER", label: "Other reason" },
];

export default function ReportButton({
  type,
  targetId,
  targetName,
  variant = "icon",
  className = "",
}: ReportButtonProps) {
  const [mounted, setMounted] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedReason, setSelectedReason] = useState<string | null>(null);
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    console.log('showModal state:', showModal, 'mounted:', mounted);
  }, [showModal, mounted]);

  const handleSubmit = async () => {
    if (!selectedReason) {
      setError("Please select a reason for your report");
      return;
    }

    if (selectedReason === "OTHER" && !description.trim()) {
      setError("Please provide details for your report");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const body: any = {
        type,
        reason: selectedReason,
        description: description.trim() || null,
      };

      // Set the appropriate ID field based on type
      if (type === "GAME") body.gameId = targetId;
      else if (type === "USER") body.userId = targetId;
      else if (type === "REVIEW") body.ratingId = targetId;
      else if (type === "THREAD") body.threadId = targetId;
      else if (type === "POST") body.postId = targetId;

      const res = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to submit report");
        return;
      }

      setSubmitted(true);
    } catch (err) {
      setError("Failed to submit report. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setShowModal(false);
    setSelectedReason(null);
    setDescription("");
    setError(null);
    setSubmitted(false);
  };

  const typeLabels: Record<string, string> = {
    GAME: "game",
    USER: "user",
    REVIEW: "review",
    THREAD: "discussion",
    POST: "comment",
  };

  const handleButtonClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('Report button clicked', { showModal, mounted });
    setShowModal(true);
  };

  return (
    <>
      {/* Report Button */}
      {variant === "icon" ? (
        <button
          onClick={handleButtonClick}
          className={`p-2 rounded-lg hover:bg-red-500/20 transition-all ${className}`}
          title={`Report this ${typeLabels[type]}`}
          type="button"
          style={{ cursor: 'pointer', position: 'relative', zIndex: 10 }}
        >
          <Flag className="w-4 h-4" style={{ color: "rgba(248, 113, 113, 0.7)" }} />
        </button>
      ) : variant === "text" ? (
        <button
          onClick={handleButtonClick}
          className={`text-sm flex items-center gap-1 hover:text-red-400 transition-all ${className}`}
          style={{ color: "rgba(200, 240, 200, 0.6)", cursor: 'pointer', position: 'relative', zIndex: 10 }}
          type="button"
        >
          <Flag className="w-3 h-3" />
          Report
        </button>
      ) : (
        <button
          onClick={handleButtonClick}
          className={`w-full px-4 py-3 rounded-lg flex items-center justify-center gap-2 text-sm font-semibold transition-all ${className}`}
          style={{
            background: "rgba(248, 113, 113, 0.15)",
            border: "1px solid rgba(248, 113, 113, 0.4)",
            color: "rgba(252, 165, 165, 0.95)",
            cursor: 'pointer',
            position: 'relative',
            zIndex: 10,
          }}
          type="button"
        >
          <Flag className="w-4 h-4" />
          Report {typeLabels[type]}
        </button>
      )}

      {/* Report Modal */}
      {mounted && (
        <AnimatePresence>
          {showModal && createPortal(
            <div
              className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
              style={{ background: "rgba(0, 0, 0, 0.85)" }}
              onClick={handleClose}
            >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="rounded-xl w-full max-w-md max-h-[85vh] flex flex-col"
              style={{
                background: "linear-gradient(145deg, rgba(15, 35, 25, 0.98) 0%, rgba(10, 25, 20, 0.98) 100%)",
                border: "1px solid rgba(200, 240, 200, 0.3)",
                boxShadow: "0 8px 32px rgba(100, 200, 100, 0.3)",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="p-6 border-b border-white/20 flex items-center justify-between flex-shrink-0">
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center"
                    style={{ background: "rgba(248, 113, 113, 0.25)", border: "1px solid rgba(248, 113, 113, 0.4)" }}
                  >
                    <Flag className="w-5 h-5 text-red-400" />
                  </div>
                  <div>
                    <h3 
                      className="text-lg font-bold pixelized" 
                      style={{ 
                        color: "rgba(220, 255, 220, 0.98)",
                        textShadow: "0 0 8px rgba(100, 200, 100, 0.5), 1px 1px 0px rgba(0, 0, 0, 0.8)"
                      }}
                    >
                      Report {typeLabels[type]}
                    </h3>
                    {targetName && (
                      <p className="text-sm font-medium" style={{ color: "rgba(200, 240, 200, 0.75)" }}>
                        {targetName}
                      </p>
                    )}
                  </div>
                </div>
                <button
                  onClick={handleClose}
                  className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                >
                  <X className="w-5 h-5" style={{ color: "rgba(220, 255, 220, 0.8)" }} />
                </button>
              </div>

              {/* Body */}
              <div className="p-6 overflow-y-auto flex-1">
                {submitted ? (
                  <div className="text-center py-6">
                    <div
                      className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                      style={{ background: "rgba(34, 197, 94, 0.2)" }}
                    >
                      <AlertTriangle className="w-8 h-8 text-green-400" />
                    </div>
                    <h4 className="text-lg font-bold mb-2" style={{ color: "rgba(200, 240, 200, 0.95)" }}>
                      Report Submitted
                    </h4>
                    <p className="text-sm mb-4" style={{ color: "rgba(200, 240, 200, 0.7)" }}>
                      Thank you for helping keep Shader House safe. Our team will review your report shortly.
                    </p>
                    <motion.button
                      onClick={handleClose}
                      className="px-6 py-2 rounded-lg font-medium"
                      style={{
                        background: "linear-gradient(135deg, rgba(100, 200, 100, 0.3) 0%, rgba(80, 180, 80, 0.2) 100%)",
                        border: "1px solid rgba(200, 240, 200, 0.3)",
                        color: "rgba(200, 240, 200, 0.95)",
                      }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      Close
                    </motion.button>
                  </div>
                ) : (
                  <>
                    {/* Reason Selection */}
                    <div className="mb-4">
                      <label className="block text-sm font-bold mb-2 pixelized" style={{ 
                        color: "rgba(220, 255, 220, 0.95)",
                        textShadow: "0 0 6px rgba(100, 200, 100, 0.4)"
                      }}>
                        Why are you reporting this {typeLabels[type]}?
                      </label>
                      <div className="space-y-1.5">
                        {REPORT_REASONS.map((reason) => (
                          <button
                            key={reason.value}
                            onClick={() => { setSelectedReason(reason.value); setError(null); }}
                            className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                              selectedReason === reason.value ? "ring-2 ring-green-400/60" : ""
                            }`}
                            style={{
                              background: selectedReason === reason.value 
                                ? "rgba(100, 200, 100, 0.3)" 
                                : "rgba(30, 50, 40, 0.8)",
                              border: selectedReason === reason.value
                                ? "1px solid rgba(150, 250, 150, 0.6)"
                                : "1px solid rgba(200, 240, 200, 0.3)",
                              color: selectedReason === reason.value
                                ? "rgba(220, 255, 220, 1)"
                                : "rgba(220, 255, 220, 0.95)",
                              textShadow: selectedReason === reason.value 
                                ? "0 0 8px rgba(100, 200, 100, 0.5)" 
                                : "none",
                            }}
                          >
                            {reason.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Description */}
                    <div className="mb-4">
                      <label className="block text-sm font-bold mb-2 pixelized" style={{ 
                        color: "rgba(220, 255, 220, 0.95)",
                        textShadow: "0 0 6px rgba(100, 200, 100, 0.4)"
                      }}>
                        Additional details {selectedReason === "OTHER" ? "(required)" : "(optional)"}
                      </label>
                      <textarea
                        value={description}
                        onChange={(e) => { setDescription(e.target.value); setError(null); }}
                        placeholder="Provide more context about the issue..."
                        rows={2}
                        className="w-full p-3 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-green-400/50"
                        style={{
                          background: "rgba(30, 50, 40, 0.8)",
                          border: "1px solid rgba(200, 240, 200, 0.3)",
                          color: "rgba(220, 255, 220, 0.95)",
                        }}
                      />
                    </div>

                    {/* Error */}
                    {error && (
                      <div className="mb-4 p-3 rounded-lg" style={{ background: "rgba(239, 68, 68, 0.1)", border: "1px solid rgba(239, 68, 68, 0.3)" }}>
                        <p className="text-sm" style={{ color: "rgba(252, 165, 165, 0.9)" }}>{error}</p>
                      </div>
                    )}

                    {/* Submit Button */}
                    <motion.button
                      onClick={handleSubmit}
                      disabled={isSubmitting || !selectedReason}
                      className="w-full py-3 rounded-lg font-medium flex items-center justify-center gap-2 disabled:opacity-50"
                      style={{
                        background: "linear-gradient(135deg, rgba(248, 113, 113, 0.3) 0%, rgba(220, 38, 38, 0.2) 100%)",
                        border: "1px solid rgba(248, 113, 113, 0.5)",
                        color: "rgba(254, 202, 202, 0.95)",
                      }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Submitting...
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          Submit Report
                        </>
                      )}
                    </motion.button>

                    <p className="text-xs text-center mt-4" style={{ color: "rgba(200, 240, 200, 0.5)" }}>
                      False reports may result in action against your account.
                    </p>
                  </>
                )}
              </div>
            </motion.div>
          </div>,
          document.body
          )}
        </AnimatePresence>
      )}
    </>
  );
}



