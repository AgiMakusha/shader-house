/**
 * Behavioral signals for bot detection
 * Tracks user interactions to detect bot-like behavior
 */

export interface BehavioralSignals {
  mouseMovements: number;
  keystrokes: number;
  timeOnPage: number; // milliseconds
  formFillTime: number; // milliseconds
  clipboardPaste: boolean;
  rapidSubmission: boolean; // Submitted too quickly
}

/**
 * Calculate a simple bot score (0-100, higher = more likely bot)
 * Note: Reduced penalties to be more fair to mobile users and fast typers
 */
export function calculateBotScore(signals: BehavioralSignals): number {
  let score = 0;

  // No mouse movements - reduced penalty since mobile/touch users won't have mouse movements
  if (signals.mouseMovements === 0) {
    score += 15; // Reduced from 30
  } else if (signals.mouseMovements < 5) {
    score += 5; // Reduced from 15
  }

  // No keystrokes (bots paste or autofill)
  if (signals.keystrokes === 0) {
    score += 20; // Reduced from 25
  } else if (signals.keystrokes < 10) {
    score += 5; // Reduced from 10
  }

  // Too little time on page (< 3 seconds)
  if (signals.timeOnPage < 3000) {
    score += 15; // Reduced from 20
  } else if (signals.timeOnPage < 5000) {
    score += 5; // Reduced from 10
  }

  // Form filled too quickly (< 2 seconds) - reduced since password managers fill fast
  if (signals.formFillTime < 2000) {
    score += 10; // Reduced from 15
  }

  // Clipboard paste detected - removed penalty, paste is normal behavior
  // (users often paste emails, use password managers, etc.)
  if (signals.clipboardPaste) {
    score += 0; // Removed penalty
  }

  // Rapid submission (submitted within 1 second of page load)
  if (signals.rapidSubmission) {
    score += 20; // Reduced from 25
  }

  return Math.min(100, score);
}

/**
 * Determine if signals indicate likely bot
 * Note: Threshold raised to reduce false positives for mobile users and fast typers
 */
export function isLikelyBot(signals: BehavioralSignals): boolean {
  const score = calculateBotScore(signals);
  return score >= 75; // Raised threshold to reduce false positives
}

/**
 * Get risk level based on bot score
 */
export function getRiskLevel(score: number): 'low' | 'medium' | 'high' {
  if (score < 30) return 'low';
  if (score < 60) return 'medium';
  return 'high';
}

