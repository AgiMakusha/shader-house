"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Sparkles, Gamepad2, Crown, Shield } from "lucide-react";
import Particles from "@/components/fx/Particles";
import { useAudio } from "@/components/audio/AudioProvider";
import { PricingCard } from "@/components/subscriptions/PricingCard";
import { FeatureComparison } from "@/components/subscriptions/FeatureComparison";
import { SUBSCRIPTION_PLANS } from "@/lib/subscriptions/types";

export default function MembershipPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { play } = useAudio();
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [showComparison, setShowComparison] = useState(false);
  const [showDowngradeConfirm, setShowDowngradeConfirm] = useState(false);
  const [showUpgradeConfirm, setShowUpgradeConfirm] = useState(false);
  const [showProcessing, setShowProcessing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [processingType, setProcessingType] = useState<'upgrade' | 'downgrade'>('upgrade');
  const [selectedPlanId, setSelectedPlanId] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Detect if user is new (FREE tier and no subscription history)
  const isNewUser = user?.subscriptionTier === 'FREE' && 
                    user?.subscriptionStatus === 'INACTIVE' && 
                    !user?.subscriptionStart;

  useEffect(() => {
    // Check for success parameter from Stripe redirect (production mode)
    const success = searchParams.get('success');
    if (success === 'true') {
      // Show success modal for Stripe payment completion
      setProcessingType('upgrade');
      setShowSuccess(true);
      play("success");
      
      // Redirect to profile after showing success
      setTimeout(() => {
        window.location.href = '/profile/gamer';
      }, 2500);
      
      // Clean up URL
      window.history.replaceState({}, '', '/membership');
    }

    // Check authentication
    const checkAuth = async () => {
      try {
        const response = await fetch("/api/auth/me");
        if (response.ok) {
          const data = await response.json();
          setUser(data.user);
          
          // Track user journey
          const isNew = data.user?.subscriptionTier === 'FREE' && 
                       data.user?.subscriptionStatus === 'INACTIVE' && 
                       !data.user?.subscriptionStart;
          
          if (isNew) {
            console.log('📊 Analytics: onboarding_view_membership');
            // TODO: Add your analytics tracking here
            // trackEvent('onboarding_view_membership', { userId: data.user.id });
          } else {
            console.log('📊 Analytics: subscription_management_view');
            // TODO: Add your analytics tracking here
            // trackEvent('subscription_management_view', { 
            //   userId: data.user.id, 
            //   currentTier: data.user.subscriptionTier 
            // });
          }
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [router, searchParams, play]);

  const handleDowngrade = async () => {
    setShowDowngradeConfirm(false);
    setProcessingType('downgrade');
    setShowProcessing(true);
    setIsProcessing(true);

    try {
      const response = await fetch('/api/subscriptions/cancel', {
        method: 'POST',
      });

      if (response.ok) {
        play("success");
        // Small delay to show the processing modal, then success, then redirect
        setTimeout(() => {
          setShowProcessing(false);
          setShowSuccess(true);
          // Redirect after showing success
          setTimeout(() => {
            window.location.href = '/profile/gamer';
          }, 2000);
        }, 1000);
      } else {
        play("error");
        const data = await response.json();
        setErrorMessage(data.error || 'Failed to downgrade. Please try again.');
        setShowProcessing(false);
        setIsProcessing(false);
      }
    } catch (error) {
      console.error('Error downgrading:', error);
      play("error");
      setErrorMessage('An error occurred. Please try again.');
      setShowProcessing(false);
      setIsProcessing(false);
    }
  };

  const handleUpgrade = async () => {
    setShowUpgradeConfirm(false);
    setProcessingType('upgrade');
    setShowProcessing(true);
    setIsProcessing(true);

    // Track upgrade initiation
    if (isNewUser) {
      console.log(`📊 Analytics: onboarding_upgrade_initiated - ${selectedPlanId}`);
      // TODO: trackEvent('onboarding_upgrade_initiated', { 
      //   userId: user?.id, 
      //   planId: selectedPlanId 
      // });
    } else {
      console.log(`📊 Analytics: subscription_upgrade_initiated - ${selectedPlanId}`);
      // TODO: trackEvent('subscription_upgrade_initiated', { 
      //   userId: user?.id, 
      //   fromTier: user?.subscriptionTier,
      //   toTier: selectedPlanId 
      // });
    }

    try {
      const response = await fetch('/api/subscriptions/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tier: selectedPlanId }),
      });

      const data = await response.json();

      if (response.ok) {
        // Check if it's a demo mode success or Stripe URL
        if (data.success) {
          // Demo mode - show success modal
          play("success");
          
          // Track successful upgrade
          if (isNewUser) {
            console.log('📊 Analytics: onboarding_completed_paid');
            // TODO: trackEvent('onboarding_completed_paid', { 
            //   userId: user?.id, 
            //   planId: selectedPlanId 
            // });
          } else {
            console.log('📊 Analytics: subscription_upgraded');
            // TODO: trackEvent('subscription_upgraded', { 
            //   userId: user?.id, 
            //   planId: selectedPlanId 
            // });
          }
          
          setTimeout(() => {
            setShowProcessing(false);
            setShowSuccess(true);
            // Redirect after showing success
            setTimeout(() => {
              window.location.href = '/profile/gamer';
            }, 2000);
          }, 1000);
        } else if (data.url) {
          // Production Stripe checkout
          console.log('📊 Analytics: redirecting_to_stripe_checkout');
          // TODO: trackEvent('stripe_checkout_redirect', { 
          //   userId: user?.id, 
          //   planId: selectedPlanId 
          // });
          play("success");
          setTimeout(() => {
            window.location.href = data.url;
          }, 1000);
        }
      } else {
        play("error");
        setErrorMessage(data.error || 'Failed to initiate checkout. Please try again.');
        setShowProcessing(false);
        setIsProcessing(false);
      }
    } catch (error) {
      console.error('Error upgrading:', error);
      play("error");
      setErrorMessage('An error occurred. Please try again.');
      setShowProcessing(false);
      setIsProcessing(false);
    }
  };

  const handleSelectPlan = async (planId: string) => {
    if (!user && planId !== 'FREE') {
      router.push('/login?redirect=/membership');
      return;
    }

    setIsProcessing(true);
    play("success");

    // Track user journey
    if (isNewUser) {
      console.log(`📊 Analytics: onboarding_plan_selected - ${planId}`);
      // TODO: Add your analytics tracking here
      // trackEvent('onboarding_plan_selected', { 
      //   userId: user?.id, 
      //   planId,
      //   isNewUser: true 
      // });
    } else {
      console.log(`📊 Analytics: subscription_plan_changed - ${planId}`);
      // TODO: Add your analytics tracking here
      // trackEvent('subscription_plan_changed', { 
      //   userId: user?.id, 
      //   fromTier: user?.subscriptionTier,
      //   toTier: planId 
      // });
    }

    try {
      if (planId === 'FREE') {
        // Free tier - cancel subscription if user has one
        if (user && user.subscriptionTier !== 'FREE') {
          setShowDowngradeConfirm(true);
          setIsProcessing(false);
          return;
        } else if (user) {
          // Track successful free tier selection
          if (isNewUser) {
            console.log('📊 Analytics: onboarding_completed_free');
            // TODO: trackEvent('onboarding_completed_free', { userId: user.id });
          }
          const userRole = user.role?.toUpperCase();
          router.push(userRole === 'DEVELOPER' ? '/profile/developer' : '/profile/gamer');
        } else {
          router.push('/register');
        }
        setIsProcessing(false);
        return;
      } else {
        // Paid tiers - show confirmation modal
        setSelectedPlanId(planId);
        setShowUpgradeConfirm(true);
        setIsProcessing(false);
        return;
      }
    } catch (error) {
      console.error('Error selecting plan:', error);
      play("error");
      setErrorMessage('An error occurred. Please try again.');
      
      // Track error
      console.log('📊 Analytics: plan_selection_error', error);
      // TODO: trackEvent('plan_selection_error', { 
      //   userId: user?.id, 
      //   planId, 
      //   error: error.message 
      // });
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-dvh relative overflow-hidden flex items-center justify-center">
        <Particles />
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <div className="text-xl font-semibold text-white">
            Loading...
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-dvh relative overflow-hidden">
      <Particles />
      
      <motion.main 
        className="relative z-10 flex min-h-dvh flex-col items-center justify-start p-6 pt-12"
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Error Message */}
        {errorMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-4xl mb-6 p-4 rounded-lg pixelized relative"
            style={{
              background: 'rgba(180, 60, 60, 0.15)',
              border: '1px solid rgba(255, 120, 120, 0.3)',
              color: 'rgba(255, 180, 180, 0.95)',
              textShadow: '0 1px 2px rgba(0, 0, 0, 0.6)',
            }}
          >
            <button
              onClick={() => setErrorMessage('')}
              className="absolute top-2 right-2 w-6 h-6 flex items-center justify-center rounded hover:bg-white/10 transition-all"
              style={{ color: 'rgba(255, 180, 180, 0.95)' }}
            >
              ✕
            </button>
            <div className="text-center pr-6">{errorMessage}</div>
          </motion.div>
        )}

        {/* Downgrade Confirmation Modal */}
        {showDowngradeConfirm && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-6"
            style={{ background: 'rgba(0, 0, 0, 0.8)' }}
            onClick={() => setShowDowngradeConfirm(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="rounded-lg p-8 border max-w-md w-full"
              style={{
                background: "linear-gradient(145deg, rgba(30, 50, 40, 0.95) 0%, rgba(20, 40, 30, 0.98) 100%)",
                borderColor: "rgba(120, 200, 120, 0.35)",
                boxShadow: "0 8px 32px rgba(0, 0, 0, 0.6)",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <h3
                className="text-2xl font-bold tracking-wider uppercase pixelized mb-4 text-center"
                style={{
                  textShadow: "0 0 8px rgba(255, 120, 120, 0.6), 1px 1px 0px rgba(0, 0, 0, 0.8)",
                  color: "rgba(255, 180, 180, 0.95)",
                }}
              >
                Confirm Downgrade
              </h3>
              <p
                className="text-sm pixelized mb-6 text-center"
                style={{ color: "rgba(200, 240, 200, 0.85)" }}
              >
                Are you sure you want to downgrade to Free Access? You will lose all premium features immediately.
              </p>
              <div className="flex gap-4">
                <button
                  onClick={() => setShowDowngradeConfirm(false)}
                  className="flex-1 px-6 py-3 rounded-lg font-bold uppercase tracking-wider pixelized text-sm transition-all hover:scale-[1.02]"
                  style={{
                    background: "linear-gradient(135deg, rgba(120, 200, 120, 0.35) 0%, rgba(100, 180, 100, 0.25) 100%)",
                    border: "1px solid rgba(140, 220, 140, 0.4)",
                    color: "rgba(200, 255, 200, 0.95)",
                    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.3)",
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleDowngrade}
                  disabled={isProcessing}
                  className="flex-1 px-6 py-3 rounded-lg font-bold uppercase tracking-wider pixelized text-sm transition-all hover:scale-[1.02] disabled:opacity-50"
                  style={{
                    background: "rgba(200, 100, 100, 0.3)",
                    border: "1px solid rgba(240, 150, 150, 0.4)",
                    color: "rgba(255, 180, 180, 0.95)",
                    boxShadow: "0 4px 12px rgba(150, 50, 50, 0.3)",
                  }}
                >
                  {isProcessing ? 'Processing...' : 'Downgrade'}
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* Upgrade Confirmation Modal */}
        {showUpgradeConfirm && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-6"
            style={{ background: 'rgba(0, 0, 0, 0.8)' }}
            onClick={() => setShowUpgradeConfirm(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="rounded-lg p-8 border max-w-md w-full"
              style={{
                background: "linear-gradient(145deg, rgba(60, 50, 30, 0.95) 0%, rgba(50, 40, 20, 0.98) 100%)",
                borderColor: "rgba(220, 200, 120, 0.4)",
                boxShadow: "0 8px 32px rgba(150, 120, 50, 0.4)",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <h3
                className="text-2xl font-bold tracking-wider uppercase pixelized mb-4 text-center"
                style={{
                  textShadow: "0 0 8px rgba(220, 180, 80, 0.6), 1px 1px 0px rgba(0, 0, 0, 0.8)",
                  color: "rgba(240, 220, 140, 0.95)",
                }}
              >
                Upgrade to Creator Support Pass
              </h3>
              <p
                className="text-sm pixelized mb-4 text-center"
                style={{ color: "rgba(230, 210, 150, 0.85)" }}
              >
                You're about to upgrade to Creator Support Pass for $14.99/month.
              </p>
              <div
                className="rounded-lg p-4 mb-6"
                style={{
                  background: "rgba(60, 50, 30, 0.3)",
                  border: "1px solid rgba(220, 200, 120, 0.3)",
                }}
              >
                <p
                  className="text-xs pixelized mb-2 font-bold"
                  style={{ color: "rgba(240, 220, 140, 0.95)" }}
                >
                  You'll get:
                </p>
                <ul className="text-xs pixelized space-y-1" style={{ color: "rgba(230, 210, 150, 0.85)" }}>
                  <li>✓ Unlimited access to entire game library</li>
                  <li>✓ Support indie developers directly</li>
                  <li>✓ Beta builds & exclusive content</li>
                  <li>✓ Game test access</li>
                  <li>✓ Achievements & badges</li>
                </ul>
              </div>
              <div className="flex gap-4">
                <button
                  onClick={() => setShowUpgradeConfirm(false)}
                  className="flex-1 px-6 py-3 rounded-lg font-bold uppercase tracking-wider pixelized text-sm transition-all hover:scale-[1.02]"
                  style={{
                    background: "rgba(100, 100, 100, 0.3)",
                    border: "1px solid rgba(150, 150, 150, 0.4)",
                    color: "rgba(200, 200, 200, 0.95)",
                    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.3)",
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpgrade}
                  disabled={isProcessing}
                  className="flex-1 px-6 py-3 rounded-lg font-bold uppercase tracking-wider pixelized text-sm transition-all hover:scale-[1.02] disabled:opacity-50"
                  style={{
                    background: "linear-gradient(135deg, rgba(200, 170, 80, 0.4) 0%, rgba(180, 150, 60, 0.3) 100%)",
                    border: "1px solid rgba(240, 220, 140, 0.5)",
                    color: "rgba(255, 245, 200, 0.95)",
                    boxShadow: "0 4px 12px rgba(150, 120, 50, 0.4)",
                  }}
                >
                  {isProcessing ? 'Processing...' : 'Upgrade Now'}
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* Success Modal */}
        {showSuccess && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-6"
            style={{ background: 'rgba(0, 0, 0, 0.9)' }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="rounded-lg p-12 border max-w-md w-full text-center"
              style={
                processingType === 'upgrade'
                  ? {
                      background: "linear-gradient(145deg, rgba(60, 50, 30, 0.95) 0%, rgba(50, 40, 20, 0.98) 100%)",
                      borderColor: "rgba(220, 200, 120, 0.4)",
                      boxShadow: "0 8px 32px rgba(150, 120, 50, 0.4)",
                    }
                  : {
                      background: "linear-gradient(145deg, rgba(30, 50, 40, 0.95) 0%, rgba(20, 40, 30, 0.98) 100%)",
                      borderColor: "rgba(120, 200, 120, 0.35)",
                      boxShadow: "0 8px 32px rgba(50, 150, 50, 0.4)",
                    }
              }
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                className="w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center"
                style={
                  processingType === 'upgrade'
                    ? { background: "rgba(200, 170, 80, 0.3)" }
                    : { background: "rgba(100, 200, 100, 0.3)" }
                }
              >
                {processingType === 'upgrade' ? (
                  <Sparkles 
                    size={48} 
                    style={{ 
                      color: "rgba(240, 220, 140, 0.95)",
                      filter: "drop-shadow(0 0 8px rgba(240, 220, 140, 0.6))"
                    }} 
                  />
                ) : (
                  <span className="text-5xl">✓</span>
                )}
              </motion.div>
              <h3
                className="text-2xl font-bold tracking-wider uppercase pixelized mb-3"
                style={
                  processingType === 'upgrade'
                    ? {
                        textShadow: "0 0 8px rgba(220, 180, 80, 0.6), 1px 1px 0px rgba(0, 0, 0, 0.8)",
                        color: "rgba(240, 220, 140, 0.95)",
                      }
                    : {
                        textShadow: "0 0 8px rgba(140, 240, 140, 0.6), 1px 1px 0px rgba(0, 0, 0, 0.8)",
                        color: "rgba(180, 240, 180, 0.95)",
                      }
                }
              >
                {processingType === 'upgrade' ? 'Welcome Aboard!' : 'Downgraded Successfully'}
              </h3>
              <p
                className="text-sm pixelized"
                style={
                  processingType === 'upgrade'
                    ? { color: "rgba(230, 210, 150, 0.85)" }
                    : { color: "rgba(200, 255, 200, 0.85)" }
                }
              >
                {processingType === 'upgrade'
                  ? 'Your subscription has been activated successfully'
                  : 'You have been downgraded to Free Access'}
              </p>
            </motion.div>
          </div>
        )}

        {/* Processing Modal */}
        {showProcessing && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-6"
            style={{ background: 'rgba(0, 0, 0, 0.9)' }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="rounded-lg p-12 border max-w-md w-full text-center"
              style={
                processingType === 'upgrade'
                  ? {
                      background: "linear-gradient(145deg, rgba(60, 50, 30, 0.95) 0%, rgba(50, 40, 20, 0.98) 100%)",
                      borderColor: "rgba(220, 200, 120, 0.4)",
                      boxShadow: "0 8px 32px rgba(150, 120, 50, 0.4)",
                    }
                  : {
                      background: "linear-gradient(145deg, rgba(30, 50, 40, 0.95) 0%, rgba(20, 40, 30, 0.98) 100%)",
                      borderColor: "rgba(120, 200, 120, 0.35)",
                      boxShadow: "0 8px 32px rgba(50, 150, 50, 0.4)",
                    }
              }
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="w-16 h-16 mx-auto mb-6 rounded-full"
                style={
                  processingType === 'upgrade'
                    ? {
                        border: "3px solid rgba(220, 200, 120, 0.2)",
                        borderTopColor: "rgba(240, 220, 140, 0.95)",
                      }
                    : {
                        border: "3px solid rgba(120, 200, 120, 0.2)",
                        borderTopColor: "rgba(180, 240, 180, 0.95)",
                      }
                }
              />
              <h3
                className="text-2xl font-bold tracking-wider uppercase pixelized mb-3"
                style={
                  processingType === 'upgrade'
                    ? {
                        textShadow: "0 0 8px rgba(220, 180, 80, 0.6), 1px 1px 0px rgba(0, 0, 0, 0.8)",
                        color: "rgba(240, 220, 140, 0.95)",
                      }
                    : {
                        textShadow: "0 0 8px rgba(140, 240, 140, 0.6), 1px 1px 0px rgba(0, 0, 0, 0.8)",
                        color: "rgba(180, 240, 180, 0.95)",
                      }
                }
              >
                Processing...
              </h3>
              <p
                className="text-sm pixelized"
                style={
                  processingType === 'upgrade'
                    ? { color: "rgba(230, 210, 150, 0.85)" }
                    : { color: "rgba(200, 255, 200, 0.85)" }
                }
              >
                {processingType === 'upgrade'
                  ? 'Please wait while we prepare your subscription'
                  : 'Please wait while we process your request'}
              </p>
            </motion.div>
          </div>
        )}

        {/* Header */}
        <motion.div
          className="w-full max-w-5xl mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {/* Only show back link for existing users, not new users */}
          {!isNewUser && (
            <div className="flex items-center justify-between mb-8">
              <Link
                href={user ? (user.role === 'DEVELOPER' ? '/profile/developer' : '/profile/gamer') : '/'}
                className="text-xs font-semibold uppercase tracking-[0.2em] hover:underline transition-all pixelized"
                style={{ color: "rgba(200, 240, 200, 0.75)" }}
              >
                ← Back to {user ? 'Profile' : 'Home'}
              </Link>
            </div>
          )}
          <div className="text-center">
            <h1
              className="text-4xl md:text-5xl font-bold tracking-wider uppercase pixelized mb-3"
              style={{
                textShadow: `
                  0 0 12px rgba(120, 200, 120, 0.8),
                  0 0 24px rgba(100, 180, 100, 0.6),
                  2px 2px 0px rgba(0, 0, 0, 0.9)
                `,
                color: "rgba(180, 220, 180, 0.95)",
              }}
            >
              Choose Your Plan
            </h1>
            <p
              className="text-base font-semibold tracking-wide uppercase pixelized mb-4"
              style={{ textShadow: "1px 1px 0px rgba(0, 0, 0, 0.8)", color: "rgba(200, 240, 200, 0.7)" }}
            >
              {user && user.subscriptionTier !== 'FREE' 
                ? `Welcome back, ${user.name}!` 
                : user 
                  ? `Welcome, ${user.name}!` 
                  : 'Join our community of indie game lovers'}
            </p>
            <p
              className="text-sm pixelized"
              style={{ color: "rgba(200, 240, 200, 0.65)", textShadow: "1px 1px 0px rgba(0, 0, 0, 0.8)" }}
            >
              Support indie developers and get access to amazing games
            </p>
          </div>
        </motion.div>

        {/* Welcome Banner for New Users */}
        {isNewUser && (
          <motion.div
            className="w-full max-w-4xl mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <div
              className="p-6 rounded-lg border"
              style={{
                background: "linear-gradient(145deg, rgba(100, 200, 100, 0.15) 0%, rgba(80, 180, 80, 0.1) 100%)",
                borderColor: "rgba(150, 250, 150, 0.3)",
                boxShadow: "0 8px 32px rgba(100, 200, 100, 0.2), inset 0 1px 2px rgba(255, 255, 255, 0.05)",
              }}
            >
              <div className="flex items-start gap-4">
                <div
                  className="p-3 rounded-lg flex-shrink-0"
                  style={{
                    background: "rgba(150, 250, 150, 0.2)",
                    border: "1px solid rgba(150, 250, 150, 0.3)",
                  }}
                >
                  <Sparkles className="w-6 h-6" style={{ color: "rgba(150, 250, 150, 0.9)" }} />
                </div>
                <div className="flex-1">
                  <h3
                    className="text-xl font-bold mb-2 pixelized"
                    style={{
                      color: "rgba(150, 250, 150, 0.95)",
                      textShadow: "0 0 8px rgba(120, 200, 120, 0.6), 1px 1px 0px rgba(0, 0, 0, 0.8)",
                    }}
                  >
                    Welcome to Shader House!
                  </h3>
                  <p
                    className="text-sm mb-3"
                    style={{ color: "rgba(200, 240, 200, 0.85)" }}
                  >
                    Choose your plan to get started. You can always upgrade later!
                  </p>
                  
                  {/* Onboarding Hints */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div
                        className="p-2 rounded-lg flex-shrink-0"
                        style={{
                          background: "rgba(150, 250, 150, 0.15)",
                          border: "1px solid rgba(150, 250, 150, 0.3)",
                        }}
                      >
                        <Gamepad2 className="w-4 h-4" style={{ color: "rgba(150, 250, 150, 0.9)" }} />
                      </div>
                      <p className="text-xs" style={{ color: "rgba(200, 240, 200, 0.75)" }}>
                        <span className="font-bold" style={{ color: "rgba(150, 250, 150, 0.95)" }}>Start with FREE</span> to explore our game library and community
                      </p>
                    </div>
                    <div className="flex items-start gap-3">
                      <div
                        className="p-2 rounded-lg flex-shrink-0"
                        style={{
                          background: "rgba(240, 220, 140, 0.15)",
                          border: "1px solid rgba(240, 220, 140, 0.3)",
                        }}
                      >
                        <Crown className="w-4 h-4" style={{ color: "rgba(240, 220, 140, 0.9)" }} />
                      </div>
                      <p className="text-xs" style={{ color: "rgba(200, 240, 200, 0.75)" }}>
                        <span className="font-bold" style={{ color: "rgba(240, 220, 140, 0.95)" }}>Upgrade to Creator Support Pass</span> for beta access, exclusive games & support indie developers
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div
                        className="p-2 rounded-lg flex-shrink-0"
                        style={{
                          background: "rgba(150, 200, 250, 0.15)",
                          border: "1px solid rgba(150, 200, 250, 0.3)",
                        }}
                      >
                        <Shield className="w-4 h-4" style={{ color: "rgba(150, 200, 250, 0.9)" }} />
                      </div>
                      <p className="text-xs" style={{ color: "rgba(200, 240, 200, 0.75)" }}>
                        <span className="font-bold" style={{ color: "rgba(150, 200, 250, 0.95)" }}>Cancel anytime</span> - no long-term commitments, full control over your subscription
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Pricing Cards */}
        <motion.div 
          className="grid md:grid-cols-2 gap-8 max-w-4xl w-full mb-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: isNewUser ? 0.5 : 0.4 }}
        >
          {SUBSCRIPTION_PLANS.map((plan) => (
            <PricingCard
              key={plan.id}
              plan={plan}
              currentTier={user?.subscriptionTier}
              onSelect={handleSelectPlan}
              isLoading={isProcessing}
            />
          ))}
        </motion.div>

        {/* Comparison Toggle */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <button
            onClick={() => setShowComparison(!showComparison)}
            className="px-6 py-3 rounded-lg font-bold uppercase tracking-wider pixelized text-sm transition-all hover:scale-[1.02]"
            style={{
              background: "linear-gradient(135deg, rgba(120, 200, 120, 0.35) 0%, rgba(100, 180, 100, 0.25) 100%)",
              border: "1px solid rgba(140, 220, 140, 0.4)",
              color: "rgba(200, 255, 200, 0.95)",
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.3)",
            }}
          >
            {showComparison ? 'Hide' : 'Show'} Detailed Comparison
          </button>
        </motion.div>

        {/* Feature Comparison Table */}
        {showComparison && (
          <motion.div
            className="max-w-6xl w-full rounded-lg p-8 border"
            style={{
              background: "linear-gradient(145deg, rgba(30, 50, 40, 0.4) 0%, rgba(20, 40, 30, 0.5) 100%)",
              borderColor: "rgba(120, 200, 120, 0.25)",
              boxShadow: "0 8px 32px rgba(0, 0, 0, 0.4), inset 0 1px 2px rgba(255, 255, 255, 0.05)",
            }}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.4 }}
          >
            <h2
              className="text-3xl font-bold tracking-wider uppercase pixelized mb-6 text-center"
              style={{
                textShadow: "0 0 8px rgba(120, 200, 120, 0.6), 1px 1px 0px rgba(0, 0, 0, 0.8)",
                color: "rgba(180, 220, 180, 0.95)",
              }}
            >
              Feature Comparison
            </h2>
            <FeatureComparison />
          </motion.div>
        )}

        {/* Footer */}
        <motion.p
          className="text-center mt-12 text-xs max-w-2xl pixelized"
          style={{ color: "rgba(200, 240, 200, 0.5)" }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          All plans can be canceled anytime. No hidden fees. Secure payment processing via Stripe.
        </motion.p>
      </motion.main>
    </div>
  );
}
