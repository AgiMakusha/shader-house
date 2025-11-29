import { NextRequest, NextResponse } from 'next/server';
import { getSessionFromRequest } from '@/lib/auth/session';
import { claimGame, canClaimGame } from '@/lib/subscriptions/utils';
import { prisma } from '@/lib/db/prisma';

export async function POST(req: NextRequest) {
  try {
    const session = await getSessionFromRequest(req);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { gameId } = await req.json();

    if (!gameId) {
      return NextResponse.json(
        { error: 'Game ID required' },
        { status: 400 }
      );
    }

    // Get user's subscription tier
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { subscriptionTier: true, subscriptionStatus: true },
    });

    if (!user || user.subscriptionStatus !== 'ACTIVE') {
      return NextResponse.json(
        { error: 'Active subscription required' },
        { status: 403 }
      );
    }

    // Check if user can claim
    const canClaim = await canClaimGame(session.user.id, gameId);
    if (!canClaim) {
      return NextResponse.json(
        { error: 'Cannot claim this game. Monthly limit reached or already claimed.' },
        { status: 400 }
      );
    }

    // Claim the game
    const claimed = await claimGame(
      session.user.id,
      gameId,
      user.subscriptionTier as any
    );

    return NextResponse.json({ success: true, claimed });
  } catch (error: any) {
    console.error('Error claiming game:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 400 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await getSessionFromRequest(req);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const gameId = searchParams.get('gameId');

    if (gameId) {
      // Check if user can claim a specific game
      const canClaim = await canClaimGame(session.user.id, gameId);
      return NextResponse.json({ canClaim });
    }

    // Get user's claimed games this month
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const claimedGames = await prisma.claimedGame.findMany({
      where: {
        userId: session.user.id,
        claimMonth: firstDayOfMonth,
      },
      include: {
        game: {
          include: {
            developer: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json({ claimedGames });
  } catch (error) {
    console.error('Error fetching claimed games:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

