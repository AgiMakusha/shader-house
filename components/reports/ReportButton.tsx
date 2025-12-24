"use client";

import { useState } from "react";
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
  const [showModal, setShowModal] = useState(false);
  const [selectedReason, setSelectedReason] = useState<string | null>(null);
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
      const body: Record<string, unknown> = {
        type,
        reason: selectedReason,
        description: description.trim() || null,
      };

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
    } catch {
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

  return (
    <>
      {/* Report Button */}
      {variant === "icon" ? (
        <button
          onClick={() => setShowModal(true)}
          className={`p-2 rounded-lg hover:bg-red-500/20 transition-all ${className}`}
          title={`Report this ${typeLabels[type]}`}
          type="button"
        >
          <Flag className="w-4 h-4" style={{ color: "rgba(248, 113, 113, 0.7)" }} />
        </button>
      ) : variant === "text" ? (
        <button
          onClick={() => setShowModal(true)}
          className={`text-sm flex items-center gap-1 hover:text-red-400 transition-all ${className}`}
          style={{ color: "rgba(200, 240, 200, 0.6)" }}
          type="button"
        >
          <Flag className="w-3 h-3" />
          Report
        </button>
      ) : (
        <button
          onClick={() => setShowModal(true)}
          className={`w-full px-4 py-3 rounded-lg flex items-center justify-center gap-2 text-sm font-semibold transition-all hover:opacity-90 ${className}`}
          style={{
            background: "rgba(248, 113, 113, 0.15)",
            border: "1px solid rgba(248, 113, 113, 0.4)",
            color: "rgba(252, 165, 165, 0.95)",
          }}
          type="button"
        >
          <Flag className="w-4 h-4" />
          Report {typeLabels[type]}
        </button>
      )}

      {/* Report Modal - Same pattern as TipButton */}
      <AnimatePresence>
        {showModal && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: "rgba(0, 0, 0, 0.85)" }}
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="rounded-xl p-6 max-w-md w-full max-h-[85vh] overflow-y-auto"
              style={{
                background: "linear-gradient(145deg, rgba(30, 50, 40, 0.98) 0%, rgba(20, 40, 30, 0.98) 100%)",
                border: "1px solid rgba(248, 113, 113, 0.3)",
                boxShadow: "0 8px 32px rgba(200, 50, 50, 0.2)",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <h3
                  className="text-xl font-bold pixelized flex items-center gap-2"
                  style={{ color: "rgba(252, 165, 165, 0.95)" }}
                >
                  <Flag size={20} className="text-red-400" />
                  Report {typeLabels[type]}
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-1 rounded hover:bg-white/10 transition-all"
                >
                  <X size={20} style={{ color: "rgba(200, 200, 200, 0.7)" }} />
                </button>
              </div>

              {targetName && (
                <p className="text-sm mb-4" style={{ color: "rgba(200, 240, 200, 0.7)" }}>
                  Reporting: {targetName}
                </p>
              )}

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
                    Thank you for helping keep Shader House safe.
                  </p>
                  <button
                    onClick={handleClose}
                    className="px-6 py-2 rounded-lg font-medium transition-all hover:scale-[1.02]"
                    style={{
                      background: "linear-gradient(135deg, rgba(100, 200, 100, 0.3) 0%, rgba(80, 180, 80, 0.2) 100%)",
                      border: "1px solid rgba(200, 240, 200, 0.3)",
                      color: "rgba(200, 240, 200, 0.95)",
                    }}
                  >
                    Close
                  </button>
                </div>
              ) : (
                <>
                  {/* Reason Selection */}
                  <div className="mb-4">
                    <label
                      className="block text-xs mb-2"
                      style={{ color: "rgba(252, 165, 165, 0.7)" }}
                    >
                      Why are you reporting this {typeLabels[type]}?
                    </label>
                    <div className="space-y-2">
                      {REPORT_REASONS.map((reason) => (
                        <button
                          key={reason.value}
                          onClick={() => {
                            setSelectedReason(reason.value);
                            setError(null);
                          }}
                          className={`w-full text-left py-2 px-3 rounded-lg text-sm transition-all ${
                            selectedReason === reason.value ? "scale-[1.02]" : ""
                          }`}
                          style={{
                            background:
                              selectedReason === reason.value
                                ? "rgba(248, 113, 113, 0.3)"
                                : "rgba(100, 80, 80, 0.2)",
                            border:
                              selectedReason === reason.value
                                ? "1px solid rgba(248, 113, 113, 0.5)"
                                : "1px solid rgba(150, 130, 130, 0.2)",
                            color:
                              selectedReason === reason.value
                                ? "rgba(252, 200, 200, 0.95)"
                                : "rgba(200, 180, 180, 0.8)",
                          }}
                        >
                          {reason.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Description */}
                  <div className="mb-4">
                    <label
                      className="block text-xs mb-1"
                      style={{ color: "rgba(252, 165, 165, 0.7)" }}
                    >
                      Additional details {selectedReason === "OTHER" ? "(required)" : "(optional)"}
                    </label>
                    <textarea
                      value={description}
                      onChange={(e) => {
                        setDescription(e.target.value);
                        setError(null);
                      }}
                      placeholder="Provide more context about the issue..."
                      maxLength={500}
                      rows={2}
                      className="w-full py-2 px-3 rounded-lg text-sm resize-none"
                      style={{
                        background: "rgba(100, 80, 80, 0.2)",
                        border: "1px solid rgba(150, 130, 130, 0.2)",
                        color: "rgba(252, 200, 200, 0.95)",
                      }}
                    />
                  </div>

                  {error && <p className="text-sm text-red-400 mb-3">{error}</p>}

                  {/* Buttons */}
                  <div className="flex gap-3">
                    <button
                      onClick={() => setShowModal(false)}
                      className="flex-1 py-2 px-4 rounded-lg font-semibold text-sm transition-all hover:bg-white/10"
                      style={{
                        background: "rgba(100, 100, 100, 0.2)",
                        border: "1px solid rgba(150, 150, 150, 0.3)",
                        color: "rgba(200, 200, 200, 0.9)",
                      }}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSubmit}
                      disabled={isSubmitting || !selectedReason}
                      className="flex-1 py-2 px-4 rounded-lg font-semibold text-sm flex items-center justify-center gap-2 transition-all hover:scale-[1.02] disabled:opacity-50"
                      style={{
                        background: "linear-gradient(135deg, rgba(248, 113, 113, 0.4) 0%, rgba(220, 80, 80, 0.3) 100%)",
                        border: "1px solid rgba(248, 113, 113, 0.5)",
                        color: "rgba(252, 200, 200, 0.95)",
                      }}
                    >
                      {isSubmitting ? (
                        <Loader2 size={16} className="animate-spin" />
                      ) : (
                        <Send size={16} />
                      )}
                      Submit
                    </button>
                  </div>

                  <p className="text-xs text-center mt-4" style={{ color: "rgba(200, 180, 180, 0.5)" }}>
                    False reports may result in action against your account.
                  </p>
                </>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
