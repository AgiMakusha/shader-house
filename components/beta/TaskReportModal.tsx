"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAudio } from "@/components/audio/AudioProvider";
import { useToast } from "@/hooks/useToast";
import {
  X,
  Upload,
  Send,
  Bug,
  Lightbulb,
  Gamepad2,
  FlaskConical,
  MessageSquare,
  Trophy,
  Sparkles,
} from "lucide-react";

interface Task {
  id: string;
  title: string;
  description: string;
  type: string;
  xpReward: number;
  rewardPoints: number;
  isOptional: boolean;
}

interface TaskReportModalProps {
  task: Task | null;
  gameId: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const getTaskTypeInfo = (type: string) => {
  switch (type) {
    case 'BUG_REPORT':
      return { icon: Bug, label: 'Bug Report', color: 'rgba(250, 150, 150, 0.9)' };
    case 'SUGGESTION':
      return { icon: Lightbulb, label: 'Suggestion', color: 'rgba(250, 220, 100, 0.9)' };
    case 'PLAY_LEVEL':
      return { icon: Gamepad2, label: 'Play Level', color: 'rgba(150, 200, 255, 0.9)' };
    case 'TEST_FEATURE':
      return { icon: FlaskConical, label: 'Test Feature', color: 'rgba(150, 250, 150, 0.9)' };
    default:
      return { icon: MessageSquare, label: 'Task', color: 'rgba(200, 240, 200, 0.7)' };
  }
};

export default function TaskReportModal({
  task,
  gameId,
  isOpen,
  onClose,
  onSuccess,
}: TaskReportModalProps) {
  const { play } = useAudio();
  const { success, error, ToastComponent } = useToast();
  const [report, setReport] = useState("");
  const [screenshot, setScreenshot] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!task || !isOpen) return null;

  const taskTypeInfo = getTaskTypeInfo(task.type);
  const TaskTypeIcon = taskTypeInfo.icon;

  const handleScreenshotUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        error("Screenshot must be less than 5MB");
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setScreenshot(reader.result as string);
        play("success");
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!report.trim() || report.trim().length < 20) {
      error("Please provide a detailed report (at least 20 characters)");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/beta/tasks/submit-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          taskId: task.id,
          gameId,
          report: report.trim(),
          screenshot: screenshot || undefined,
          deviceInfo: navigator.userAgent,
        }),
      });

      if (response.ok) {
        play("success");
        success("Task report submitted! Waiting for developer verification.");
        setReport("");
        setScreenshot("");
        onSuccess();
        onClose();
      } else {
        const data = await response.json();
        
        if (data.details && Array.isArray(data.details)) {
          const errorMessages = data.details.map((err: any) => err.message).join(', ');
          error(`Validation Error: ${errorMessages}`);
        } else {
          error(data.error || "Failed to submit report");
        }
        
        play("error");
      }
    } catch (err) {
      console.error("Error submitting report:", err);
      error("An error occurred while submitting your report");
      play("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        style={{ background: "rgba(0, 0, 0, 0.85)" }}
        onClick={onClose}
      >
        <motion.div
          className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-lg p-6"
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
          onClick={(e) => e.stopPropagation()}
          style={{
            background: "linear-gradient(135deg, rgba(20, 40, 60, 0.95) 0%, rgba(10, 20, 30, 0.98) 100%)",
            border: "1px solid rgba(150, 180, 255, 0.3)",
            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.5)",
          }}
        >
          {/* Header */}
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-start gap-3 flex-1">
              <TaskTypeIcon className="w-8 h-8 flex-shrink-0" style={{ color: taskTypeInfo.color }} />
              <div className="flex-1">
                <h2
                  className="text-xl font-bold pixelized mb-2"
                  style={{
                    color: "rgba(180, 220, 180, 0.95)",
                    textShadow: "0 0 8px rgba(120, 200, 120, 0.6), 1px 1px 0px rgba(0, 0, 0, 0.8)",
                  }}
                >
                  {task.title}
                </h2>
                <div className="flex items-center gap-3 text-xs mb-3">
                  <span
                    className="px-2 py-1 rounded"
                    style={{
                      background: `${taskTypeInfo.color.replace('0.9', '0.2')}`,
                      border: `1px solid ${taskTypeInfo.color.replace('0.9', '0.4')}`,
                      color: taskTypeInfo.color,
                    }}
                  >
                    {taskTypeInfo.label}
                  </span>
                  {task.isOptional && (
                    <span
                      className="px-2 py-1 rounded"
                      style={{
                        background: "rgba(250, 220, 100, 0.2)",
                        border: "1px solid rgba(250, 220, 100, 0.3)",
                        color: "rgba(250, 220, 100, 0.9)",
                      }}
                    >
                      Optional
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-4 text-xs mb-4">
                  <span className="flex items-center gap-1" style={{ color: "rgba(250, 220, 100, 0.8)" }}>
                    <Trophy className="w-3 h-3" />
                    {task.xpReward} XP
                  </span>
                  <span className="flex items-center gap-1" style={{ color: "rgba(150, 200, 255, 0.8)" }}>
                    <Sparkles className="w-3 h-3" />
                    {task.rewardPoints} pts
                  </span>
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg transition-all flex-shrink-0"
              style={{
                background: "rgba(200, 100, 100, 0.2)",
                border: "1px solid rgba(240, 150, 150, 0.3)",
              }}
              onMouseEnter={() => play("hover")}
            >
              <X className="w-5 h-5" style={{ color: "rgba(240, 200, 200, 0.95)" }} />
            </button>
          </div>

          {/* Task Description from Developer */}
          <div
            className="p-4 rounded-lg mb-6"
            style={{
              background: "rgba(100, 150, 255, 0.1)",
              border: "1px solid rgba(150, 180, 255, 0.3)",
            }}
          >
            <h3
              className="text-sm font-bold mb-2 pixelized"
              style={{ color: "rgba(150, 200, 255, 0.95)" }}
            >
              Task Instructions
            </h3>
            <p className="text-sm" style={{ color: "rgba(200, 240, 200, 0.8)", lineHeight: "1.6" }}>
              {task.description}
            </p>
          </div>

          {/* Report Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                className="block text-sm font-medium mb-2"
                style={{ color: "rgba(200, 240, 200, 0.7)" }}
              >
                Your Report <span style={{ color: "rgba(250, 100, 100, 0.9)" }}>*</span>
              </label>
              <textarea
                value={report}
                onChange={(e) => setReport(e.target.value)}
                placeholder="Describe what you did and what you found... (minimum 20 characters)"
                rows={6}
                className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 focus:outline-none focus:ring-2 focus:ring-white/40 transition-all resize-none"
                style={{ color: "rgba(200, 240, 200, 0.85)" }}
                required
              />
              <p className="text-xs mt-1" style={{ color: "rgba(200, 240, 200, 0.5)" }}>
                {report.length}/20 characters minimum
              </p>
            </div>

            {/* Screenshot Upload */}
            <div>
              <label
                className="block text-sm font-medium mb-2"
                style={{ color: "rgba(200, 240, 200, 0.7)" }}
              >
                Screenshot (optional)
              </label>
              <label
                className="flex items-center justify-center gap-2 p-4 rounded-lg border-2 border-dashed cursor-pointer transition-all"
                style={{
                  borderColor: screenshot ? "rgba(150, 250, 150, 0.4)" : "rgba(150, 180, 255, 0.3)",
                  background: screenshot ? "rgba(100, 200, 100, 0.1)" : "rgba(100, 150, 255, 0.05)",
                }}
              >
                <Upload className="w-5 h-5" style={{ color: "rgba(150, 200, 255, 0.9)" }} />
                <span className="text-sm" style={{ color: "rgba(200, 240, 200, 0.7)" }}>
                  {screenshot ? "Screenshot uploaded ✓" : "Click to upload proof"}
                </span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleScreenshotUpload}
                  className="hidden"
                />
              </label>
            </div>

            {/* Rewards Preview */}
            <div
              className="p-4 rounded-lg"
              style={{
                background: "rgba(100, 200, 100, 0.1)",
                border: "1px solid rgba(150, 250, 150, 0.3)",
              }}
            >
              <p className="text-xs mb-2" style={{ color: "rgba(200, 240, 200, 0.7)" }}>
                Upon developer verification, you'll earn:
              </p>
              <div className="flex items-center gap-4">
                <span
                  className="flex items-center gap-2 font-bold"
                  style={{ color: "rgba(250, 220, 100, 0.95)" }}
                >
                  <Trophy className="w-4 h-4" />
                  +{task.xpReward} XP
                </span>
                <span
                  className="flex items-center gap-2 font-bold"
                  style={{ color: "rgba(150, 200, 255, 0.95)" }}
                >
                  <Sparkles className="w-4 h-4" />
                  +{task.rewardPoints} pts
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={() => {
                  setReport("");
                  setScreenshot("");
                  onClose();
                  play("hover");
                }}
                className="flex-1 px-4 py-3 rounded-lg font-semibold text-sm transition-all"
                style={{
                  background: "rgba(200, 100, 100, 0.2)",
                  border: "1px solid rgba(240, 150, 150, 0.3)",
                  color: "rgba(240, 200, 200, 0.95)",
                }}
                onMouseEnter={() => play("hover")}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || report.trim().length < 20}
                className="flex-1 px-4 py-3 rounded-lg font-semibold text-sm transition-all flex items-center justify-center gap-2"
                style={{
                  background: isSubmitting || report.trim().length < 20
                    ? "rgba(100, 150, 255, 0.2)"
                    : "linear-gradient(135deg, rgba(100, 200, 100, 0.4) 0%, rgba(80, 180, 80, 0.3) 100%)",
                  border: "1px solid rgba(150, 250, 150, 0.4)",
                  color: "rgba(200, 240, 200, 0.95)",
                  opacity: isSubmitting || report.trim().length < 20 ? 0.6 : 1,
                  cursor: isSubmitting || report.trim().length < 20 ? "not-allowed" : "pointer",
                }}
                onMouseEnter={() => !isSubmitting && report.trim().length >= 20 && play("hover")}
              >
                <Send className="w-4 h-4" />
                {isSubmitting ? "Submitting..." : "Submit Report"}
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
      <ToastComponent />
    </AnimatePresence>
  );
}

