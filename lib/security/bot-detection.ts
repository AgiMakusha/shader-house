/**
 * Enhanced bot detection combining multiple signals
 * Analyzes behavioral, browser, and honeypot signals to detect bots
 */

import { BehavioralSignals, calculateBotScore as calculateBehavioralScore } from './behavioral-signals';
import { checkHoneypot, HoneypotFields } from './honeypot';

/**
 * Browser signals received from client
 */
export interface BrowserSignals {
  screenWidth: number;
  screenHeight: number;
  colorDepth: number;
  pixelRatio: number;
  cookiesEnabled: boolean;
  languages: string;
  platform: string;
  hardwareConcurrency: number;
  deviceMemory: number | null;
  timezone: string;
  timezoneOffset: number;
  webglVendor: string | null;
  webglRenderer: string | null;
  canvasHash: string;
  hasWebdriver: boolean;
  hasAutomation: boolean;
  hasPhantom: boolean;
  hasSelenium: boolean;
  hasNightmare: boolean;
  hasCasperJS: boolean;
  touchPoints: number;
  audioHash: string;
  fontsDetected: number;
  pluginCount: number;
  hasNotificationAPI: boolean;
  hasBatteryAPI: boolean;
  doNotTrack: string | null;
}

/**
 * Request metadata for bot detection
 */
export interface RequestMetadata {
  ip: string;
  userAgent: string;
  headers: Record<string, string | undefined>;
}

/**
 * Complete bot detection result
 */
export interface BotDetectionResult {
  isBot: boolean;
  score: number;
  confidence: 'low' | 'medium' | 'high' | 'critical';
  reasons: string[];
  category: 'clean' | 'suspicious' | 'likely_bot' | 'definite_bot';
  breakdown: {
    behavioral: number;
    browser: number;
    honeypot: number;
    request: number;
  };
}

/**
 * Combined bot detection from all signal sources
 */
export function detectBot(
  behavioral: BehavioralSignals | null,
  browser: BrowserSignals | null,
  honeypot: HoneypotFields | null,
  request: RequestMetadata
): BotDetectionResult {
  const reasons: string[] = [];
  const breakdown = {
    behavioral: 0,
    browser: 0,
    honeypot: 0,
    request: 0,
  };

  // ============ HONEYPOT CHECK (Highest Priority) ============
  if (honeypot) {
    const honeypotResult = checkHoneypot(honeypot);
    if (honeypotResult.isBot) {
      breakdown.honeypot = 100;
      reasons.push(`Honeypot: ${honeypotResult.reason}`);
      
      // Honeypot triggered = definite bot
      return {
        isBot: true,
        score: 100,
        confidence: 'critical',
        category: 'definite_bot',
        reasons,
        breakdown,
      };
    }
  }

  // ============ BEHAVIORAL SIGNALS ============
  if (behavioral) {
    breakdown.behavioral = calculateBehavioralScore(behavioral);
    
    if (behavioral.mouseMovements === 0) {
      reasons.push('No mouse movement');
    }
    if (behavioral.keystrokes === 0) {
      reasons.push('No keystrokes');
    }
    if (behavioral.timeOnPage < 3000) {
      reasons.push('Very short time on page');
    }
    if (behavioral.rapidSubmission) {
      reasons.push('Rapid form submission');
    }
    if (behavioral.formFillTime < 2000 && behavioral.keystrokes > 0) {
      reasons.push('Form filled too quickly');
    }
  }

  // ============ BROWSER SIGNALS ============
  if (browser) {
    // Headless browser indicators (critical - these are definite bot signals)
    if (browser.hasWebdriver) {
      breakdown.browser += 50;
      reasons.push('WebDriver detected');
    }
    if (browser.hasPhantom) {
      breakdown.browser += 50;
      reasons.push('PhantomJS detected');
    }
    if (browser.hasSelenium) {
      breakdown.browser += 50;
      reasons.push('Selenium detected');
    }
    if (browser.hasNightmare) {
      breakdown.browser += 50;
      reasons.push('Nightmare.js detected');
    }
    if (browser.hasCasperJS) {
      breakdown.browser += 50;
      reasons.push('CasperJS detected');
    }

    // Missing browser features - reduced penalties for privacy browsers
    if (!browser.webglVendor && !browser.webglRenderer) {
      breakdown.browser += 10; // Reduced from 20 - some privacy browsers block WebGL
      reasons.push('No WebGL support');
    }
    if (browser.canvasHash === 'no-canvas' || browser.canvasHash === 'error') {
      breakdown.browser += 8; // Reduced from 15 - privacy browsers may block canvas
      reasons.push('Canvas fingerprint failed');
    }
    if (browser.audioHash === 'no-audio' || browser.audioHash === 'error') {
      breakdown.browser += 5; // Reduced from 10
      reasons.push('Audio fingerprint failed');
    }

    // Screen anomalies - only flag truly suspicious sizes
    if (browser.screenWidth === 0 || browser.screenHeight === 0) {
      breakdown.browser += 25; // Reduced from 30
      reasons.push('Invalid screen dimensions');
    }
    if (browser.screenWidth === 800 && browser.screenHeight === 600) {
      breakdown.browser += 10; // Reduced from 15
      reasons.push('Typical headless resolution');
    }

    // Missing capabilities - reduced penalties, many are normal for mobile/privacy browsers
    if (!browser.cookiesEnabled) {
      breakdown.browser += 10; // Reduced from 15
      reasons.push('Cookies disabled');
    }
    if (browser.pluginCount === 0) {
      breakdown.browser += 0; // Removed - modern Chrome has no plugins, this is normal
      // reasons.push('No browser plugins'); // Removed
    }
    if (browser.fontsDetected < 5) {
      breakdown.browser += 8; // Reduced from 15
      reasons.push('Very few fonts installed');
    }
    if (browser.hardwareConcurrency === 0) {
      breakdown.browser += 5; // Reduced from 10
      reasons.push('No hardware concurrency info');
    }
    if (!browser.languages) {
      breakdown.browser += 5; // Reduced from 10
      reasons.push('No language preferences');
    }

    // Cap browser score at 100
    breakdown.browser = Math.min(100, breakdown.browser);
  }

  // ============ REQUEST SIGNALS ============
  if (request) {
    // User-Agent analysis
    if (!request.userAgent || request.userAgent.length < 20) {
      breakdown.request += 20; // Reduced from 25
      reasons.push('Invalid or missing User-Agent');
    } else {
      // Known bot patterns in User-Agent - keep strict as these are definite bot indicators
      const botPatterns = /bot|crawl|spider|scrape|headless|phantom|selenium|puppeteer|playwright|wget|curl|python-requests|axios|fetch|node-fetch/i;
      if (botPatterns.test(request.userAgent)) {
        breakdown.request += 40;
        reasons.push('Bot pattern in User-Agent');
      }
    }

    // Missing common headers - reduced penalties, privacy extensions often strip these
    if (!request.headers['accept-language']) {
      breakdown.request += 8; // Reduced from 15
      reasons.push('Missing Accept-Language header');
    }
    if (!request.headers['accept-encoding']) {
      breakdown.request += 5; // Reduced from 10
      reasons.push('Missing Accept-Encoding header');
    }
    if (!request.headers['accept']) {
      breakdown.request += 5; // Reduced from 10
      reasons.push('Missing Accept header');
    }

    // Check for automation indicators in headers - keep strict
    const suspiciousHeaders = ['x-requested-with-automation', 'x-selenium', 'x-puppeteer'];
    for (const header of suspiciousHeaders) {
      if (request.headers[header]) {
        breakdown.request += 30;
        reasons.push(`Automation header: ${header}`);
      }
    }

    // Cap request score at 100
    breakdown.request = Math.min(100, breakdown.request);
  }

  // ============ CALCULATE FINAL SCORE ============
  // Weighted average with priority to high-confidence signals
  const weights = {
    behavioral: 0.3,
    browser: 0.35,
    honeypot: 0.2,
    request: 0.15,
  };

  const totalScore = Math.round(
    breakdown.behavioral * weights.behavioral +
    breakdown.browser * weights.browser +
    breakdown.honeypot * weights.honeypot +
    breakdown.request * weights.request
  );

  // Determine confidence and category
  // Note: Thresholds raised to reduce false positives for legitimate users
  // (mobile users, privacy-focused browsers, fast typers)
  let confidence: 'low' | 'medium' | 'high' | 'critical';
  let category: 'clean' | 'suspicious' | 'likely_bot' | 'definite_bot';
  let isBot: boolean;

  if (totalScore >= 85) {
    confidence = 'critical';
    category = 'definite_bot';
    isBot = true;
  } else if (totalScore >= 75) {
    confidence = 'high';
    category = 'likely_bot';
    isBot = true;
  } else if (totalScore >= 50) {
    confidence = 'medium';
    category = 'suspicious';
    isBot = false; // Give benefit of doubt
  } else {
    confidence = 'low';
    category = 'clean';
    isBot = false;
  }

  return {
    isBot,
    score: Math.min(100, totalScore),
    confidence,
    category,
    reasons: [...new Set(reasons)], // Remove duplicates
    breakdown,
  };
}

/**
 * Quick bot check for lightweight validation
 * Use this for less critical endpoints
 */
export function quickBotCheck(
  behavioral: BehavioralSignals | null,
  honeypot: HoneypotFields | null
): { isBot: boolean; reason?: string } {
  // Check honeypot first
  if (honeypot) {
    const honeypotResult = checkHoneypot(honeypot);
    if (honeypotResult.isBot) {
      return { isBot: true, reason: honeypotResult.reason };
    }
  }

  // Quick behavioral check
  if (behavioral) {
    const score = calculateBehavioralScore(behavioral);
    if (score >= 70) {
      return { isBot: true, reason: 'Suspicious behavioral patterns' };
    }
  }

  return { isBot: false };
}

/**
 * Log bot detection event for monitoring
 */
export function logBotDetection(
  result: BotDetectionResult,
  ip: string,
  endpoint: string
): void {
  if (result.isBot || result.category === 'suspicious') {
    console.warn(
      `[BOT DETECTION] ${result.category.toUpperCase()}`,
      {
        ip,
        endpoint,
        score: result.score,
        confidence: result.confidence,
        reasons: result.reasons,
        breakdown: result.breakdown,
        timestamp: new Date().toISOString(),
      }
    );
  }
}

