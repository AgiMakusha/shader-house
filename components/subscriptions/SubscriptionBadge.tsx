'use client';

import { Crown, Heart, Sparkles } from 'lucide-react';

interface SubscriptionBadgeProps {
  tier?: 'FREE' | 'CREATOR_SUPPORT' | 'GAMER_PRO' | string;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export function SubscriptionBadge({ tier = 'FREE', size = 'md', showLabel = true }: SubscriptionBadgeProps) {
  const config = {
    FREE: {
      icon: Sparkles,
      label: 'Free',
      iconColor: 'rgba(160, 240, 160, 0.85)',
      textColor: 'rgba(200, 255, 200, 0.95)',
      bg: 'rgba(100, 200, 100, 0.2)',
      border: 'rgba(140, 220, 140, 0.4)',
    },
    CREATOR_SUPPORT: {
      icon: Heart,
      label: 'Creator Support',
      iconColor: 'rgba(240, 210, 120, 0.85)',
      textColor: 'rgba(255, 245, 180, 0.95)',
      bg: 'rgba(200, 170, 80, 0.2)',
      border: 'rgba(240, 220, 140, 0.45)',
    },
    GAMER_PRO: {
      icon: Crown,
      label: 'Gamer Pro',
      iconColor: 'rgba(180, 140, 220, 0.85)',
      textColor: 'rgba(200, 180, 240, 0.95)',
      bg: 'rgba(150, 100, 200, 0.2)',
      border: 'rgba(180, 140, 220, 0.4)',
    },
  };

  const sizeClasses = {
    sm: 'px-2 py-1 text-xs gap-1',
    md: 'px-3 py-1.5 text-sm gap-2',
    lg: 'px-4 py-2 text-base gap-2',
  };

  const iconSizes = {
    sm: 12,
    md: 16,
    lg: 20,
  };

  // Ensure tier is valid, default to FREE if not
  const validTier = (tier && config[tier as keyof typeof config]) ? tier as keyof typeof config : 'FREE';
  const { icon: Icon, label, iconColor, textColor, bg, border } = config[validTier];

  return (
    <div
      className={`inline-flex items-center rounded ${sizeClasses[size]}`}
      style={{
        background: bg,
        border: `1px solid ${border}`,
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
      }}
    >
      <Icon style={{ color: iconColor }} size={iconSizes[size]} />
      {showLabel && (
        <span
          className="font-bold uppercase tracking-wider pixelized"
          style={{ color: textColor }}
        >
          {label}
        </span>
      )}
    </div>
  );
}

