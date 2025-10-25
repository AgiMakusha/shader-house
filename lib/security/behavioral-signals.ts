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
 */
export function calculateBotScore(signals: BehavioralSignals): number {
  let score = 0;

  // No mouse movements (bots often don't simulate mouse)
  if (signals.mouseMovements === 0) {
    score += 30;
  } else if (signals.mouseMovements < 5) {
    score += 15;
  }

  // No keystrokes (bots paste or autofill)
  if (signals.keystrokes === 0) {
    score += 25;
  } else if (signals.keystrokes < 10) {
    score += 10;
  }

  // Too little time on page (< 3 seconds)
  if (signals.timeOnPage < 3000) {
    score += 20;
  } else if (signals.timeOnPage < 5000) {
    score += 10;
  }

  // Form filled too quickly (< 2 seconds)
  if (signals.formFillTime < 2000) {
    score += 15;
  }

  // Clipboard paste detected (not necessarily bad, but worth noting)
  if (signals.clipboardPaste) {
    score += 5;
  }

  // Rapid submission (submitted within 1 second of page load)
  if (signals.rapidSubmission) {
    score += 25;
  }

  return Math.min(100, score);
}

/**
 * Determine if signals indicate likely bot
 */
export function isLikelyBot(signals: BehavioralSignals): boolean {
  const score = calculateBotScore(signals);
  return score >= 50; // Threshold for bot detection
}

/**
 * Get risk level based on bot score
 */
export function getRiskLevel(score: number): 'low' | 'medium' | 'high' {
  if (score < 30) return 'low';
  if (score < 60) return 'medium';
  return 'high';
}

