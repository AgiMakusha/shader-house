/**
 * Email validation and disposable email detection
 */

import disposableDomains from 'disposable-email-domains';

/**
 * Check if an email domain is disposable/temporary
 */
export function isDisposableEmail(email: string): boolean {
  const domain = email.toLowerCase().split('@')[1];
  if (!domain) return false;
  
  return disposableDomains.includes(domain);
}

/**
 * Validate email format
 */
export function isValidEmailFormat(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Additional suspicious email patterns
 */
const SUSPICIOUS_PATTERNS = [
  /\+.*@/, // Plus addressing (can be legitimate but often used for abuse)
  /^\d+@/, // Starts with only numbers
  /^[a-z]{1,2}@/, // Very short username (1-2 chars)
  /test|temp|fake|spam|trash|junk/i, // Suspicious keywords
];

export function hasSuspiciousEmailPattern(email: string): boolean {
  return SUSPICIOUS_PATTERNS.some(pattern => pattern.test(email));
}

/**
 * Comprehensive email validation
 */
export function validateEmail(email: string): {
  valid: boolean;
  reason?: string;
} {
  if (!email || email.trim().length === 0) {
    return { valid: false, reason: 'Email is required' };
  }

  if (!isValidEmailFormat(email)) {
    return { valid: false, reason: 'Invalid email format' };
  }

  if (isDisposableEmail(email)) {
    return { valid: false, reason: 'Disposable email addresses are not allowed' };
  }

  if (hasSuspiciousEmailPattern(email)) {
    return { valid: false, reason: 'Email address appears suspicious' };
  }

  return { valid: true };
}

