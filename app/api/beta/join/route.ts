import { NextRequest, NextResponse } from 'next/server';
import { getSessionFromRequest } from '@/lib/auth/session';
import { prisma } from '@/lib/db/prisma';
import { hasFeatureAccess, FeatureFlag } from '@/lib/subscriptions/types';

/**
 * POST /api/beta/join
 * Join a beta test for a game
 * Requires Pro subscription
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user has Pro subscription
    if (!hasFeatureAccess(session.user.subscriptionTier, FeatureFlag.BETA_ACCESS)) {
      return NextResponse.json(
        { error: 'Beta access requires Creator Support Pass subscription' },
        { status: 403 }
      );
    }

    const { gameId } = await request.json();

    if (!gameId) {
      return NextResponse.json({ error: 'Game ID is required' }, { status: 400 });
    }

    // Check if game exists and is in beta
    const game = await prisma.game.findUnique({
      where: { id: gameId },
      select: { id: true, releaseStatus: true, title: true },
    });

    if (!game) {
      return NextResponse.json({ error: 'Game not found' }, { status: 404 });
    }

    if (game.releaseStatus !== 'BETA') {
      return NextResponse.json(
        { error: 'This game is not in beta testing' },
        { status: 400 }
      );
    }

    // Check if already joined
    const existing = await prisma.betaTester.findUnique({
      where: {
        userId_gameId: {
          userId: session.user.id,
          gameId,
        },
      },
    });

    if (existing) {
      return NextResponse.json(
        { message: 'Already joined this beta test', tester: existing },
        { status: 200 }
      );
    }

    // Create beta tester record
    const tester = await prisma.betaTester.create({
      data: {
        userId: session.user.id,
        gameId,
      },
      include: {
        game: {
          select: {
            id: true,
            title: true,
            slug: true,
            coverUrl: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: `Successfully joined beta test for ${game.title}`,
      tester,
    });
  } catch (error: any) {
    console.error('POST /api/beta/join error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to join beta test' },
      { status: 500 }
    );
  }
}

