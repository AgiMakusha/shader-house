/**
 * Email verification guard utility
 * Used to enforce email verification for critical actions
 */

import { SessionPayload } from "@/lib/auth/session";

/**
 * Routes that require email verification
 */
export const VERIFICATION_REQUIRED_ROUTES = [
  "/dashboard/games/upload",
  "/dashboard/games/publish",
  "/api/games/upload",
  "/api/games/publish",
  "/api/payments",
];

/**
 * Check if a route requires email verification
 */
export function requiresEmailVerification(pathname: string): boolean {
  return VERIFICATION_REQUIRED_ROUTES.some(route => pathname.startsWith(route));
}

/**
 * Check if user has verified their email
 */
export function isEmailVerified(session: SessionPayload | null): boolean {
  return !!session?.user?.emailVerified;
}

/**
 * Get verification status message for user
 */
export function getVerificationMessage(verified: boolean): string {
  if (verified) {
    return "Your email is verified";
  }
  return "Please verify your email to access all features";
}

/**
 * Check if action is allowed based on email verification status
 */
export function canPerformAction(
  session: SessionPayload | null,
  action: "publish_game" | "upload_game" | "make_payment" | "access_beta" | "general"
): { allowed: boolean; reason?: string } {
  if (!session) {
    return { allowed: false, reason: "You must be logged in" };
  }

  // General actions don't require verification
  if (action === "general") {
    return { allowed: true };
  }

  // Critical actions require email verification
  const verified = isEmailVerified(session);
  
  if (!verified) {
    return { 
      allowed: false, 
      reason: "Please verify your email address to perform this action. Check your inbox for the verification link or request a new one." 
    };
  }

  return { allowed: true };
}
