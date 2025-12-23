"use client";

import { ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { FeatureFlag, hasFeatureAccess, SubscriptionTier } from '@/lib/subscriptions/types';
import { Sparkles, Lock } from 'lucide-react';

interface FeatureGuardProps {
  children: ReactNode;
  feature: FeatureFlag;
  userTier: SubscriptionTier | undefined | null;
  fallback?: ReactNode;
  showUpgrade?: boolean;
}

/**
 * FeatureGuard - Conditionally renders content based on subscription tier
 * 
 * Usage:
 * <FeatureGuard feature={FeatureFlag.UNLIMITED_LIBRARY} userTier={user.subscriptionTier}>
 *   <PremiumContent />
 * </FeatureGuard>
 */
export function FeatureGuard({
  children,
  feature,
  userTier,
  fallback,
  showUpgrade = true,
}: FeatureGuardProps) {
  const router = useRouter();
  const hasAccess = hasFeatureAccess(userTier, feature);

  if (hasAccess) {
    return <>{children}</>;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  if (!showUpgrade) {
    return null;
  }

  // Default upgrade prompt
  return (
    <div
      style={{
        background: 'linear-gradient(145deg, rgba(60, 50, 30, 0.3) 0%, rgba(50, 40, 20, 0.4) 100%)',
        border: '1px solid rgba(220, 200, 120, 0.3)',
        borderRadius: '12px',
        padding: '32px',
        textAlign: 'center',
        fontFamily: '"Press Start 2P", monospace',
      }}
    >
      <div style={{ marginBottom: '20px' }}>
        <Lock
          size={48}
          style={{
            color: 'rgba(240, 220, 140, 0.7)',
            margin: '0 auto',
          }}
        />
      </div>
      
      <h3
        style={{
          color: 'rgba(240, 220, 140, 0.95)',
          fontSize: '14px',
          marginBottom: '16px',
          textShadow: '0 0 10px rgba(240, 220, 140, 0.5)',
        }}
      >
        Creator Support Pass Required
      </h3>
      
      <p
        style={{
          color: 'rgba(230, 210, 150, 0.85)',
          fontSize: '10px',
          lineHeight: '1.6',
          marginBottom: '24px',
        }}
      >
        Upgrade to access this feature and support indie developers
      </p>

      <button
        onClick={() => router.push('/membership')}
        style={{
          background: 'linear-gradient(145deg, rgba(240, 220, 140, 0.2) 0%, rgba(220, 180, 100, 0.3) 100%)',
          border: '2px solid rgba(240, 220, 140, 0.4)',
          borderRadius: '8px',
          padding: '12px 24px',
          color: 'rgba(240, 220, 140, 0.95)',
          fontSize: '10px',
          fontFamily: '"Press Start 2P", monospace',
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'linear-gradient(145deg, rgba(240, 220, 140, 0.3) 0%, rgba(220, 180, 100, 0.4) 100%)';
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.boxShadow = '0 0 20px rgba(240, 220, 140, 0.4)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'linear-gradient(145deg, rgba(240, 220, 140, 0.2) 0%, rgba(220, 180, 100, 0.3) 100%)';
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = 'none';
        }}
      >
        <Sparkles size={14} />
        Upgrade Now
      </button>
    </div>
  );
}






