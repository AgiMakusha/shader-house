'use client';

import { SubscriptionPlan } from '@/lib/subscriptions/types';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

interface PricingCardProps {
  plan: SubscriptionPlan;
  currentTier?: string;
  onSelect: (planId: string) => void;
  isLoading?: boolean;
}

export function PricingCard({ plan, currentTier, onSelect, isLoading }: PricingCardProps) {
  const isCurrentPlan = currentTier === plan.id;
  const isFree = plan.price === 0;
  const hasSubscription = currentTier && currentTier !== 'FREE';
  const isDowngrade = hasSubscription && isFree;
  const isChangingPlan = hasSubscription && !isFree && !isCurrentPlan;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`
        relative rounded-lg p-8 border transition-all duration-300
        ${isCurrentPlan ? 'ring-2 ring-green-500/50' : ''}
      `}
      style={{
        background: plan.highlighted 
          ? 'linear-gradient(145deg, rgba(60, 50, 30, 0.5) 0%, rgba(50, 40, 20, 0.6) 100%)'
          : 'linear-gradient(145deg, rgba(30, 50, 40, 0.4) 0%, rgba(20, 40, 30, 0.5) 100%)',
        borderColor: plan.highlighted ? 'rgba(220, 200, 120, 0.4)' : 'rgba(120, 200, 120, 0.25)',
        boxShadow: plan.highlighted 
          ? '0 8px 32px rgba(150, 120, 50, 0.35), inset 0 1px 2px rgba(255, 255, 255, 0.05)'
          : '0 8px 32px rgba(0, 0, 0, 0.4), inset 0 1px 2px rgba(255, 255, 255, 0.05)',
      }}
    >
      {plan.highlighted && !isCurrentPlan && (
        <div 
          className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded text-xs font-bold uppercase tracking-wider pixelized"
          style={{
            background: 'linear-gradient(135deg, rgba(200, 170, 80, 0.5) 0%, rgba(180, 150, 60, 0.4) 100%)',
            border: '1px solid rgba(240, 220, 140, 0.5)',
            color: 'rgba(255, 245, 200, 0.95)',
            boxShadow: '0 4px 12px rgba(150, 120, 50, 0.5)',
          }}
        >
          MOST POPULAR
        </div>
      )}

      {plan.highlighted && isCurrentPlan && (
        <div 
          className="absolute -top-3 left-4 px-4 py-1 rounded text-xs font-bold uppercase tracking-wider pixelized"
          style={{
            background: 'linear-gradient(135deg, rgba(200, 170, 80, 0.5) 0%, rgba(180, 150, 60, 0.4) 100%)',
            border: '1px solid rgba(240, 220, 140, 0.5)',
            color: 'rgba(255, 245, 200, 0.95)',
            boxShadow: '0 4px 12px rgba(150, 120, 50, 0.5)',
          }}
        >
          MOST POPULAR
        </div>
      )}

      {isCurrentPlan && !isFree && (
        <div 
          className="absolute -top-3 right-4 px-3 py-1 rounded text-xs font-bold uppercase tracking-wider pixelized"
          style={{
            background: 'rgba(100, 200, 100, 0.3)',
            border: '1px solid rgba(140, 240, 140, 0.5)',
            color: 'rgba(200, 255, 200, 0.95)',
            boxShadow: '0 4px 12px rgba(50, 150, 50, 0.4)',
          }}
        >
          CURRENT PLAN
        </div>
      )}

      <div className="mb-6">
        <h3 
          className="text-2xl font-bold tracking-wider uppercase pixelized mb-2"
          style={{
            textShadow: plan.highlighted 
              ? '0 0 8px rgba(220, 180, 80, 0.6), 1px 1px 0px rgba(0, 0, 0, 0.8)'
              : '0 0 8px rgba(120, 200, 120, 0.6), 1px 1px 0px rgba(0, 0, 0, 0.8)',
            color: plan.highlighted ? 'rgba(240, 220, 140, 0.95)' : 'rgba(180, 220, 180, 0.95)',
          }}
        >
          {plan.name}
        </h3>
        <p 
          className="text-sm pixelized"
          style={{ 
            color: plan.highlighted ? "rgba(230, 210, 150, 0.75)" : "rgba(200, 240, 200, 0.65)", 
            textShadow: "1px 1px 0px rgba(0, 0, 0, 0.8)" 
          }}
        >
          {plan.description}
        </p>
      </div>

      <div className="mb-6">
        <div className="flex items-baseline gap-1">
          <span 
            className="text-5xl font-bold pixelized"
            style={{
              color: plan.highlighted ? 'rgba(255, 240, 180, 0.95)' : 'rgba(200, 240, 200, 0.95)',
              textShadow: plan.highlighted 
                ? '0 0 10px rgba(220, 180, 80, 0.5), 2px 2px 0px rgba(0, 0, 0, 0.8)'
                : '2px 2px 0px rgba(0, 0, 0, 0.8)',
            }}
          >
            {plan.currency === 'EUR' ? '€' : '$'}{plan.price}
          </span>
          {!isFree && (
            <span 
              className="pixelized text-sm"
              style={{ color: plan.highlighted ? "rgba(230, 210, 150, 0.7)" : "rgba(200, 240, 200, 0.6)" }}
            >
              /{plan.interval}
            </span>
          )}
        </div>
      </div>

      <button
        onClick={() => onSelect(plan.id)}
        disabled={isCurrentPlan || isLoading}
        className={`
          w-full py-3 px-6 rounded-lg font-bold uppercase tracking-wider pixelized text-sm transition-all duration-200
          ${isLoading ? 'opacity-50 cursor-wait' : ''}
          ${!isCurrentPlan && !isDowngrade ? 'hover:scale-[1.02]' : ''}
        `}
        style={
          isCurrentPlan
            ? {
                background: 'rgba(100, 100, 100, 0.2)',
                color: 'rgba(200, 200, 200, 0.4)',
                border: '1px solid rgba(150, 150, 150, 0.2)',
                cursor: 'not-allowed',
              }
            : isDowngrade
            ? {
                background: 'rgba(200, 100, 100, 0.25)',
                border: '1px solid rgba(240, 150, 150, 0.4)',
                color: 'rgba(255, 180, 180, 0.95)',
                boxShadow: '0 4px 12px rgba(150, 50, 50, 0.3)',
              }
            : plan.highlighted
            ? {
                background: 'linear-gradient(135deg, rgba(200, 170, 80, 0.4) 0%, rgba(180, 150, 60, 0.3) 100%)',
                border: '1px solid rgba(240, 220, 140, 0.5)',
                color: 'rgba(255, 245, 200, 0.95)',
                boxShadow: '0 4px 12px rgba(150, 120, 50, 0.4)',
              }
            : {
                background: 'linear-gradient(135deg, rgba(120, 200, 120, 0.35) 0%, rgba(100, 180, 100, 0.25) 100%)',
                border: '1px solid rgba(140, 220, 140, 0.4)',
                color: 'rgba(200, 255, 200, 0.95)',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
              }
        }
      >
        {isCurrentPlan 
          ? 'Current Plan' 
          : isDowngrade 
          ? 'Downgrade to Free' 
          : isChangingPlan
          ? 'Change Plan'
          : isFree 
          ? 'Get Started' 
          : 'Subscribe Now'
        }
      </button>

      <div className="mt-8 space-y-3">
        {plan.features.map((feature, index) => (
          <div key={index} className="flex items-start gap-3">
            <Check 
              className="w-5 h-5 flex-shrink-0 mt-0.5"
              style={{ color: plan.highlighted ? 'rgba(240, 210, 120, 0.85)' : 'rgba(140, 240, 140, 0.85)' }}
            />
            <span 
              className="text-sm pixelized"
              style={{ color: plan.highlighted ? "rgba(230, 210, 150, 0.85)" : "rgba(200, 240, 200, 0.85)" }}
            >
              {feature}
            </span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

