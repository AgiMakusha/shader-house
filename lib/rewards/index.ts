import { prisma } from '@/lib/db/prisma';
import { RewardType } from '@prisma/client';

/**
 * XP required for each level (exponential growth)
 */
export function getXPForLevel(level: number): number {
  return Math.floor(100 * Math.pow(1.5, level - 1));
}

/**
 * Calculate total XP required to reach a level
 */
export function getTotalXPForLevel(level: number): number {
  let total = 0;
  for (let i = 1; i < level; i++) {
    total += getXPForLevel(i);
  }
  return total;
}

/**
 * Calculate current level based on total XP
 */
export function calculateLevel(xp: number): number {
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

/**
 * XP and Points rewards for different actions
 */
export const REWARD_AMOUNTS = {
  // Discussion Board
  THREAD_CREATED: { xp: 5, points: 10 },
  POST_CREATED: { xp: 3, points: 5 },
  UPVOTE_RECEIVED: { xp: 2, points: 3 },
  HELPFUL_MARKED: { xp: 30, points: 50 },
  DEV_LIKED: { xp: 50, points: 100 },
  
  // Beta Testing
  BETA_TEST: { xp: 50, points: 100 },
  
  // Achievements
  ACHIEVEMENT: { xp: 100, points: 200 },
  
  // Daily
  DAILY_LOGIN: { xp: 5, points: 10 },
  
  // Level up bonuses
  LEVEL_UP_BONUS: { xp: 0, points: 200 }, // Every 5 levels
  LEVEL_UP_BIG_BONUS: { xp: 0, points: 500 }, // Every 10 levels
  LEVEL_UP_HUGE_BONUS: { xp: 0, points: 1000 }, // Level 20
} as const;

/**
 * Daily XP/Points caps to prevent spam
 */
export const DAILY_CAPS = {
  DISCUSSION: { xp: 500, points: 1000 },
  TOTAL: { xp: 1000, points: 2000 },
} as const;

/**
 * Level-based unlocks
 */
export const LEVEL_UNLOCKS = {
  1: { features: ['read', 'post_limited', 'reply'] },
  2: { features: ['post_unlimited'] },
  3: { features: ['vote'], badge: 'Active Member' },
  5: { features: ['attach_images', 'pin_posts'], bonusPoints: 200 },
  6: { features: [], badge: 'Experienced Gamer' },
  8: { features: ['attach_videos', 'edit_wiki'] },
  10: { features: ['flag_spam', 'custom_badges'], badge: 'Community Helper', bonusPoints: 500 },
  12: { features: ['close_duplicates'] },
  15: { features: ['moderator_tools'], badge: 'Veteran', bonusPoints: 1000 },
  20: { features: [], badge: 'Legend', bonusPoints: 1000 },
} as const;

/**
 * Award XP and Points to a user
 */
export async function awardRewards(
  userId: string,
  rewardType: RewardType,
  options?: {
    reason?: string;
    threadId?: string;
    postId?: string;
    multiplier?: number;
  }
) {
  const { reason, threadId, postId, multiplier = 1 } = options || {};
  
  // Get reward amounts
  const baseReward = REWARD_AMOUNTS[rewardType] || { xp: 0, points: 0 };
  const xpToAward = Math.floor(baseReward.xp * multiplier);
  const pointsToAward = Math.floor(baseReward.points * multiplier);
  
  // Check daily caps
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const todayRewards = await prisma.rewardHistory.aggregate({
    where: {
      userId,
      createdAt: { gte: today },
      type: {
        in: ['THREAD_CREATED', 'POST_CREATED', 'UPVOTE_RECEIVED', 'HELPFUL_MARKED', 'DEV_LIKED'],
      },
    },
    _sum: {
      xpEarned: true,
      pointsEarned: true,
    },
  });
  
  const todayXP = todayRewards._sum.xpEarned || 0;
  const todayPoints = todayRewards._sum.pointsEarned || 0;
  
  // Cap rewards
  const cappedXP = Math.min(xpToAward, Math.max(0, DAILY_CAPS.DISCUSSION.xp - todayXP));
  const cappedPoints = Math.min(pointsToAward, Math.max(0, DAILY_CAPS.DISCUSSION.points - todayPoints));
  
  // If capped to 0, return early
  if (cappedXP === 0 && cappedPoints === 0) {
    return {
      success: false,
      message: 'Daily cap reached',
      xpAwarded: 0,
      pointsAwarded: 0,
    };
  }
  
  // Get user's current stats
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { xp: true, level: true, points: true, xpFromCommunity: true, pointsEarned: true },
  });
  
  if (!user) {
    throw new Error('User not found');
  }
  
  const oldLevel = user.level;
  const newXP = user.xp + cappedXP;
  const newLevel = calculateLevel(newXP);
  const leveledUp = newLevel > oldLevel;
  
  // Calculate level-up bonuses
  let levelUpBonus = 0;
  if (leveledUp) {
    for (let level = oldLevel + 1; level <= newLevel; level++) {
      if (level === 20) {
        levelUpBonus += REWARD_AMOUNTS.LEVEL_UP_HUGE_BONUS.points;
      } else if (level % 10 === 0) {
        levelUpBonus += REWARD_AMOUNTS.LEVEL_UP_BIG_BONUS.points;
      } else if (level % 5 === 0) {
        levelUpBonus += REWARD_AMOUNTS.LEVEL_UP_BONUS.points;
      }
      
      // Check if user unlocks a badge
      const unlock = LEVEL_UNLOCKS[level as keyof typeof LEVEL_UNLOCKS];
      if (unlock?.badge) {
        // Add badge
        await prisma.user.update({
          where: { id: userId },
          data: {
            badges: {
              push: unlock.badge,
            },
          },
        });
      }
    }
  }
  
  const totalPointsAwarded = cappedPoints + levelUpBonus;
  
  // Update user stats
  await prisma.user.update({
    where: { id: userId },
    data: {
      xp: newXP,
      level: newLevel,
      points: { increment: totalPointsAwarded },
      xpFromCommunity: { increment: cappedXP },
      pointsEarned: { increment: totalPointsAwarded },
    },
  });
  
  // Create reward history entry
  await prisma.rewardHistory.create({
    data: {
      userId,
      type: rewardType,
      xpEarned: cappedXP,
      pointsEarned: totalPointsAwarded,
      reason: reason || rewardType,
      threadId,
      postId,
    },
  });
  
  // If leveled up, create a separate entry for the bonus
  if (leveledUp && levelUpBonus > 0) {
    await prisma.rewardHistory.create({
      data: {
        userId,
        type: 'LEVEL_UP_BONUS',
        xpEarned: 0,
        pointsEarned: levelUpBonus,
        reason: `Level ${oldLevel} → ${newLevel}`,
      },
    });
  }
  
  return {
    success: true,
    xpAwarded: cappedXP,
    pointsAwarded: totalPointsAwarded,
    oldLevel,
    newLevel,
    leveledUp,
    levelUpBonus,
    unlockedBadges: leveledUp 
      ? Object.entries(LEVEL_UNLOCKS)
          .filter(([level]) => parseInt(level) > oldLevel && parseInt(level) <= newLevel)
          .map(([, unlock]) => unlock.badge)
          .filter(Boolean)
      : [],
  };
}

/**
 * Check if user can perform an action based on level
 */
export function canPerformAction(level: number, action: string): boolean {
  for (const [unlockLevel, unlock] of Object.entries(LEVEL_UNLOCKS)) {
    if (level >= parseInt(unlockLevel) && unlock.features.includes(action)) {
      return true;
    }
  }
  return false;
}

/**
 * Get user's progress to next level
 */
export function getLevelProgress(xp: number): {
  currentLevel: number;
  currentXP: number;
  xpForCurrentLevel: number;
  xpForNextLevel: number;
  progress: number;
} {
  const currentLevel = calculateLevel(xp);
  const totalXPForCurrentLevel = getTotalXPForLevel(currentLevel);
  const currentXP = xp - totalXPForCurrentLevel;
  const xpForNextLevel = getXPForLevel(currentLevel);
  const progress = Math.floor((currentXP / xpForNextLevel) * 100);
  
  return {
    currentLevel,
    currentXP,
    xpForCurrentLevel: totalXPForCurrentLevel,
    xpForNextLevel,
    progress,
  };
}

