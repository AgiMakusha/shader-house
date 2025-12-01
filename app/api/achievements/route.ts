import { NextRequest, NextResponse } from 'next/server';
import { getSessionFromRequest } from '@/lib/auth/session';
import { prisma } from '@/lib/db/prisma';

/**
 * GET /api/achievements
 * Get user's achievement progress
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch various stats for achievements
    const [
      reviewsCount,
      betaTestsCount,
      purchasesCount,
    ] = await Promise.all([
      // Count reviews (ratings with comments)
      prisma.rating.count({
        where: {
          userId: session.user.id,
          comment: {
            not: null,
          },
        },
      }),
      // Count beta tests joined
      prisma.betaTester.count({
        where: {
          userId: session.user.id,
        },
      }),
      // Count purchases/games owned
      prisma.purchase.count({
        where: {
          userId: session.user.id,
        },
      }),
    ]);

    // Calculate achievement progress
    const achievements = [
      {
        id: '1',
        name: 'First Steps',
        description: 'Complete your first game',
        icon: 'gamepad',
        unlocked: purchasesCount > 0,
        unlockedAt: purchasesCount > 0 ? new Date() : null,
        rarity: 'common',
      },
      {
        id: '2',
        name: 'Supporter',
        description: 'Support your first developer',
        icon: 'heart',
        unlocked: purchasesCount > 0,
        unlockedAt: purchasesCount > 0 ? new Date() : null,
        rarity: 'common',
      },
      {
        id: '3',
        name: 'Game Tester',
        description: 'Test 5 beta games',
        icon: 'flask',
        unlocked: betaTestsCount >= 5,
        progress: betaTestsCount,
        maxProgress: 5,
        rarity: 'rare',
      },
      {
        id: '4',
        name: 'Community Leader',
        description: 'Write 10 helpful reviews',
        icon: 'message',
        unlocked: reviewsCount >= 10,
        progress: reviewsCount,
        maxProgress: 10,
        rarity: 'epic',
      },
      {
        id: '5',
        name: 'Legend',
        description: 'Unlock all other achievements',
        icon: 'crown',
        unlocked: purchasesCount > 0 && betaTestsCount >= 5 && reviewsCount >= 10,
        rarity: 'legendary',
      },
    ];

    return NextResponse.json({ achievements });
  } catch (error: any) {
    console.error('GET /api/achievements error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch achievements' },
      { status: 500 }
    );
  }
}

