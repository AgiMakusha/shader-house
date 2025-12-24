/**
 * Email Verification Guard
 * Blocks users from posting content until email is verified
 */

import { prisma } from '@/lib/db/prisma';

export interface EmailVerificationResult {
  verified: boolean;
  email?: string;
  verifiedAt?: Date | null;
  error?: string;
}

/**
 * Check if a user's email is verified
 */
export async function isEmailVerified(userId: string): Promise<EmailVerificationResult> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        email: true,
        emailVerified: true,
      },
    });

    if (!user) {
      return {
        verified: false,
        error: 'User not found',
      };
    }

    return {
      verified: user.emailVerified !== null,
      email: user.email,
      verifiedAt: user.emailVerified,
    };
  } catch (error) {
    console.error('Error checking email verification:', error);
    return {
      verified: false,
      error: 'Failed to check verification status',
    };
  }
}

/**
 * Actions that require email verification
 */
export const VERIFICATION_REQUIRED_ACTIONS = [
  'create_thread',
  'create_post',
  'create_review',
  'create_devlog',
  'create_devlog_comment',
  'submit_feedback',
  'send_tip',
  'join_beta',
  'report_content',
] as const;

export type VerificationRequiredAction = typeof VERIFICATION_REQUIRED_ACTIONS[number];

/**
 * Check if an action requires email verification
 */
export function requiresEmailVerification(action: string): boolean {
  return VERIFICATION_REQUIRED_ACTIONS.includes(action as VerificationRequiredAction);
}

/**
 * Standard error response for unverified email
 */
export function getUnverifiedEmailError(): {
  error: string;
  code: string;
  action: string;
} {
  return {
    error: 'Please verify your email address before posting. Check your inbox for the verification link.',
    code: 'EMAIL_NOT_VERIFIED',
    action: 'verify_email',
  };
}

/**
 * Grace period check - allows some actions for new users
 * who just registered (within first 24 hours)
 */
export async function isInGracePeriod(userId: string): Promise<boolean> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { createdAt: true },
    });

    if (!user) return false;

    const hoursSinceCreation = (Date.now() - user.createdAt.getTime()) / (1000 * 60 * 60);
    return hoursSinceCreation < 24;
  } catch {
    return false;
  }
}

/**
 * Actions allowed during grace period (even without verification)
 */
const GRACE_PERIOD_ACTIONS: VerificationRequiredAction[] = [
  'join_beta', // Allow joining beta during grace period
];

/**
 * Combined check: is user allowed to perform action?
 * Takes into account verification status and grace period
 */
export async function canPerformAction(
  userId: string,
  action: VerificationRequiredAction
): Promise<{ allowed: boolean; reason?: string }> {
  // Check if action requires verification
  if (!requiresEmailVerification(action)) {
    return { allowed: true };
  }

  // Check email verification
  const verificationResult = await isEmailVerified(userId);
  
  if (verificationResult.verified) {
    return { allowed: true };
  }

  // Check grace period for certain actions
  if (GRACE_PERIOD_ACTIONS.includes(action)) {
    const inGracePeriod = await isInGracePeriod(userId);
    if (inGracePeriod) {
      return { allowed: true };
    }
  }

  // Not verified and not in grace period
  return {
    allowed: false,
    reason: 'Email verification required',
  };
}



