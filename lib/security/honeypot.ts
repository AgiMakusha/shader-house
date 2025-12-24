/**
 * Honeypot fields for bot detection
 * These are invisible fields that bots will fill but humans won't see
 */

export interface HoneypotFields {
  // Invisible field that looks like a website field - bots often fill this
  website?: string;
  // Invisible "confirm email" field - bots try to fill all fields
  email_confirm?: string;
  // Hidden timestamp field to detect instant submissions
  _formTimestamp?: number;
  // Hidden token for additional validation
  _formToken?: string;
}

export interface HoneypotCheckResult {
  isBot: boolean;
  reason?: string;
  confidence: 'low' | 'medium' | 'high';
}

/**
 * Check honeypot fields for bot indicators
 */
export function checkHoneypot(fields: HoneypotFields): HoneypotCheckResult {
  // Check if any honeypot field was filled (definite bot indicator)
  if (fields.website && fields.website.trim().length > 0) {
    return {
      isBot: true,
      reason: 'Honeypot field "website" was filled',
      confidence: 'high',
    };
  }

  if (fields.email_confirm && fields.email_confirm.trim().length > 0) {
    return {
      isBot: true,
      reason: 'Honeypot field "email_confirm" was filled',
      confidence: 'high',
    };
  }

  // Check timestamp - form submitted too fast
  if (fields._formTimestamp) {
    const elapsed = Date.now() - fields._formTimestamp;
    
    // Less than 1 second - definitely a bot
    if (elapsed < 1000) {
      return {
        isBot: true,
        reason: `Form submitted in ${elapsed}ms (< 1 second)`,
        confidence: 'high',
      };
    }
    
    // Less than 3 seconds - suspicious
    if (elapsed < 3000) {
      return {
        isBot: true,
        reason: `Form submitted in ${elapsed}ms (< 3 seconds)`,
        confidence: 'medium',
      };
    }
  }

  // Check if token matches expected format (if provided)
  if (fields._formToken !== undefined) {
    // Token should be a specific format if present
    // Bots might generate random tokens or skip this
    if (!isValidFormToken(fields._formToken)) {
      return {
        isBot: true,
        reason: 'Invalid form token',
        confidence: 'medium',
      };
    }
  }

  return {
    isBot: false,
    confidence: 'low',
  };
}

/**
 * Generate a form token for honeypot validation
 * This should be generated on page load and validated on submit
 */
export function generateFormToken(): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 10);
  // Simple token format: timestamp-random
  return `${timestamp.toString(36)}-${random}`;
}

/**
 * Validate form token format
 */
function isValidFormToken(token: string): boolean {
  if (!token || typeof token !== 'string') {
    return false;
  }
  
  // Check format: should be timestamp(base36)-random(8 chars)
  const parts = token.split('-');
  if (parts.length !== 2) {
    return false;
  }
  
  // Validate timestamp part (should be valid base36)
  const timestampPart = parts[0];
  const timestamp = parseInt(timestampPart, 36);
  if (isNaN(timestamp)) {
    return false;
  }
  
  // Token shouldn't be older than 1 hour
  const tokenAge = Date.now() - timestamp;
  if (tokenAge > 60 * 60 * 1000) {
    return false;
  }
  
  // Token shouldn't be from the future (with 5 second tolerance)
  if (tokenAge < -5000) {
    return false;
  }
  
  // Validate random part length
  if (parts[1].length !== 8) {
    return false;
  }
  
  return true;
}

/**
 * CSS styles to hide honeypot fields
 * These styles should be applied to honeypot container elements
 */
export const HONEYPOT_STYLES = {
  // Multiple techniques to hide from humans but visible to bots
  container: {
    position: 'absolute' as const,
    left: '-9999px',
    top: '-9999px',
    width: '1px',
    height: '1px',
    overflow: 'hidden',
    opacity: 0,
    pointerEvents: 'none' as const,
    zIndex: -9999,
  },
  // Alternative using clip
  containerClip: {
    position: 'absolute' as const,
    clip: 'rect(0,0,0,0)',
    clipPath: 'inset(50%)',
    height: '1px',
    width: '1px',
    margin: '-1px',
    overflow: 'hidden',
    padding: 0,
    border: 0,
  },
};



