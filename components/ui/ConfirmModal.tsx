"use client";

import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle, CheckCircle, XCircle } from "lucide-react";

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: "info" | "success" | "warning" | "danger";
}

export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  type = "info",
}: ConfirmModalProps) {
  const getColors = () => {
    switch (type) {
      case "success":
        return {
          border: "rgba(150, 250, 150, 0.4)",
          icon: "rgba(150, 250, 150, 0.95)",
          button: "rgba(100, 200, 100, 0.2)",
          buttonHover: "rgba(100, 200, 100, 0.3)",
        };
      case "warning":
        return {
          border: "rgba(250, 220, 100, 0.4)",
          icon: "rgba(250, 220, 100, 0.95)",
          button: "rgba(240, 220, 140, 0.2)",
          buttonHover: "rgba(240, 220, 140, 0.3)",
        };
      case "danger":
        return {
          border: "rgba(250, 150, 150, 0.4)",
          icon: "rgba(250, 150, 150, 0.95)",
          button: "rgba(200, 100, 100, 0.2)",
          buttonHover: "rgba(200, 100, 100, 0.3)",
        };
      default:
        return {
          border: "rgba(150, 200, 255, 0.4)",
          icon: "rgba(150, 200, 255, 0.95)",
          button: "rgba(100, 150, 255, 0.2)",
          buttonHover: "rgba(100, 150, 255, 0.3)",
        };
    }
  };

  const getIcon = () => {
    const colors = getColors();
    switch (type) {
      case "success":
        return <CheckCircle className="w-12 h-12" style={{ color: colors.icon }} />;
      case "warning":
      case "danger":
        return <AlertCircle className="w-12 h-12" style={{ color: colors.icon }} />;
      default:
        return <AlertCircle className="w-12 h-12" style={{ color: colors.icon }} />;
    }
  };

  const colors = getColors();

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{ background: "rgba(0, 0, 0, 0.85)" }}
          onClick={onClose}
        >
          <motion.div
            className="w-full max-w-md rounded-lg p-6"
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "linear-gradient(135deg, rgba(20, 40, 60, 0.95) 0%, rgba(10, 20, 30, 0.98) 100%)",
              border: `1px solid ${colors.border}`,
              boxShadow: `0 8px 32px rgba(0, 0, 0, 0.5), 0 0 20px ${colors.border}`,
              backdropFilter: "blur(10px)",
            }}
          >
            {/* Icon */}
            <div className="flex justify-center mb-4">
              {getIcon()}
            </div>

            {/* Title */}
            <h3
              className="text-xl font-bold text-center mb-3"
              style={{
                color: "rgba(220, 240, 255, 0.95)",
                textShadow: "2px 2px 4px rgba(0, 0, 0, 0.8)",
              }}
            >
              {title}
            </h3>

            {/* Message */}
            <p
              className="text-center mb-6 leading-relaxed"
              style={{
                color: "rgba(200, 220, 240, 0.85)",
                textShadow: "1px 1px 2px rgba(0, 0, 0, 0.8)",
              }}
            >
              {message}
            </p>

            {/* Buttons */}
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2.5 rounded-lg font-medium transition-all"
                style={{
                  background: "rgba(100, 100, 120, 0.2)",
                  border: "1px solid rgba(150, 150, 180, 0.3)",
                  color: "rgba(200, 220, 240, 0.9)",
                  textShadow: "1px 1px 2px rgba(0, 0, 0, 0.8)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "rgba(100, 100, 120, 0.3)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "rgba(100, 100, 120, 0.2)";
                }}
              >
                {cancelText}
              </button>

              <button
                onClick={handleConfirm}
                className="flex-1 px-4 py-2.5 rounded-lg font-medium transition-all"
                style={{
                  background: colors.button,
                  border: `1px solid ${colors.border}`,
                  color: "rgba(220, 240, 255, 0.95)",
                  textShadow: "1px 1px 2px rgba(0, 0, 0, 0.8)",
                  boxShadow: `0 0 10px ${colors.border}`,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = colors.buttonHover;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = colors.button;
                }}
              >
                {confirmText}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

