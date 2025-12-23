"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import { GameCard, GameCardContent } from "@/components/game/GameCard";
import Particles from "@/components/fx/Particles";

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('No verification token provided');
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
          
          // Redirect to home after 3 seconds
          setTimeout(() => {
            router.push('/');
          }, 3000);
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
  }, [token, router]);

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
                      color: 'rgba(150, 250, 150, 0.95)',
                    }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                  >
                    {status === 'verifying' && 'Verifying Email'}
                    {status === 'success' && 'Email Verified!'}
                    {status === 'error' && 'Verification Failed'}
                  </motion.h1>

                  {/* Message */}
                  <motion.p
                    className="text-sm"
                    style={{ color: 'rgba(200, 240, 200, 0.8)' }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.6, delay: 0.5 }}
                  >
                    {status === 'verifying' && 'Please wait while we verify your email address...'}
                    {status === 'success' && (
                      <>
                        {message}
                        <br />
                        <span className="text-xs opacity-70">Redirecting you to the home page...</span>
                      </>
                    )}
                    {status === 'error' && message}
                  </motion.p>

                  {/* Actions */}
                  {status === 'error' && (
                    <motion.div
                      className="pt-4"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.6, delay: 0.6 }}
                    >
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

