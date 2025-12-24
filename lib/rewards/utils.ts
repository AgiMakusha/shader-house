/**
 * Rewards Utility Functions
 */

import { prisma } from '@/lib/db/prisma';
import { RewardType } from '@prisma/client';
import {
  REWARD_CONFIGS,
  RewardResult,
  getLevelFromXP,
  getLevelUpBonus,
  MAX_XP_PER_DAY_FROM_DISCUSSIONS,
  MAX_POINTS_PER_DAY_FROM_DISCUSSIONS,
} from './types';

/**
 * Award XP and Points to a user
 */
export async function awardReward(
  userId: string,
  rewardType: RewardType,
  reason: string,
  options?: {
    threadId?: string;
    postId?: string;
    skipDailyLimit?: boolean;
  }
): Promise<RewardResult> {
  const config = REWARD_CONFIGS[rewardType];
  
  // Check daily limits for discussion-related rewards
  if (
    !options?.skipDailyLimit &&
    (rewardType === 'THREAD_CREATED' ||
     rewardType === 'POST_CREATED' ||
     rewardType === 'UPVOTE_RECEIVED')
  ) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Check if max per day limit reached
    if (config.maxPerDay) {
      const count = await prisma.rewardHistory.count({
        where: {
          userId,
          type: rewardType,
          createdAt: { gte: today },
        },
      });
      
      if (count >= config.maxPerDay) {
        // Return zero reward
        const user = await prisma.user.findUnique({
          where: { id: userId },
          select: { xp: true, points: true, level: true },
        });
        
        return {
          xpEarned: 0,
          pointsEarned: 0,
          newXp: user?.xp || 0,
          newPoints: user?.points || 0,
          newLevel: user?.level || 1,
          leveledUp: false,
        };
      }
    }
    
    // Check daily XP/Points limits
    const todayRewards = await prisma.rewardHistory.aggregate({
      where: {
        userId,
        createdAt: { gte: today },
        type: {
          in: ['THREAD_CREATED', 'POST_CREATED', 'UPVOTE_RECEIVED'],
        },
      },
      _sum: {
        xpEarned: true,
        pointsEarned: true,
      },
    });
    
    const todayXp = todayRewards._sum.xpEarned || 0;
    const todayPoints = todayRewards._sum.pointsEarned || 0;
    
    // Cap rewards if limits reached
    let xpToAward = config.xp;
    let pointsToAward = config.points;
    
    if (todayXp >= MAX_XP_PER_DAY_FROM_DISCUSSIONS) {
      xpToAward = 0;
    } else if (todayXp + xpToAward > MAX_XP_PER_DAY_FROM_DISCUSSIONS) {
      xpToAward = MAX_XP_PER_DAY_FROM_DISCUSSIONS - todayXp;
    }
    
    if (todayPoints >= MAX_POINTS_PER_DAY_FROM_DISCUSSIONS) {
      pointsToAward = 0;
    } else if (todayPoints + pointsToAward > MAX_POINTS_PER_DAY_FROM_DISCUSSIONS) {
      pointsToAward = MAX_POINTS_PER_DAY_FROM_DISCUSSIONS - todayPoints;
    }
    
    if (xpToAward === 0 && pointsToAward === 0) {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { xp: true, points: true, level: true },
      });
      
      return {
        xpEarned: 0,
        pointsEarned: 0,
        newXp: user?.xp || 0,
        newPoints: user?.points || 0,
        newLevel: user?.level || 1,
        leveledUp: false,
      };
    }
    
    // Update config with capped values
    config.xp = xpToAward;
    config.points = pointsToAward;
  }
  
  // Get current user stats
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { xp: true, points: true, level: true, xpFromCommunity: true, pointsEarned: true },
  });
  
  if (!user) {
    throw new Error('User not found');
  }
  
  const newXp = user.xp + config.xp;
  const newPoints = user.points + config.points;
  const newLevel = getLevelFromXP(newXp);
  const leveledUp = newLevel > user.level;
  
  // Calculate level up bonus
  let bonusPoints = 0;
  if (leveledUp) {
    bonusPoints = getLevelUpBonus(newLevel);
  }
  
  // Update user in a transaction
  await prisma.$transaction([
    // Update user stats
    prisma.user.update({
      where: { id: userId },
      data: {
        xp: newXp,
        level: newLevel,
        points: newPoints + bonusPoints,
        xpFromCommunity: {
          increment: config.xp,
        },
        pointsEarned: {
          increment: config.points + bonusPoints,
        },
      },
    }),
    
    // Record reward in history
    prisma.rewardHistory.create({
      data: {
        userId,
        type: rewardType,
        xpEarned: config.xp,
        pointsEarned: config.points,
        reason,
        threadId: options?.threadId,
        postId: options?.postId,
      },
    }),
    
    // Record level up bonus if applicable
    ...(leveledUp && bonusPoints > 0
      ? [
          prisma.rewardHistory.create({
            data: {
              userId,
              type: 'LEVEL_UP_BONUS' as RewardType,
              xpEarned: 0,
              pointsEarned: bonusPoints,
              reason: `Level ${newLevel} bonus`,
            },
          }),
        ]
      : []),
  ]);
  
  return {
    xpEarned: config.xp,
    pointsEarned: config.points,
    newXp,
    newPoints: newPoints + bonusPoints,
    newLevel,
    leveledUp,
    bonusPoints: leveledUp ? bonusPoints : undefined,
  };
}

/**
 * Get user's reward stats for today
 */
export async function getTodayRewardStats(userId: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const stats = await prisma.rewardHistory.aggregate({
    where: {
      userId,
      createdAt: { gte: today },
    },
    _sum: {
      xpEarned: true,
      pointsEarned: true,
    },
    _count: true,
  });
  
  return {
    xpEarned: stats._sum.xpEarned || 0,
    pointsEarned: stats._sum.pointsEarned || 0,
    rewardCount: stats._count,
    xpRemaining: Math.max(0, MAX_XP_PER_DAY_FROM_DISCUSSIONS - (stats._sum.xpEarned || 0)),
    pointsRemaining: Math.max(0, MAX_POINTS_PER_DAY_FROM_DISCUSSIONS - (stats._sum.pointsEarned || 0)),
  };
}

/**
 * Check if user can perform action based on level
 */
export function canPerformAction(userLevel: number, action: string): boolean {
  const levelRequirements: Record<string, number> = {
    upvote: 3,
    downvote: 3,
    attachImage: 5,
    attachVideo: 8,
    editWiki: 8,
    flagSpam: 8,
    suggestPin: 10,
    closeDuplicate: 11,
    moderator: 15,
  };
  
  return userLevel >= (levelRequirements[action] || 0);
}








