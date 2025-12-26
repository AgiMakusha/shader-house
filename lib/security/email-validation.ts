/**
 * Email validation and disposable email detection
 */

import disposableDomains from 'disposable-email-domains';
import { promises as dns } from 'dns';

/**
 * Check if an email domain is disposable/temporary
 */
export function isDisposableEmail(email: string): boolean {
  const domain = email.toLowerCase().split('@')[1];
  if (!domain) return false;
  
  return disposableDomains.includes(domain);
}

/**
 * Verify that a domain has valid MX records (mail servers)
 * This helps prevent fake email addresses
 */
export async function verifyEmailDomain(email: string): Promise<boolean> {
  try {
    const domain = email.toLowerCase().split('@')[1];
    if (!domain) return false;
    
    // Skip MX check for whitelisted test domains in development
    if (process.env.NODE_ENV === 'development') {
      const testDomains = ['test.com', 'example.com', 'localhost'];
      if (testDomains.includes(domain)) {
        return true;
      }
    }
    
    // Check if domain has MX records
    const addresses = await dns.resolveMx(domain);
    return addresses && addresses.length > 0;
  } catch (error) {
    // DNS lookup failed - domain likely doesn't exist or has no mail servers
    return false;
  }
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
  /temp|fake|spam|trash|junk/i, // Suspicious keywords (removed 'test' for development)
];

/**
 * Whitelist for development/testing domains
 */
const ALLOWED_TEST_DOMAINS = [
  'test.com',
  'example.com',
  'localhost',
];

export function hasSuspiciousEmailPattern(email: string): boolean {
  // Allow whitelisted test domains in development
  if (process.env.NODE_ENV === 'development') {
    const domain = email.toLowerCase().split('@')[1];
    if (domain && ALLOWED_TEST_DOMAINS.includes(domain)) {
      return false;
    }
  }
  
  return SUSPICIOUS_PATTERNS.some(pattern => pattern.test(email));
}

/**
 * Comprehensive email validation (synchronous - does not check MX records)
 * Use validateEmailAsync for full validation including MX records
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

/**
 * Comprehensive email validation with MX record verification (async)
 */
export async function validateEmailAsync(email: string): Promise<{
  valid: boolean;
  reason?: string;
}> {
  // First do synchronous validation
  const basicValidation = validateEmail(email);
  if (!basicValidation.valid) {
    return basicValidation;
  }

  // Then check MX records
  const hasMxRecords = await verifyEmailDomain(email);
  if (!hasMxRecords) {
    return { 
      valid: false, 
      reason: 'Email domain does not exist or cannot receive emails' 
    };
  }

  return { valid: true };
}

