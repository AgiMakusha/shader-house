"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import { GameCard, GameCardContent } from "@/components/game/GameCard";
import Particles from "@/components/fx/Particles";
import { Mail, AlertCircle } from "lucide-react";

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const required = searchParams.get("required") === "true";
  
  const [status, setStatus] = useState<'verifying' | 'success' | 'error' | 'pending'>(
    token ? 'verifying' : required ? 'pending' : 'error'
  );
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  // Fetch user session to get email
  useEffect(() => {
    const fetchSession = async () => {
      try {
        const response = await fetch('/api/auth/session');
        if (response.ok) {
          const data = await response.json();
          if (data.user?.email) {
            setUserEmail(data.user.email);
          }
        }
      } catch (error) {
        console.error('Failed to fetch session:', error);
      }
    };
    fetchSession();
  }, []);

  useEffect(() => {
    if (!token) {
      if (required) {
        setStatus('pending');
        setMessage('Please verify your email address to access the platform.');
      } else {
        setStatus('error');
        setMessage('No verification token provided');
      }
      return;
    }

    const verifyEmail = async () => {
      try {
        const response = await fetch('/api/auth/verify-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token }),
        });

        const data = await response.json();

        if (response.ok) {
          setStatus('success');
          setMessage('Your email has been verified successfully!');
          
          // Refresh session to get updated verification status
          await fetch('/api/auth/session', { method: 'GET' });
          
          // Redirect to appropriate page after 2 seconds
          setTimeout(() => {
            router.push('/');
          }, 2000);
        } else {
          setStatus('error');
          setMessage(data.error || 'Failed to verify email');
        }
      } catch (error) {
        setStatus('error');
        setMessage('An error occurred during verification');
      }
    };

    verifyEmail();
  }, [token, required, router]);

  const handleResendEmail = async () => {
    setSending(true);
    try {
      const response = await fetch('/api/auth/send-verification', {
        method: 'POST',
      });

      if (response.ok) {
        setEmailSent(true);
        setTimeout(() => setEmailSent(false), 5000);
      } else {
        const data = await response.json();
        setMessage(data.error || 'Failed to send verification email');
      }
    } catch (error) {
      setMessage('An error occurred while sending verification email');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-dvh relative overflow-hidden">
      <Particles />
      
      <motion.main 
        className="relative z-10 flex min-h-dvh flex-col items-center justify-center p-6"
        initial={{ opacity: 0, y: 6 }}
        animate={{ 
          opacity: 1, 
          y: 0, 
          transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } 
        }}
      >
        <div className="w-full max-w-md space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <GameCard>
              <GameCardContent className="p-8">
                <div className="text-center space-y-6">
                  {/* Icon */}
                  <motion.div
                    className="flex justify-center"
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.4, delay: 0.3 }}
                  >
                    {status === 'verifying' && (
                      <div className="w-16 h-16 rounded-full border-4 border-white/20 border-t-white/80 animate-spin" />
                    )}
                    {status === 'pending' && (
                      <div className="w-16 h-16 rounded-full bg-yellow-500/20 flex items-center justify-center">
                        <AlertCircle className="w-10 h-10" style={{ color: 'rgba(255, 200, 100, 0.9)' }} />
                      </div>
                    )}
                    {status === 'success' && (
                      <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center">
                        <svg className="w-10 h-10 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    )}
                    {status === 'error' && (
                      <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center">
                        <svg className="w-10 h-10 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </div>
                    )}
                  </motion.div>

                  {/* Title */}
                  <motion.h1
                    className="text-2xl font-bold tracking-wider uppercase pixelized"
                    style={{
                      textShadow: `
                        0 0 10px rgba(100, 200, 100, 0.6),
                        0 0 20px rgba(80, 160, 80, 0.4),
                        2px 2px 0px rgba(0, 0, 0, 0.8)
                      `,
                      color: status === 'pending' 
                        ? 'rgba(255, 200, 100, 0.95)' 
                        : 'rgba(150, 250, 150, 0.95)',
                    }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                  >
                    {status === 'verifying' && 'Verifying Email'}
                    {status === 'pending' && 'Email Verification Required'}
                    {status === 'success' && 'Email Verified!'}
                    {status === 'error' && 'Verification Failed'}
                  </motion.h1>

                  {/* Message */}
                  <motion.div
                    className="text-sm space-y-3"
                    style={{ color: 'rgba(200, 240, 200, 0.8)' }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.6, delay: 0.5 }}
                  >
                    {status === 'verifying' && <p>Please wait while we verify your email address...</p>}
                    {status === 'pending' && (
                      <>
                        <p className="font-semibold" style={{ color: 'rgba(255, 220, 150, 0.95)' }}>
                          You must verify your email address before accessing the platform.
                        </p>
                        {userEmail && (
                          <p className="text-xs">
                            We sent a verification link to <strong>{userEmail}</strong>
                          </p>
                        )}
                        <p className="text-xs opacity-70">
                          Check your inbox (and spam folder) for the verification email.
                        </p>
                      </>
                    )}
                    {status === 'success' && (
                      <>
                        <p>{message}</p>
                        <p className="text-xs opacity-70">Redirecting you to the platform...</p>
                      </>
                    )}
                    {status === 'error' && <p>{message}</p>}
                  </motion.div>

                  {/* Actions */}
                  {(status === 'pending' || status === 'error') && (
                    <motion.div
                      className="pt-4 space-y-3"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.6, delay: 0.6 }}
                    >
                      {status === 'pending' && (
                        <button
                          onClick={handleResendEmail}
                          disabled={sending || emailSent}
                          className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-medium text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                          style={{
                            background: emailSent 
                              ? 'rgba(100, 200, 100, 0.2)' 
                              : 'rgba(255, 200, 100, 0.2)',
                            border: emailSent
                              ? '1px solid rgba(150, 255, 150, 0.3)'
                              : '1px solid rgba(255, 200, 100, 0.3)',
                            color: emailSent
                              ? 'rgba(200, 255, 200, 0.95)'
                              : 'rgba(255, 220, 150, 0.95)',
                          }}
                        >
                          <Mail size={16} />
                          {sending ? 'Sending...' : emailSent ? 'Verification email sent!' : 'Resend verification email'}
                        </button>
                      )}
                      {status === 'error' && (
                        <Link
                          href="/login"
                          className="inline-block px-6 py-3 rounded-lg font-medium text-sm transition-all"
                          style={{
                            background: 'rgba(100, 200, 100, 0.2)',
                            border: '1px solid rgba(200, 240, 200, 0.3)',
                            color: 'rgba(200, 240, 200, 0.9)',
                          }}
                        >
                          Back to Login
                        </Link>
                      )}
                    </motion.div>
                  )}
                </div>
              </GameCardContent>
            </GameCard>
          </motion.div>
        </div>
      </motion.main>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-dvh relative overflow-hidden flex items-center justify-center">
        <Particles />
        <div className="text-xl font-semibold text-white">Loading...</div>
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  );
}

