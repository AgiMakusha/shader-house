import { NextRequest, NextResponse } from 'next/server';
import { getSessionFromRequest } from '@/lib/auth/session';
import { prisma } from '@/lib/db/prisma';
import { hasFeatureAccess, FeatureFlag } from '@/lib/subscriptions/types';

/**
 * GET /api/games/beta
 * Fetch all games with active beta access
 * Only accessible to users with Creator Support Pass (Pro subscription)
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user has Pro subscription (Creator Support Pass)
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { subscriptionTier: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Verify user has beta access feature
    const hasBetaAccess = hasFeatureAccess(user.subscriptionTier, FeatureFlag.BETA_ACCESS);

    if (!hasBetaAccess) {
      return NextResponse.json(
        { 
          error: 'Beta access requires Creator Support Pass subscription',
          requiresUpgrade: true,
        },
        { status: 403 }
      );
    }

    // Fetch games with active beta access
    const games = await prisma.game.findMany({
      where: {
        betaAccess: {
          some: {
            isActive: true,
          },
        },
      },
      include: {
        developer: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        betaAccess: {
          where: {
            isActive: true,
          },
          select: {
            id: true,
            maxTesters: true,
            _count: {
              select: {
                testers: true,
              },
            },
          },
        },
        _count: {
          select: {
            ratings: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Transform to match the expected format
    const betaGames = games.map((game) => {
      const betaInfo = game.betaAccess[0];
      return {
        id: game.id,
        title: game.title,
        developer: game.developer.name,
        description: game.description,
        coverUrl: game.coverUrl,
        testingPhase: 'beta' as const, // You can add this field to the Game model if needed
        testersCount: betaInfo?._count?.testers || 0,
        feedbackCount: game._count.ratings,
        slug: game.slug,
        externalUrl: game.externalUrl,
        gameFileUrl: game.gameFileUrl,
      };
    });

    return NextResponse.json({ games: betaGames });
  } catch (error: any) {
    console.error('Fetch beta games error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch beta games' },
      { status: 500 }
    );
  }
}

