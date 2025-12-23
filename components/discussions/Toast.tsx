'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertCircle, CheckCircle, Info } from 'lucide-react';
import { useEffect } from 'react';

interface ToastProps {
  message: string;
  type: 'error' | 'success' | 'info';
  onClose: () => void;
  duration?: number;
}

export function Toast({ message, type, onClose, duration = 8000 }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const styles = {
    error: {
      background: 'rgba(40, 20, 20, 0.95)',
      border: '1px solid rgba(255, 100, 100, 0.5)',
      color: 'rgba(255, 150, 150, 0.95)',
      icon: AlertCircle,
    },
    success: {
      background: 'rgba(20, 40, 20, 0.95)',
      border: '1px solid rgba(100, 200, 100, 0.5)',
      color: 'rgba(150, 240, 150, 0.95)',
      icon: CheckCircle,
    },
    info: {
      background: 'rgba(20, 30, 40, 0.95)',
      border: '1px solid rgba(100, 150, 200, 0.5)',
      color: 'rgba(150, 200, 250, 0.95)',
      icon: Info,
    },
  };

  const style = styles[type];
  const Icon = style.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: -20, x: '-50%' }}
      animate={{ opacity: 1, y: 0, x: '-50%' }}
      exit={{ opacity: 0, y: -20, x: '-50%' }}
      className="fixed top-4 left-1/2 z-50 flex items-center gap-3 px-6 py-4 rounded-lg shadow-2xl max-w-md"
      style={{
        background: style.background,
        border: style.border,
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)',
      }}
    >
      <Icon size={20} style={{ color: style.color, flexShrink: 0 }} />
      <p
        className="flex-grow font-semibold"
        style={{ color: style.color }}
      >
        {message}
      </p>
      <button
        onClick={onClose}
        className="flex-shrink-0 p-1 rounded hover:bg-white/10 transition-colors"
      >
        <X size={16} style={{ color: style.color }} />
      </button>
    </motion.div>
  );
}





