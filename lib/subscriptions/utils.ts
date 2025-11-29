import { prisma } from '@/lib/db/prisma';
import { SubscriptionTier, canAccessFeature } from './types';

/**
 * Check if a user has access to a specific feature based on their subscription
 */
export async function checkSubscriptionAccess(
  userId: string,
  requiredTier: SubscriptionTier
): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { 
      subscriptionTier: true,
      subscriptionStatus: true,
    },
  });

  if (!user) return false;

  // Check if subscription is active
  if (user.subscriptionStatus !== 'ACTIVE' && requiredTier !== 'FREE') {
    return false;
  }

  return canAccessFeature(user.subscriptionTier as SubscriptionTier, requiredTier);
}

/**
 * Get user's supported developers (for Creator Support Pass)
 */
export async function getSupportedDevelopers(userId: string) {
  return await prisma.developerSupport.findMany({
    where: {
      userId,
      isActive: true,
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          image: true,
        },
      },
    },
  });
}

/**
 * Add developer to user's support list
 */
export async function supportDeveloper(userId: string, developerId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { subscriptionTier: true },
  });

  if (!user || user.subscriptionTier === 'FREE') {
    throw new Error('Creator Support Pass required');
  }

  // Check if already supporting
  const existing = await prisma.developerSupport.findUnique({
    where: {
      userId_developerId: {
        userId,
        developerId,
      },
    },
  });

  if (existing) {
    if (existing.isActive) {
      throw new Error('Already supporting this developer');
    }
    // Reactivate
    return await prisma.developerSupport.update({
      where: { id: existing.id },
      data: { isActive: true, endedAt: null },
    });
  }

  // Count active supports
  const activeSupports = await prisma.developerSupport.count({
    where: {
      userId,
      isActive: true,
    },
  });

  // Free tier: 0 supports
  // Creator Support: up to 3
  // Gamer Pro: unlimited
  const maxSupports = user.subscriptionTier === 'CREATOR_SUPPORT' ? 3 : Infinity;

  if (activeSupports >= maxSupports) {
    throw new Error(`Maximum ${maxSupports} developers can be supported with your plan`);
  }

  return await prisma.developerSupport.create({
    data: {
      userId,
      developerId,
      isActive: true,
    },
  });
}

/**
 * Remove developer from support list
 */
export async function unsupportDeveloper(userId: string, developerId: string) {
  return await prisma.developerSupport.updateMany({
    where: {
      userId,
      developerId,
      isActive: true,
    },
    data: {
      isActive: false,
      endedAt: new Date(),
    },
  });
}

/**
 * Check if user can access beta builds
 */
export async function canAccessBeta(userId: string, gameId: string): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { 
      subscriptionTier: true,
      subscriptionStatus: true,
    },
  });

  if (!user || user.subscriptionStatus !== 'ACTIVE') {
    return false;
  }

  // Gamer Pro has access to all betas
  if (user.subscriptionTier === 'GAMER_PRO') {
    return true;
  }

  // Creator Support Pass: only for supported developers
  if (user.subscriptionTier === 'CREATOR_SUPPORT') {
    const game = await prisma.game.findUnique({
      where: { id: gameId },
      select: { developerId: true },
    });

    if (!game) return false;

    const support = await prisma.developerSupport.findFirst({
      where: {
        userId,
        developerId: game.developerId,
        isActive: true,
      },
    });

    return !!support;
  }

  return false;
}

/**
 * Check if user can claim monthly games
 */
export async function canClaimGame(userId: string, gameId: string): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { 
      subscriptionTier: true,
      subscriptionStatus: true,
    },
  });

  if (!user || user.subscriptionStatus !== 'ACTIVE') {
    return false;
  }

  if (user.subscriptionTier === 'FREE') {
    return false;
  }

  // Check if already claimed this month
  const now = new Date();
  const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const existingClaim = await prisma.claimedGame.findFirst({
    where: {
      userId,
      gameId,
      claimMonth: firstDayOfMonth,
    },
  });

  if (existingClaim) {
    return false;
  }

  // Count claims this month
  const claimsThisMonth = await prisma.claimedGame.count({
    where: {
      userId,
      claimMonth: firstDayOfMonth,
    },
  });

  // Creator Support: 1-2 games per month
  // Gamer Pro: unlimited from Pro Library
  const maxClaims = user.subscriptionTier === 'CREATOR_SUPPORT' ? 2 : Infinity;

  return claimsThisMonth < maxClaims;
}

/**
 * Claim a game
 */
export async function claimGame(userId: string, gameId: string, tier: SubscriptionTier) {
  const canClaim = await canClaimGame(userId, gameId);
  
  if (!canClaim) {
    throw new Error('Cannot claim this game');
  }

  const now = new Date();
  const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  return await prisma.claimedGame.create({
    data: {
      userId,
      gameId,
      tier,
      claimMonth: firstDayOfMonth,
    },
  });
}

/**
 * Track playtime (for Gamer Pro revenue distribution)
 */
export async function trackPlaytime(userId: string, gameId: string, durationSeconds: number) {
  return await prisma.playtimeEntry.create({
    data: {
      userId,
      gameId,
      duration: durationSeconds,
      sessionDate: new Date(),
    },
  });
}

/**
 * Get subscription statistics for a developer
 */
export async function getDeveloperSubscriptionStats(developerId: string) {
  const supports = await prisma.developerSupport.count({
    where: {
      developerId,
      isActive: true,
    },
  });

  // Get current month revenue
  const now = new Date();
  const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const revenue = await prisma.developerRevenue.findUnique({
    where: {
      developerId_month: {
        developerId,
        month: firstDayOfMonth,
      },
    },
  });

  return {
    activeSupports: supports,
    monthlyRevenue: revenue || {
      directSales: 0,
      creatorSupport: 0,
      proPlaytime: 0,
      tips: 0,
    },
  };
}

