"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, XCircle, AlertCircle, Info, X } from "lucide-react";

export type ToastType = "success" | "error" | "warning" | "info";

interface ToastProps {
  message: string;
  type: ToastType;
  isOpen: boolean;
  onClose: () => void;
  duration?: number;
}

export function Toast({ message, type, isOpen, onClose, duration = 4000 }: ToastProps) {
  useEffect(() => {
    if (isOpen && duration > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [isOpen, duration, onClose]);

  const getIcon = () => {
    switch (type) {
      case "success":
        return <CheckCircle className="w-5 h-5" style={{ color: "rgba(150, 250, 150, 0.95)" }} />;
      case "error":
        return <XCircle className="w-5 h-5" style={{ color: "rgba(250, 150, 150, 0.95)" }} />;
      case "warning":
        return <AlertCircle className="w-5 h-5" style={{ color: "rgba(250, 220, 100, 0.95)" }} />;
      case "info":
        return <Info className="w-5 h-5" style={{ color: "rgba(150, 200, 255, 0.95)" }} />;
    }
  };

  const getColors = () => {
    switch (type) {
      case "success":
        return {
          bg: "rgba(100, 200, 100, 0.15)",
          border: "rgba(150, 250, 150, 0.4)",
          text: "rgba(200, 240, 200, 0.95)",
        };
      case "error":
        return {
          bg: "rgba(200, 100, 100, 0.15)",
          border: "rgba(250, 150, 150, 0.4)",
          text: "rgba(240, 200, 200, 0.95)",
        };
      case "warning":
        return {
          bg: "rgba(240, 220, 140, 0.15)",
          border: "rgba(250, 220, 100, 0.4)",
          text: "rgba(250, 240, 200, 0.95)",
        };
      case "info":
        return {
          bg: "rgba(100, 150, 255, 0.15)",
          border: "rgba(150, 200, 255, 0.4)",
          text: "rgba(200, 220, 255, 0.95)",
        };
    }
  };

  const colors = getColors();

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          className="fixed top-6 right-6 z-[9999] max-w-md"
          style={{
            background: `linear-gradient(135deg, ${colors.bg} 0%, rgba(20, 40, 60, 0.95) 100%)`,
            border: `1px solid ${colors.border}`,
            borderRadius: "12px",
            boxShadow: `0 8px 32px rgba(0, 0, 0, 0.5), 0 0 20px ${colors.border}`,
            backdropFilter: "blur(10px)",
          }}
        >
          <div className="flex items-start gap-3 p-4">
            <div className="flex-shrink-0 mt-0.5">{getIcon()}</div>
            <p
              className="flex-1 text-sm leading-relaxed"
              style={{
                color: colors.text,
                textShadow: "1px 1px 2px rgba(0, 0, 0, 0.8)",
              }}
            >
              {message}
            </p>
            <button
              onClick={onClose}
              className="flex-shrink-0 p-1 rounded transition-all hover:bg-white/10"
              style={{ color: colors.text }}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}






