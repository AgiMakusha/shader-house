"use client";

import { motion } from "framer-motion";
import { calculatePasswordStrength, type PasswordStrength as PasswordStrengthType } from "@/lib/auth/validation";
import { useMemo } from "react";

interface PasswordStrengthProps {
  password: string;
  className?: string;
}

export function PasswordStrength({ password, className = "" }: PasswordStrengthProps) {
  const strength = useMemo(() => calculatePasswordStrength(password), [password]);

  if (!password) return null;

  const colors = {
    weak: "bg-red-500",
    fair: "bg-orange-500",
    good: "bg-yellow-500",
    strong: "bg-green-500",
  };

  const textColors = {
    weak: "text-red-400",
    fair: "text-orange-400",
    good: "text-yellow-400",
    strong: "text-green-400",
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Strength bar */}
      <div className="flex gap-1">
        {[0, 1, 2, 3].map((index) => (
          <motion.div
            key={index}
            className="h-1.5 flex-1 rounded-full bg-white/10"
            initial={{ opacity: 0.3 }}
            animate={{
              opacity: index <= strength.score ? 1 : 0.3,
            }}
            transition={{ duration: 0.3 }}
          >
            <motion.div
              className={`h-full rounded-full ${colors[strength.label]}`}
              initial={{ width: "0%" }}
              animate={{ width: index <= strength.score ? "100%" : "0%" }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            />
          </motion.div>
        ))}
      </div>

      {/* Strength label */}
      <div className="flex items-center justify-between text-xs">
        <span className={`font-medium capitalize ${textColors[strength.label]}`}>
          {strength.label}
        </span>
        {strength.feedback.length > 0 && (
          <span className="text-white/50">
            {strength.feedback.length} improvement{strength.feedback.length !== 1 ? "s" : ""}
          </span>
        )}
      </div>

      {/* Feedback (optional, expandable) */}
      {strength.feedback.length > 0 && strength.score < 3 && (
        <motion.ul
          className="space-y-1 text-xs text-white/60"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          transition={{ duration: 0.2 }}
        >
          {strength.feedback.slice(0, 3).map((item, index) => (
            <li key={index} className="flex items-center gap-1.5">
              <span className="text-white/30">•</span>
              {item}
            </li>
          ))}
        </motion.ul>
      )}
    </div>
  );
}

