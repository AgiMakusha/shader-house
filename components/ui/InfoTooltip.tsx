"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

interface InfoTooltipProps {
  content: string;
  children?: React.ReactNode;
}

export function InfoTooltip({ content, children }: InfoTooltipProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative inline-block">
      <button
        type="button"
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
        onFocus={() => setIsOpen(true)}
        onBlur={() => setIsOpen(false)}
        className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-white/10 border border-white/20 hover:bg-white/20 hover:border-white/30 transition-all ml-2"
        aria-label="More information"
      >
        {children || (
          <svg
            className="w-3 h-3"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            style={{ color: 'rgba(200, 240, 200, 0.8)' }}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute z-50 left-0 bottom-full mb-2 w-64 p-3 rounded-lg bg-black/90 border border-white/20 backdrop-blur-sm"
            style={{
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.5)',
            }}
          >
            <p
              className="text-xs leading-relaxed"
              style={{
                color: 'rgba(200, 240, 200, 0.9)',
                textShadow: '0 1px 2px rgba(0, 0, 0, 0.8)',
              }}
            >
              {content}
            </p>
            {/* Arrow */}
            <div
              className="absolute left-6 -bottom-1 w-2 h-2 bg-black/90 border-r border-b border-white/20 transform rotate-45"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

