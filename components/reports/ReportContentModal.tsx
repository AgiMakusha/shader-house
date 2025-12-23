"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Flag, X, Send, Loader2, Gamepad2, User, Star, MessageSquare, CheckCircle, Bug, Upload, Image as ImageIcon, Trash2 } from "lucide-react";

interface ReportContentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const REPORT_TYPES = [
  { value: "PLATFORM_BUG", label: "Platform Bug", icon: Bug, description: "Report a bug or issue with Shader House" },
  { value: "GAME", label: "Game", icon: Gamepad2, description: "Report a game with inappropriate content" },
  { value: "USER", label: "User", icon: User, description: "Report a user for bad behavior" },
  { value: "REVIEW", label: "Review", icon: Star, description: "Report an inappropriate review" },
  { value: "POST", label: "Discussion Post", icon: MessageSquare, description: "Report a discussion post" },
];

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

const BUG_REASONS = [
  { value: "OTHER", label: "UI/Visual Bug - Something looks wrong" },
  { value: "OTHER", label: "Functionality Bug - Something doesn't work" },
  { value: "OTHER", label: "Performance Issue - Slow or freezing" },
  { value: "OTHER", label: "Error Message - Getting an error" },
  { value: "OTHER", label: "Other Issue" },
];

export default function ReportContentModal({ isOpen, onClose }: ReportContentModalProps) {
  const [step, setStep] = useState<"type" | "details" | "success">("type");
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [selectedReason, setSelectedReason] = useState<string | null>(null);
  const [bugCategory, setBugCategory] = useState<string | null>(null);
  const [contentUrl, setContentUrl] = useState("");
  const [description, setDescription] = useState("");
  const [screenshots, setScreenshots] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleClose = () => {
    setStep("type");
    setSelectedType(null);
    setSelectedReason(null);
    setBugCategory(null);
    setContentUrl("");
    setDescription("");
    setScreenshots([]);
    setError(null);
    onClose();
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (screenshots.length + files.length > 5) {
      setError("Maximum 5 screenshots allowed");
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      for (const file of Array.from(files)) {
        // Validate file type
        if (!file.type.startsWith("image/")) {
          setError("Only image files are allowed");
          continue;
        }

        // Validate file size (10MB max)
        if (file.size > 10 * 1024 * 1024) {
          setError("Each image must be under 10MB");
          continue;
        }

        const formData = new FormData();
        formData.append("file", file);
        formData.append("type", "image");

        const res = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (!res.ok) {
          const data = await res.json();
          setError(data.error || "Failed to upload image");
          continue;
        }

        const data = await res.json();
        setScreenshots((prev) => [...prev, data.url]);
      }
    } catch (err) {
      setError("Failed to upload image. Please try again.");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const removeScreenshot = (index: number) => {
    setScreenshots((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    const isPlatformBug = selectedType === "PLATFORM_BUG";

    if (!selectedType) {
      setError("Please select a report type");
      return;
    }

    if (!isPlatformBug && !selectedReason) {
      setError("Please select a reason");
      return;
    }

    if (!isPlatformBug && !contentUrl.trim()) {
      setError("Please provide a link to the content you want to report");
      return;
    }

    if (isPlatformBug && !description.trim()) {
      setError("Please describe the bug you encountered");
      return;
    }

    if (!isPlatformBug && selectedReason === "OTHER" && !description.trim()) {
      setError("Please provide details for your report");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/reports/general", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: selectedType,
          reason: isPlatformBug ? "OTHER" : selectedReason,
          contentUrl: isPlatformBug ? window.location.href : contentUrl.trim(),
          description: isPlatformBug 
            ? `[Platform Bug Report]\nCategory: ${bugCategory || "General"}\n\n${description.trim()}`
            : description.trim() || null,
          screenshots,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to submit report");
        return;
      }

      setStep("success");
    } catch (err) {
      setError("Failed to submit report. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const isPlatformBug = selectedType === "PLATFORM_BUG";

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="absolute inset-0 bg-black/80" onClick={handleClose} />
          <motion.div
            className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl"
            style={{
              background: "linear-gradient(135deg, rgba(20, 40, 30, 0.98) 0%, rgba(15, 30, 25, 0.98) 100%)",
              border: "1px solid rgba(200, 240, 200, 0.2)",
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
            }}
            initial={{ scale: 0.95, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, y: 20 }}
          >
            {/* Header */}
            <div className="p-6 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center"
                  style={{ background: "rgba(248, 113, 113, 0.2)", border: "1px solid rgba(248, 113, 113, 0.3)" }}
                >
                  {isPlatformBug ? <Bug className="w-5 h-5 text-amber-400" /> : <Flag className="w-5 h-5 text-red-400" />}
                </div>
                <div>
                  <h3 className="text-lg font-bold" style={{ color: "rgba(200, 240, 200, 0.95)" }}>
                    {isPlatformBug ? "Report a Bug" : "Report a Problem"}
                  </h3>
                  <p className="text-sm" style={{ color: "rgba(200, 240, 200, 0.6)" }}>
                    {step === "type" && "What would you like to report?"}
                    {step === "details" && (isPlatformBug ? "Tell us about the bug" : "Tell us more about the issue")}
                    {step === "success" && "Report submitted"}
                  </p>
                </div>
              </div>
              <button
                onClick={handleClose}
                className="p-2 rounded-lg hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" style={{ color: "rgba(200, 240, 200, 0.7)" }} />
              </button>
            </div>

            {/* Body */}
            <div className="p-6">
              {step === "type" && (
                <div className="space-y-3">
                  {REPORT_TYPES.map((type) => {
                    const Icon = type.icon;
                    const isBug = type.value === "PLATFORM_BUG";
                    return (
                      <button
                        key={type.value}
                        onClick={() => { setSelectedType(type.value); setStep("details"); }}
                        className="w-full p-4 rounded-lg text-left transition-all hover:scale-[1.02] active:scale-[0.98]"
                        style={{
                          background: isBug ? "rgba(251, 191, 36, 0.1)" : "rgba(255, 255, 255, 0.05)",
                          border: isBug ? "1px solid rgba(251, 191, 36, 0.3)" : "1px solid rgba(255, 255, 255, 0.1)",
                        }}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className="w-10 h-10 rounded-lg flex items-center justify-center"
                            style={{ background: isBug ? "rgba(251, 191, 36, 0.2)" : "rgba(100, 200, 100, 0.2)" }}
                          >
                            <Icon className="w-5 h-5" style={{ color: isBug ? "rgba(251, 191, 36, 0.9)" : "rgba(150, 250, 150, 0.9)" }} />
                          </div>
                          <div>
                            <div className="font-medium" style={{ color: isBug ? "rgba(253, 230, 138, 0.95)" : "rgba(200, 240, 200, 0.95)" }}>
                              {type.label}
                            </div>
                            <div className="text-sm" style={{ color: "rgba(200, 240, 200, 0.6)" }}>
                              {type.description}
                            </div>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}

              {step === "details" && (
                <div className="space-y-4">
                  {/* Platform Bug specific fields */}
                  {isPlatformBug ? (
                    <>
                      {/* Bug Category */}
                      <div>
                        <label className="block text-sm font-medium mb-2" style={{ color: "rgba(200, 240, 200, 0.8)" }}>
                          What type of issue?
                        </label>
                        <div className="space-y-2">
                          {[
                            "UI/Visual Bug",
                            "Functionality Bug",
                            "Performance Issue",
                            "Error Message",
                            "Other",
                          ].map((category) => (
                            <button
                              key={category}
                              onClick={() => { setBugCategory(category); setError(null); }}
                              className={`w-full text-left p-3 rounded-lg text-sm transition-all ${
                                bugCategory === category ? "ring-2 ring-amber-400" : ""
                              }`}
                              style={{
                                background: bugCategory === category 
                                  ? "rgba(251, 191, 36, 0.2)" 
                                  : "rgba(255, 255, 255, 0.05)",
                                border: "1px solid rgba(255, 255, 255, 0.1)",
                                color: "rgba(200, 240, 200, 0.9)",
                              }}
                            >
                              {category}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Bug Description */}
                      <div>
                        <label className="block text-sm font-medium mb-2" style={{ color: "rgba(200, 240, 200, 0.8)" }}>
                          Describe the bug (required)
                        </label>
                        <textarea
                          value={description}
                          onChange={(e) => { setDescription(e.target.value); setError(null); }}
                          placeholder="What happened? What did you expect to happen? Steps to reproduce..."
                          rows={4}
                          className="w-full p-3 rounded-lg text-sm resize-none"
                          style={{
                            background: "rgba(255, 255, 255, 0.1)",
                            border: "1px solid rgba(255, 255, 255, 0.2)",
                            color: "rgba(200, 240, 200, 0.95)",
                          }}
                        />
                      </div>
                    </>
                  ) : (
                    <>
                      {/* Content URL */}
                      <div>
                        <label className="block text-sm font-medium mb-2" style={{ color: "rgba(200, 240, 200, 0.8)" }}>
                          Link to the content you want to report
                        </label>
                        <input
                          type="url"
                          value={contentUrl}
                          onChange={(e) => { setContentUrl(e.target.value); setError(null); }}
                          placeholder="https://shaderhouse.com/games/..."
                          className="w-full p-3 rounded-lg text-sm"
                          style={{
                            background: "rgba(255, 255, 255, 0.1)",
                            border: "1px solid rgba(255, 255, 255, 0.2)",
                            color: "rgba(200, 240, 200, 0.95)",
                          }}
                        />
                        <p className="text-xs mt-1" style={{ color: "rgba(200, 240, 200, 0.5)" }}>
                          Copy the URL from your browser when viewing the content
                        </p>
                      </div>

                      {/* Reason Selection */}
                      <div>
                        <label className="block text-sm font-medium mb-2" style={{ color: "rgba(200, 240, 200, 0.8)" }}>
                          Why are you reporting this?
                        </label>
                        <div className="space-y-2 max-h-40 overflow-y-auto">
                          {REPORT_REASONS.map((reason) => (
                            <button
                              key={reason.value}
                              onClick={() => { setSelectedReason(reason.value); setError(null); }}
                              className={`w-full text-left p-3 rounded-lg text-sm transition-all ${
                                selectedReason === reason.value ? "ring-2 ring-green-400" : ""
                              }`}
                              style={{
                                background: selectedReason === reason.value 
                                  ? "rgba(100, 200, 100, 0.2)" 
                                  : "rgba(255, 255, 255, 0.05)",
                                border: "1px solid rgba(255, 255, 255, 0.1)",
                                color: "rgba(200, 240, 200, 0.9)",
                              }}
                            >
                              {reason.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Description */}
                      <div>
                        <label className="block text-sm font-medium mb-2" style={{ color: "rgba(200, 240, 200, 0.8)" }}>
                          Additional details {selectedReason === "OTHER" ? "(required)" : "(optional)"}
                        </label>
                        <textarea
                          value={description}
                          onChange={(e) => { setDescription(e.target.value); setError(null); }}
                          placeholder="Provide more context about the issue..."
                          rows={3}
                          className="w-full p-3 rounded-lg text-sm resize-none"
                          style={{
                            background: "rgba(255, 255, 255, 0.1)",
                            border: "1px solid rgba(255, 255, 255, 0.2)",
                            color: "rgba(200, 240, 200, 0.95)",
                          }}
                        />
                      </div>
                    </>
                  )}

                  {/* Screenshot Upload */}
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: "rgba(200, 240, 200, 0.8)" }}>
                      Screenshots (optional, max 5)
                    </label>
                    
                    {/* Upload Button */}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    
                    <div className="flex flex-wrap gap-2 mb-2">
                      {screenshots.map((url, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={url}
                            alt={`Screenshot ${index + 1}`}
                            className="w-20 h-20 object-cover rounded-lg border"
                            style={{ borderColor: "rgba(200, 240, 200, 0.2)" }}
                          />
                          <button
                            onClick={() => removeScreenshot(index)}
                            className="absolute -top-2 -right-2 p-1 rounded-full bg-red-500/80 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Trash2 className="w-3 h-3 text-white" />
                          </button>
                        </div>
                      ))}
                      
                      {screenshots.length < 5 && (
                        <button
                          onClick={() => fileInputRef.current?.click()}
                          disabled={isUploading}
                          className="w-20 h-20 rounded-lg flex flex-col items-center justify-center gap-1 transition-colors"
                          style={{
                            background: "rgba(255, 255, 255, 0.05)",
                            border: "2px dashed rgba(200, 240, 200, 0.3)",
                          }}
                        >
                          {isUploading ? (
                            <Loader2 className="w-5 h-5 animate-spin" style={{ color: "rgba(200, 240, 200, 0.6)" }} />
                          ) : (
                            <>
                              <Upload className="w-5 h-5" style={{ color: "rgba(200, 240, 200, 0.6)" }} />
                              <span className="text-xs" style={{ color: "rgba(200, 240, 200, 0.5)" }}>Add</span>
                            </>
                          )}
                        </button>
                      )}
                    </div>
                    
                    <p className="text-xs" style={{ color: "rgba(200, 240, 200, 0.5)" }}>
                      Screenshots help us understand and fix issues faster
                    </p>
                  </div>

                  {/* Error */}
                  {error && (
                    <div className="p-3 rounded-lg" style={{ background: "rgba(239, 68, 68, 0.1)", border: "1px solid rgba(239, 68, 68, 0.3)" }}>
                      <p className="text-sm" style={{ color: "rgba(252, 165, 165, 0.9)" }}>{error}</p>
                    </div>
                  )}

                  {/* Buttons */}
                  <div className="flex gap-3">
                    <button
                      onClick={() => { setStep("type"); setSelectedReason(null); setBugCategory(null); setError(null); }}
                      className="px-4 py-2 rounded-lg text-sm font-medium"
                      style={{
                        background: "rgba(255, 255, 255, 0.1)",
                        border: "1px solid rgba(255, 255, 255, 0.2)",
                        color: "rgba(200, 240, 200, 0.9)",
                      }}
                    >
                      Back
                    </button>
                    <motion.button
                      onClick={handleSubmit}
                      disabled={isSubmitting || isUploading || (!isPlatformBug && (!selectedReason || !contentUrl.trim())) || (isPlatformBug && !description.trim())}
                      className="flex-1 py-2 rounded-lg font-medium flex items-center justify-center gap-2 disabled:opacity-50"
                      style={{
                        background: isPlatformBug 
                          ? "linear-gradient(135deg, rgba(251, 191, 36, 0.3) 0%, rgba(217, 119, 6, 0.2) 100%)"
                          : "linear-gradient(135deg, rgba(248, 113, 113, 0.3) 0%, rgba(220, 38, 38, 0.2) 100%)",
                        border: isPlatformBug 
                          ? "1px solid rgba(251, 191, 36, 0.5)"
                          : "1px solid rgba(248, 113, 113, 0.5)",
                        color: isPlatformBug 
                          ? "rgba(253, 230, 138, 0.95)"
                          : "rgba(254, 202, 202, 0.95)",
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
                          {isPlatformBug ? "Submit Bug Report" : "Submit Report"}
                        </>
                      )}
                    </motion.button>
                  </div>

                  <p className="text-xs text-center" style={{ color: "rgba(200, 240, 200, 0.5)" }}>
                    {isPlatformBug 
                      ? "Thank you for helping us improve Shader House!" 
                      : "False reports may result in action against your account."}
                  </p>
                </div>
              )}

              {step === "success" && (
                <div className="text-center py-6">
                  <div
                    className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                    style={{ background: "rgba(34, 197, 94, 0.2)" }}
                  >
                    <CheckCircle className="w-8 h-8 text-green-400" />
                  </div>
                  <h4 className="text-lg font-bold mb-2" style={{ color: "rgba(200, 240, 200, 0.95)" }}>
                    {isPlatformBug ? "Bug Report Submitted" : "Report Submitted"}
                  </h4>
                  <p className="text-sm mb-4" style={{ color: "rgba(200, 240, 200, 0.7)" }}>
                    {isPlatformBug 
                      ? "Thank you for helping us improve! Our team will investigate this issue."
                      : "Thank you for helping keep Shader House safe. Our team will review your report shortly."}
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
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
