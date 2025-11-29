import { NextRequest, NextResponse } from 'next/server';
import { getSessionFromRequest } from '@/lib/auth/session';
import { prisma } from '@/lib/db/prisma';
import { hasFeatureAccess, FeatureFlag } from '@/lib/subscriptions/types';
import { getBetaGames } from '@/lib/queries/games';

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

    // Fetch games with releaseStatus = BETA
    const games = await getBetaGames();

    // Transform to match the expected format
    const betaGames = games.map((game) => {
      return {
        id: game.id,
        title: game.title,
        developer: game.developer.name,
        description: game.description,
        coverUrl: game.coverUrl,
        testingPhase: 'beta' as const,
        testersCount: game._count.purchases, // Count of Pro users who have access
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

