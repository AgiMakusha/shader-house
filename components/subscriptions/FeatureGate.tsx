'use client';

import { ReactNode } from 'react';
import Link from 'next/link';
import { Lock, Crown, Heart } from 'lucide-react';
import { SubscriptionTier } from '@/lib/subscriptions/types';

interface FeatureGateProps {
  requiredTier: SubscriptionTier;
  userTier?: SubscriptionTier;
  children: ReactNode;
  fallback?: ReactNode;
  showUpgrade?: boolean;
}

const TIER_INFO = {
  FREE: {
    icon: Lock,
    name: 'Free',
    color: 'gray',
  },
  CREATOR_SUPPORT: {
    icon: Heart,
    name: 'Creator Support Pass',
    color: 'pink',
  },
  GAMER_PRO: {
    icon: Crown,
    name: 'Gamer Pro Pass',
    color: 'purple',
  },
};

export function FeatureGate({
  requiredTier,
  userTier = 'FREE',
  children,
  fallback,
  showUpgrade = true,
}: FeatureGateProps) {
  const tierHierarchy: Record<SubscriptionTier, number> = {
    FREE: 0,
    CREATOR_SUPPORT: 1,
    GAMER_PRO: 2,
  };

  const hasAccess = tierHierarchy[userTier] >= tierHierarchy[requiredTier];

  if (hasAccess) {
    return <>{children}</>;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  if (showUpgrade) {
    const tierInfo = TIER_INFO[requiredTier];
    const Icon = tierInfo.icon;

    return (
      <div className="bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 mb-4">
          <Icon className="w-8 h-8 text-purple-400" />
        </div>
        <h3 className="text-2xl font-bold text-white mb-2">
          {tierInfo.name} Required
        </h3>
        <p className="text-white/70 mb-6">
          Upgrade your subscription to access this feature
        </p>
        <Link
          href="/membership"
          className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-purple-500/50 transition-all"
        >
          <Crown size={20} />
          Upgrade Now
        </Link>
      </div>
    );
  }

  return null;
}

/**
 * Higher-order component version for wrapping components
 */
export function withFeatureGate<P extends object>(
  Component: React.ComponentType<P>,
  requiredTier: SubscriptionTier
) {
  return function FeatureGatedComponent(props: P & { userTier?: SubscriptionTier }) {
    const { userTier, ...componentProps } = props;

    return (
      <FeatureGate requiredTier={requiredTier} userTier={userTier}>
        <Component {...(componentProps as P)} />
      </FeatureGate>
    );
  };
}






