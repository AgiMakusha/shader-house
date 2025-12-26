/**
 * Email validation and disposable email detection
 */

import disposableDomains from 'disposable-email-domains';
import { promises as dns } from 'dns';
import * as net from 'net';

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
 * Verify email address via SMTP (checks if server accepts the address)
 * This performs a real SMTP check without sending an email
 */
export async function verifyEmailViaSMTP(email: string, timeout: number = 5000): Promise<{
  valid: boolean;
  reason?: string;
}> {
  try {
    const domain = email.toLowerCase().split('@')[1];
    if (!domain) return { valid: false, reason: 'Invalid email format' };

    // Skip SMTP check for whitelisted test domains in development
    if (process.env.NODE_ENV === 'development') {
      const testDomains = ['test.com', 'example.com', 'localhost'];
      if (testDomains.includes(domain)) {
        return { valid: true };
      }
    }

    // Get MX records
    const mxRecords = await dns.resolveMx(domain);
    if (!mxRecords || mxRecords.length === 0) {
      return { valid: false, reason: 'No mail servers found for this domain' };
    }

    // Sort by priority (lower number = higher priority)
    mxRecords.sort((a, b) => a.priority - b.priority);

    // Try the first MX server
    const mxHost = mxRecords[0].exchange;
    
    return new Promise((resolve) => {
      const socket = new net.Socket();
      let response = '';
      let step = 0;

      const timeoutId = setTimeout(() => {
        socket.destroy();
        resolve({ valid: false, reason: 'SMTP validation timeout' });
      }, timeout);

      socket.setTimeout(timeout);

      socket.on('connect', () => {
        // Wait for initial greeting
      });

      socket.on('data', (data: Buffer) => {
        response += data.toString();
        const lines = response.split('\r\n');
        response = lines.pop() || ''; // Keep incomplete line

        for (const line of lines) {
          if (!line) continue;
          
          const code = parseInt(line.substring(0, 3));
          
          if (step === 0) {
            // Initial greeting (220)
            if (code === 220) {
              socket.write(`EHLO ${domain}\r\n`);
              step = 1;
            } else {
              clearTimeout(timeoutId);
              socket.destroy();
              resolve({ valid: false, reason: 'SMTP server error' });
            }
          } else if (step === 1) {
            // EHLO response (250)
            if (code === 250) {
              socket.write(`MAIL FROM:<noreply@${domain}>\r\n`);
              step = 2;
            } else if (line.startsWith('250 ')) {
              // Multi-line response, continue
            } else if (line.match(/^250\s/)) {
              // End of multi-line, send MAIL FROM
              socket.write(`MAIL FROM:<noreply@${domain}>\r\n`);
              step = 2;
            }
          } else if (step === 2) {
            // MAIL FROM response (250)
            if (code === 250) {
              socket.write(`RCPT TO:<${email}>\r\n`);
              step = 3;
            } else {
              clearTimeout(timeoutId);
              socket.destroy();
              resolve({ valid: false, reason: 'SMTP server rejected sender' });
            }
          } else if (step === 3) {
            // RCPT TO response
            if (code === 250 || code === 251) {
              // Email address is accepted
              socket.write('QUIT\r\n');
              clearTimeout(timeoutId);
              socket.destroy();
              resolve({ valid: true });
            } else if (code === 550 || code === 551 || code === 553) {
              // Email address rejected
              clearTimeout(timeoutId);
              socket.destroy();
              resolve({ valid: false, reason: 'Email address does not exist on this server' });
            } else {
              // Unknown response, assume invalid
              socket.write('QUIT\r\n');
              clearTimeout(timeoutId);
              socket.destroy();
              resolve({ valid: false, reason: 'SMTP server response unclear' });
            }
          }
        }
      });

      socket.on('error', () => {
        clearTimeout(timeoutId);
        resolve({ valid: false, reason: 'SMTP connection failed' });
      });

      socket.on('close', () => {
        clearTimeout(timeoutId);
      });

      // Connect to SMTP server (port 25)
      socket.connect(25, mxHost);
    });
  } catch (error) {
    return { valid: false, reason: 'SMTP validation error' };
  }
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

/**
 * Comprehensive email validation with MX records and SMTP verification (async)
 * This is the most thorough validation but can be slower
 */
export async function validateEmailWithSMTP(email: string): Promise<{
  valid: boolean;
  reason?: string;
}> {
  // First do basic validation
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

  // Finally, verify via SMTP (optional, can be disabled via env var)
  if (process.env.ENABLE_SMTP_VALIDATION !== 'false') {
    const smtpValidation = await verifyEmailViaSMTP(email);
    if (!smtpValidation.valid) {
      // SMTP validation failed, but we still allow if MX records exist
      // Some servers block SMTP checks for security, so we don't fail completely
      // Log the SMTP failure but don't block registration
      console.warn(`SMTP validation failed for ${email}: ${smtpValidation.reason}`);
      // Continue with MX record validation only
    }
  }

  return { valid: true };
}

