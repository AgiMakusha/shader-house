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
      gamesAccessedCount,
      favoritesCount,
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
      // Count games accessed (played/downloaded)
      prisma.gameAccess.count({
        where: {
          userId: session.user.id,
        },
      }),
      // Count favorited games
      prisma.favorite.count({
        where: {
          userId: session.user.id,
        },
      }),
    ]);

    console.log('🏆 Achievement stats for user:', session.user.email, {
      reviewsCount,
      betaTestsCount,
      gamesAccessedCount,
      favoritesCount,
    });

    // Calculate achievement progress
    const achievements = [
      {
        id: '1',
        name: 'First Steps',
        description: 'Discover your first game',
        icon: 'gamepad',
        unlocked: gamesAccessedCount > 0,
        unlockedAt: gamesAccessedCount > 0 ? new Date() : null,
        rarity: 'common',
      },
      {
        id: '2',
        name: 'Collector',
        description: 'Add your first game to favorites',
        icon: 'heart',
        unlocked: favoritesCount > 0,
        unlockedAt: favoritesCount > 0 ? new Date() : null,
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
        unlocked: gamesAccessedCount > 0 && betaTestsCount >= 5 && reviewsCount >= 10,
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

