"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle, Mail, X } from "lucide-react";

interface EmailVerificationBannerProps {
  email?: string;
  onResend?: () => void;
}

export function EmailVerificationBanner({ email, onResend }: EmailVerificationBannerProps) {
  const [visible, setVisible] = useState(true);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const handleResend = async () => {
    setSending(true);
    try {
      const response = await fetch('/api/auth/send-verification', {
        method: 'POST',
      });

      if (response.ok) {
        setSent(true);
        setTimeout(() => setSent(false), 5000);
      }
    } catch (error) {
      console.error('Failed to resend verification email:', error);
    } finally {
      setSending(false);
    }
  };

  if (!visible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="relative w-full p-4 mb-4 rounded-lg border"
        style={{
          background: 'linear-gradient(135deg, rgba(200, 140, 60, 0.15) 0%, rgba(180, 120, 40, 0.1) 100%)',
          borderColor: 'rgba(255, 200, 100, 0.3)',
        }}
      >
        <button
          onClick={() => setVisible(false)}
          className="absolute top-2 right-2 p-1 rounded hover:bg-white/10 transition-colors"
          style={{ color: 'rgba(255, 220, 150, 0.6)' }}
        >
          <X size={16} />
        </button>

        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 mt-0.5">
            <AlertCircle 
              size={20} 
              style={{ 
                color: 'rgba(255, 200, 100, 0.9)',
                filter: 'drop-shadow(0 0 4px rgba(255, 200, 100, 0.4))'
              }} 
            />
          </div>
          
          <div className="flex-1">
            <h3 
              className="text-sm font-semibold mb-1"
              style={{ color: 'rgba(255, 220, 150, 0.95)' }}
            >
              Email Verification Required
            </h3>
            <p 
              className="text-xs mb-3"
              style={{ color: 'rgba(255, 220, 150, 0.8)' }}
            >
              Please verify your email address to access all features. {email && `We sent a verification link to ${email}.`}
            </p>

            <button
              onClick={handleResend}
              disabled={sending || sent}
              className="flex items-center gap-2 px-3 py-1.5 rounded text-xs font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                background: sent 
                  ? 'rgba(100, 200, 100, 0.2)' 
                  : 'rgba(255, 200, 100, 0.2)',
                border: sent
                  ? '1px solid rgba(150, 255, 150, 0.3)'
                  : '1px solid rgba(255, 200, 100, 0.3)',
                color: sent
                  ? 'rgba(200, 255, 200, 0.95)'
                  : 'rgba(255, 220, 150, 0.95)',
              }}
            >
              <Mail size={14} />
              {sending ? 'Sending...' : sent ? 'Verification email sent!' : 'Resend verification email'}
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

export function useEmailVerification() {
  const [user, setUser] = useState<{ emailVerified: boolean; email: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const response = await fetch('/api/auth/session');
        if (response.ok) {
          const data = await response.json();
          setUser(data.user);
        }
      } catch (error) {
        console.error('Failed to fetch session:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSession();
  }, []);

  return { user, loading, needsVerification: user && !user.emailVerified };
}

