import { NextRequest, NextResponse } from 'next/server';
import { getSessionFromRequest } from '@/lib/auth/session';
import { canAccessBeta } from '@/lib/subscriptions/utils';
import { prisma } from '@/lib/db/prisma';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: gameId } = await params;
    const session = await getSessionFromRequest(req);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const hasAccess = await canAccessBeta(session.user.id, gameId);

    return NextResponse.json({ hasAccess });
  } catch (error) {
    console.error('Error checking beta access:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/games/:id/beta-access
 * Enable or disable beta access for a game
 * Only the game owner can toggle beta access
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSessionFromRequest(request);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: gameId } = await params;
    const { isActive } = await request.json();

    // Verify game ownership
    const game = await prisma.game.findUnique({
      where: { id: gameId },
      select: { id: true, developerId: true },
    });

    if (!game) {
      return NextResponse.json({ error: 'Game not found' }, { status: 404 });
    }

    if (game.developerId !== session.user.id) {
      return NextResponse.json(
        { error: 'Unauthorized: Only the game owner can manage beta access' },
        { status: 403 }
      );
    }

    // Check if beta access record exists
    const existingBeta = await prisma.betaAccess.findFirst({
      where: { gameId },
    });

    if (existingBeta) {
      // Update existing record
      await prisma.betaAccess.update({
        where: { id: existingBeta.id },
        data: { isActive },
      });
    } else {
      // Create new beta access record
      await prisma.betaAccess.create({
        data: {
          gameId,
          isActive,
          maxTesters: 100, // Default max testers
        },
      });
    }

    return NextResponse.json({
      success: true,
      isActive,
      message: isActive ? 'Beta access enabled' : 'Beta access disabled',
    });
  } catch (error: any) {
    console.error('Beta access error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update beta access' },
      { status: 500 }
    );
  }
}

