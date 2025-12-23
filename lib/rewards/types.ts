/**
 * Reward Types and Constants
 */

import { RewardType } from '@prisma/client';

export interface RewardConfig {
  xp: number;
  points: number;
  maxPerDay?: number; // Maximum times this reward can be earned per day
}

export interface RewardResult {
  xpEarned: number;
  pointsEarned: number;
  newXp: number;
  newPoints: number;
  newLevel: number;
  leveledUp: boolean;
  bonusPoints?: number; // Bonus points from leveling up
}

// Reward configurations
export const REWARD_CONFIGS: Record<RewardType, RewardConfig> = {
  // Discussion Board
  THREAD_CREATED: { xp: 5, points: 10, maxPerDay: 20 },
  POST_CREATED: { xp: 3, points: 5, maxPerDay: 50 },
  UPVOTE_RECEIVED: { xp: 2, points: 3 },
  HELPFUL_MARKED: { xp: 30, points: 50 },
  DEV_LIKED: { xp: 50, points: 100 },
  
  // Beta Testing
  BETA_TEST: { xp: 50, points: 100 },
  
  // General
  ACHIEVEMENT: { xp: 100, points: 200 },
  DAILY_LOGIN: { xp: 5, points: 10, maxPerDay: 1 },
  LEVEL_UP_BONUS: { xp: 0, points: 0 }, // Points calculated dynamically
};

// XP needed for a single level (e.g., Level 4 → Level 5)
export function getXPForLevel(level: number): number {
  return Math.floor(100 * Math.pow(1.5, level - 1));
}

// Get cumulative XP threshold to reach a specific level
// Example: getTotalXPForLevel(5) = total XP needed to reach Level 5
export function getTotalXPForLevel(targetLevel: number): number {
  let totalXP = 0;
  for (let level = 1; level < targetLevel; level++) {
    totalXP += getXPForLevel(level);
  }
  return totalXP;
}

// Calculate level from total XP
export function getLevelFromXP(xp: number): number {
  let level = 1;
  let xpNeeded = 0;
  
  while (xpNeeded <= xp) {
    xpNeeded += getXPForLevel(level);
    if (xpNeeded <= xp) {
      level++;
    }
  }
  
  return level;
}

// Get XP progress within current level
// Returns { current, needed, remaining, percentage }
export function getXPProgress(totalXP: number, currentLevel: number) {
  const currentLevelThreshold = getTotalXPForLevel(currentLevel);
  const nextLevelThreshold = getTotalXPForLevel(currentLevel + 1);
  const xpIntoLevel = totalXP - currentLevelThreshold;
  const xpNeededForLevel = nextLevelThreshold - currentLevelThreshold;
  const remaining = nextLevelThreshold - totalXP;
  const percentage = Math.min(100, (xpIntoLevel / xpNeededForLevel) * 100);
  
  return {
    current: xpIntoLevel,
    needed: xpNeededForLevel,
    remaining,
    percentage,
  };
}

// Level up bonus points
export function getLevelUpBonus(level: number): number {
  if (level % 10 === 0) return 500;
  if (level % 5 === 0) return 200;
  return 0;
}

// XP limits per day to prevent spam
export const MAX_XP_PER_DAY_FROM_DISCUSSIONS = 500;
export const MAX_POINTS_PER_DAY_FROM_DISCUSSIONS = 1000;

