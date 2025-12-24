'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  CreditCard, 
  CheckCircle, 
  AlertCircle, 
  ExternalLink, 
  Loader2,
  Building2,
  Shield
} from 'lucide-react';

interface ConnectStatus {
  hasAccount: boolean;
  status: string | null;
  payoutEnabled: boolean;
  requiresOnboarding: boolean;
  dashboardUrl?: string;
}

export function StripeConnectSetup() {
  const [status, setStatus] = useState<ConnectStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    checkStatus();
  }, []);

  const checkStatus = async () => {
    try {
      const res = await fetch('/api/payments/connect/status');
      if (res.ok) {
        const data = await res.json();
        setStatus(data);
      }
    } catch (err) {
      console.error('Error checking status:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateAccount = async () => {
    setIsCreating(true);
    setError('');

    try {
      const res = await fetch('/api/payments/connect/create', {
        method: 'POST',
      });

      const data = await res.json();

      if (res.ok && data.onboardingUrl) {
        window.location.href = data.onboardingUrl;
      } else {
        setError(data.error || 'Failed to create account');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setIsCreating(false);
    }
  };

  const handleContinueOnboarding = async () => {
    setIsCreating(true);
    setError('');

    try {
      const res = await fetch('/api/payments/connect/onboarding');
      const data = await res.json();

      if (res.ok && data.onboardingUrl) {
        window.location.href = data.onboardingUrl;
      } else {
        setError(data.error || 'Failed to get onboarding link');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setIsCreating(false);
    }
  };

  const handleOpenDashboard = async () => {
    try {
      const res = await fetch('/api/payments/connect/dashboard');
      const data = await res.json();

      if (res.ok && data.dashboardUrl) {
        window.open(data.dashboardUrl, '_blank');
      }
    } catch (err) {
      console.error('Error opening dashboard:', err);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-6 h-6 animate-spin text-green-400" />
      </div>
    );
  }

  // Account is fully set up
  if (status?.payoutEnabled) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-xl p-6 border"
        style={{
          background: 'linear-gradient(145deg, rgba(40, 80, 60, 0.4) 0%, rgba(30, 60, 45, 0.5) 100%)',
          borderColor: 'rgba(100, 200, 100, 0.3)',
        }}
      >
        <div className="flex items-start gap-4">
          <div 
            className="p-3 rounded-lg"
            style={{ background: 'rgba(100, 200, 100, 0.2)' }}
          >
            <CheckCircle className="w-6 h-6 text-green-400" />
          </div>
          <div className="flex-1">
            <h3 
              className="text-lg font-bold mb-1 pixelized"
              style={{ color: 'rgba(150, 255, 150, 0.95)' }}
            >
              Payouts Enabled
            </h3>
            <p 
              className="text-sm mb-4"
              style={{ color: 'rgba(200, 240, 200, 0.75)' }}
            >
              Your account is set up to receive payments. Revenue from game sales and tips will be deposited to your bank account weekly.
            </p>
            
            <div className="flex flex-wrap gap-3">
              <button
                onClick={handleOpenDashboard}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all hover:scale-[1.02]"
                style={{
                  background: 'rgba(100, 200, 100, 0.2)',
                  border: '1px solid rgba(140, 220, 140, 0.4)',
                  color: 'rgba(200, 255, 200, 0.95)',
                }}
              >
                <ExternalLink size={16} />
                View Stripe Dashboard
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  // Account exists but needs onboarding
  if (status?.hasAccount && status?.requiresOnboarding) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-xl p-6 border"
        style={{
          background: 'linear-gradient(145deg, rgba(80, 70, 40, 0.4) 0%, rgba(60, 50, 30, 0.5) 100%)',
          borderColor: 'rgba(220, 180, 80, 0.3)',
        }}
      >
        <div className="flex items-start gap-4">
          <div 
            className="p-3 rounded-lg"
            style={{ background: 'rgba(220, 180, 80, 0.2)' }}
          >
            <AlertCircle className="w-6 h-6 text-yellow-400" />
          </div>
          <div className="flex-1">
            <h3 
              className="text-lg font-bold mb-1 pixelized"
              style={{ color: 'rgba(255, 230, 150, 0.95)' }}
            >
              Complete Your Setup
            </h3>
            <p 
              className="text-sm mb-4"
              style={{ color: 'rgba(230, 210, 150, 0.75)' }}
            >
              Your payout account is created but requires additional information. Complete the setup to start receiving payments.
            </p>
            
            {error && (
              <p className="text-sm text-red-400 mb-3">{error}</p>
            )}
            
            <button
              onClick={handleContinueOnboarding}
              disabled={isCreating}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all hover:scale-[1.02] disabled:opacity-50"
              style={{
                background: 'linear-gradient(135deg, rgba(220, 180, 80, 0.3) 0%, rgba(200, 160, 60, 0.2) 100%)',
                border: '1px solid rgba(240, 210, 120, 0.4)',
                color: 'rgba(255, 240, 180, 0.95)',
              }}
            >
              {isCreating ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <ExternalLink size={16} />
              )}
              Continue Setup
            </button>
          </div>
        </div>
      </motion.div>
    );
  }

  // No account - show setup prompt
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl p-6 border"
      style={{
        background: 'linear-gradient(145deg, rgba(40, 50, 60, 0.4) 0%, rgba(30, 40, 50, 0.5) 100%)',
        borderColor: 'rgba(100, 150, 200, 0.3)',
      }}
    >
      <div className="flex items-start gap-4">
        <div 
          className="p-3 rounded-lg"
          style={{ background: 'rgba(100, 150, 200, 0.2)' }}
        >
          <CreditCard className="w-6 h-6 text-blue-400" />
        </div>
        <div className="flex-1">
          <h3 
            className="text-lg font-bold mb-1 pixelized"
            style={{ color: 'rgba(180, 210, 255, 0.95)' }}
          >
            Set Up Payouts
          </h3>
          <p 
            className="text-sm mb-4"
            style={{ color: 'rgba(180, 200, 230, 0.75)' }}
          >
            Connect your bank account to receive payments from game sales and tips. We use Stripe for secure, reliable payouts.
          </p>
          
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="flex items-center gap-2 text-xs" style={{ color: 'rgba(180, 200, 230, 0.7)' }}>
              <Building2 size={14} className="text-blue-400" />
              Weekly payouts
            </div>
            <div className="flex items-center gap-2 text-xs" style={{ color: 'rgba(180, 200, 230, 0.7)' }}>
              <Shield size={14} className="text-blue-400" />
              Secure & encrypted
            </div>
          </div>
          
          {error && (
            <p className="text-sm text-red-400 mb-3">{error}</p>
          )}
          
          <button
            onClick={handleCreateAccount}
            disabled={isCreating}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all hover:scale-[1.02] disabled:opacity-50"
            style={{
              background: 'linear-gradient(135deg, rgba(100, 150, 200, 0.3) 0%, rgba(80, 130, 180, 0.2) 100%)',
              border: '1px solid rgba(140, 180, 240, 0.4)',
              color: 'rgba(200, 220, 255, 0.95)',
            }}
          >
            {isCreating ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <CreditCard size={16} />
            )}
            Connect Bank Account
          </button>
        </div>
      </div>
    </motion.div>
  );
}



