/**
 * Content Spam Detection
 * Analyzes user-generated content for spam patterns
 */

export interface SpamCheckResult {
  isSpam: boolean;
  score: number; // 0-100, higher = more likely spam
  reasons: string[];
  category: 'clean' | 'suspicious' | 'likely_spam' | 'definite_spam';
}

/**
 * Common spam keywords and phrases
 */
const SPAM_KEYWORDS = [
  // Promotional spam
  'buy now', 'click here', 'subscribe now', 'limited offer', 'act now',
  'free money', 'make money fast', 'work from home', 'earn cash',
  'discount code', 'special offer', 'exclusive deal',
  // Crypto/NFT spam
  'crypto', 'bitcoin', 'ethereum', 'nft', 'airdrop', 'token sale',
  'ico', 'defi', 'web3 opportunity', 'mint now', 'whitelist',
  // Phishing patterns
  'verify your account', 'confirm your identity', 'account suspended',
  'urgent action required', 'security alert',
  // Adult content
  'onlyfans', 'dating site', 'meet singles', 'hot girls', 'adult content',
  // Generic spam
  'congratulations you won', 'you have been selected', 'claim your prize',
  'wire transfer', 'nigerian prince', 'lottery winner',
];

/**
 * Suspicious URL patterns
 */
const SUSPICIOUS_URL_PATTERNS = [
  /bit\.ly/i,
  /tinyurl\.com/i,
  /t\.co/i,
  /goo\.gl/i,
  /discord\.gift/i,
  /discord\.gg\/[a-z0-9]+$/i, // Discord invite without context
  /telegram\.me/i,
  /t\.me/i,
  /wa\.me/i, // WhatsApp
];

/**
 * Blocked domains (known spam/scam sites)
 */
const BLOCKED_DOMAINS = [
  'bit.ly',
  'tinyurl.com',
  'rb.gy',
  'cutt.ly',
  'shorturl.at',
  // Add more as needed
];

/**
 * Check content for spam patterns
 */
export function checkSpam(content: string, options?: {
  checkUrls?: boolean;
  maxLinks?: number;
  minLength?: number;
}): SpamCheckResult {
  const opts = {
    checkUrls: true,
    maxLinks: 3,
    minLength: 10,
    ...options,
  };

  let score = 0;
  const reasons: string[] = [];
  const lowerContent = content.toLowerCase();

  // ============ CONTENT ANALYSIS ============

  // 1. Check for spam keywords
  const foundKeywords: string[] = [];
  for (const keyword of SPAM_KEYWORDS) {
    if (lowerContent.includes(keyword.toLowerCase())) {
      foundKeywords.push(keyword);
    }
  }
  if (foundKeywords.length > 0) {
    score += Math.min(40, foundKeywords.length * 10);
    reasons.push(`Spam keywords: ${foundKeywords.slice(0, 3).join(', ')}`);
  }

  // 2. Check for excessive links
  const urlMatches = content.match(/https?:\/\/[^\s]+/gi) || [];
  if (urlMatches.length > opts.maxLinks) {
    score += 25;
    reasons.push(`Excessive links: ${urlMatches.length}`);
  }

  // 3. Check for suspicious URLs
  if (opts.checkUrls && urlMatches.length > 0) {
    for (const url of urlMatches) {
      for (const pattern of SUSPICIOUS_URL_PATTERNS) {
        if (pattern.test(url)) {
          score += 20;
          reasons.push(`Suspicious URL pattern detected`);
          break;
        }
      }
      
      // Check blocked domains
      try {
        const domain = new URL(url).hostname.toLowerCase();
        if (BLOCKED_DOMAINS.some(blocked => domain.includes(blocked))) {
          score += 30;
          reasons.push(`Blocked domain: ${domain}`);
        }
      } catch {
        // Invalid URL
      }
    }
  }

  // 4. Check for repeated characters (spaaaaaaam)
  if (/(.)\1{5,}/i.test(content)) {
    score += 15;
    reasons.push('Repeated characters');
  }

  // 5. Check for excessive caps (SHOUTING)
  const letters = content.replace(/[^a-zA-Z]/g, '');
  if (letters.length > 20) {
    const capsRatio = (content.match(/[A-Z]/g) || []).length / letters.length;
    if (capsRatio > 0.7) {
      score += 20;
      reasons.push('Excessive caps');
    }
  }

  // 6. Check for duplicate sentences
  const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 10);
  if (sentences.length > 2) {
    const uniqueSentences = new Set(sentences.map(s => s.trim().toLowerCase()));
    if (uniqueSentences.size < sentences.length * 0.5) {
      score += 30;
      reasons.push('Duplicate content');
    }
  }

  // 7. Check for very short content (low effort)
  if (content.trim().length < opts.minLength) {
    score += 10;
    reasons.push('Content too short');
  }

  // 8. Check for emoji spam
  const emojiCount = (content.match(/[\u{1F300}-\u{1F9FF}]/gu) || []).length;
  if (emojiCount > 10) {
    score += 15;
    reasons.push('Excessive emojis');
  }

  // 9. Check for phone numbers (often spam)
  const phonePattern = /(?:\+\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g;
  if (phonePattern.test(content)) {
    score += 15;
    reasons.push('Phone number detected');
  }

  // 10. Check for email addresses in content (self-promotion)
  const emailPattern = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
  const emails = content.match(emailPattern) || [];
  if (emails.length > 1) {
    score += 20;
    reasons.push('Multiple email addresses');
  }

  // ============ DETERMINE CATEGORY ============
  let category: SpamCheckResult['category'];
  let isSpam: boolean;

  if (score >= 70) {
    category = 'definite_spam';
    isSpam = true;
  } else if (score >= 50) {
    category = 'likely_spam';
    isSpam = true;
  } else if (score >= 30) {
    category = 'suspicious';
    isSpam = false; // Give benefit of doubt
  } else {
    category = 'clean';
    isSpam = false;
  }

  return {
    isSpam,
    score: Math.min(100, score),
    reasons: [...new Set(reasons)],
    category,
  };
}

/**
 * Check if content contains profanity
 * Returns cleaned content and whether it had profanity
 */
export function checkProfanity(content: string): {
  hasProfanity: boolean;
  cleaned: string;
  words: string[];
} {
  // Basic profanity list (expand as needed)
  const profanityList = [
    'fuck', 'shit', 'ass', 'bitch', 'damn', 'crap', 'bastard',
    'dick', 'cock', 'pussy', 'cunt', 'whore', 'slut', 'fag',
    'nigger', 'nigga', 'retard', 'retarded',
  ];

  const words: string[] = [];
  let cleaned = content;

  for (const word of profanityList) {
    const regex = new RegExp(`\\b${word}\\b`, 'gi');
    if (regex.test(content)) {
      words.push(word);
      cleaned = cleaned.replace(regex, '*'.repeat(word.length));
    }
  }

  return {
    hasProfanity: words.length > 0,
    cleaned,
    words,
  };
}

/**
 * Quick spam check for performance-critical paths
 * Returns true if definitely spam
 */
export function isDefiniteSpam(content: string): boolean {
  const lowerContent = content.toLowerCase();
  
  // Check for obvious spam patterns
  const obviousSpam = [
    'click here to',
    'buy now',
    'free money',
    'make $',
    'earn $',
    'work from home',
    'congratulations you',
    'you have won',
    'claim your prize',
  ];

  for (const pattern of obviousSpam) {
    if (lowerContent.includes(pattern)) {
      return true;
    }
  }

  // Check for excessive links
  const linkCount = (content.match(/https?:\/\//gi) || []).length;
  if (linkCount > 5) {
    return true;
  }

  return false;
}

/**
 * Calculate content quality score (inverse of spam score)
 * Higher = better quality
 */
export function getContentQualityScore(content: string): number {
  const spamResult = checkSpam(content);
  return Math.max(0, 100 - spamResult.score);
}

